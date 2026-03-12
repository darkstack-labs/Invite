import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

function sanitizeEntryId(value: unknown): string {
  if (typeof value !== "string") return "";

  const digitsOnly = value.replace(/\D/g, "");
  return /^(\d{4}|\d{6})$/.test(digitsOnly) ? digitsOnly : "";
}

function loadServiceAccount() {
  if (process.env.FIREBASE_PROJECT_ID) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    };
  }

  const serviceAccountPath = path.resolve(
    currentDirectory,
    "../serviceAccountKey.json"
  );

  return JSON.parse(readFileSync(serviceAccountPath, "utf8"));
}

const serviceAccount = loadServiceAccount();

const adminApp =
  getApps()[0] ??
  initializeApp({
    credential: cert(serviceAccount as any),
  });

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

export function sendJson(res: any, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

export function readJsonBody(req: any) {
  if (!req.body) return {};

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }

  return req.body;
}

export async function verifyGuestRequest(req: any, res: any) {
  const authorizationHeader =
    req.headers.authorization || req.headers.Authorization;

  if (
    typeof authorizationHeader !== "string" ||
    !authorizationHeader.startsWith("Bearer ")
  ) {
    sendJson(res, 401, { message: "Authentication required." });
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
}