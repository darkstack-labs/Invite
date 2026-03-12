import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

const sanitizeEntryId = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  const digitsOnly = value.replace(/\D/g, "");
  return /^(\d{4}|\d{6})$/.test(digitsOnly) ? digitsOnly : "";
};

const loadServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  const serviceAccountPath = path.resolve(
    currentDirectory,
    "../serviceAccountKey.json"
  );

  return JSON.parse(readFileSync(serviceAccountPath, "utf8"));
};

const adminApp =
  getApps()[0] ??
  initializeApp({
    credential: cert(loadServiceAccount()),
  });

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

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
    return JSON.parse(req.body || "{}");
  }

  return req.body;
};

export const verifyGuestRequest = async (req, res) => {
  const authorizationHeader =
    req.headers.authorization || req.headers.Authorization;

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
      throw new Error("Invalid guest token");
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
    console.error("Failed to verify guest token", error);
    sendJson(res, 401, {
      message: "Your invite session has expired. Please log in again.",
    });
    return null;
  }
};
