import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const fallbackServiceAccountPath = path.resolve(
  currentDirectory,
  "../serviceAccountKey.json"
);

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

const sanitizeEntryId = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  const digitsOnly = value.replace(/\D/g, "");
  return /^(\d{4}|\d{6})$/.test(digitsOnly) ? digitsOnly : "";
};

const normalizePrivateKey = (value) =>
  typeof value === "string" ? value.replace(/\\n/g, "\n") : "";

const normalizeServiceAccountShape = (raw) => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  return {
    projectId: raw.projectId ?? raw.project_id ?? "",
    clientEmail: raw.clientEmail ?? raw.client_email ?? "",
    privateKey: normalizePrivateKey(raw.privateKey ?? raw.private_key ?? ""),
  };
};

const readServiceAccountFromEnv = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return normalizeServiceAccountShape(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    );
  }

  const projectId = process.env.FIREBASE_PROJECT_ID ?? "";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL ?? "";
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId && !clientEmail && !privateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
};

const loadServiceAccount = () => {
  const fromEnv = readServiceAccountFromEnv();

  if (fromEnv?.projectId && fromEnv?.clientEmail && fromEnv?.privateKey) {
    return fromEnv;
  }

  if (existsSync(fallbackServiceAccountPath)) {
    return normalizeServiceAccountShape(
      JSON.parse(readFileSync(fallbackServiceAccountPath, "utf8"))
    );
  }

  throw new Error(
    "Firebase Admin credentials are missing. Configure FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY."
  );
};

const createAdminApp = () => {
  const existing = getApps()[0];

  if (existing) {
    return existing;
  }

  const serviceAccount = loadServiceAccount();

  if (
    !serviceAccount?.projectId ||
    !serviceAccount?.clientEmail ||
    !serviceAccount?.privateKey
  ) {
    throw new Error("Firebase Admin credentials are incomplete.");
  }

  return initializeApp({
    credential: cert(serviceAccount),
  });
};

const adminApp = createAdminApp();

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

export const isApiError = (error) =>
  Boolean(error) &&
  typeof error === "object" &&
  Number.isInteger(error.statusCode) &&
  typeof error.message === "string";

export const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
};

export const readJsonBody = (req) => {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body || "{}");
    } catch {
      throw new ApiError(400, "Invalid JSON request body.");
    }
  }

  if (typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new ApiError(400, "Invalid request body.");
  }

  return req.body;
};

export const verifyGuestRequest = async (req, res) => {
  const rawAuthorizationHeader =
    req.headers.authorization ?? req.headers.Authorization;
  const authorizationHeader = Array.isArray(rawAuthorizationHeader)
    ? rawAuthorizationHeader[0]
    : rawAuthorizationHeader;

  if (
    typeof authorizationHeader !== "string" ||
    !authorizationHeader.startsWith("Bearer ")
  ) {
    sendJson(res, 401, {
      message: "Authentication required.",
    });
    return null;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(
      authorizationHeader.slice(7).trim()
    );
    const entryId = sanitizeEntryId(decodedToken.entryId);

    if (decodedToken.role !== "guest" || !entryId) {
      throw new Error("Invalid guest token claims");
    }

    return {
      entryId,
      guestName:
        typeof decodedToken.guestName === "string"
          ? decodedToken.guestName
          : "",
      guestGender:
        decodedToken.guestGender === "Male" ||
        decodedToken.guestGender === "Female"
          ? decodedToken.guestGender
          : "Unknown",
    };
  } catch (error) {
    console.error("Failed to verify guest token", {
      message: error instanceof Error ? error.message : String(error),
    });
    sendJson(res, 401, {
      message: "Your invite session has expired. Please log in again.",
    });
    return null;
  }
};
