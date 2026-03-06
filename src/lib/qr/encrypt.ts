import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const key = process.env.QR_ENCRYPTION_KEY;
  if (!key) throw new Error("QR_ENCRYPTION_KEY is not set");
  return Buffer.from(key, "hex");
}

export interface QRPayload {
  ticketId: string;
  orderId: string;
  courseId: string;
  userId: string;
  userName: string;
  courseName: string;
  eventDate: string;
  issuedAt: string;
}

export function encryptPayload(payload: QRPayload): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(JSON.stringify(payload), "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag();

  // Combine: iv (16) + authTag (16) + encrypted data
  const combined = Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, "base64"),
  ]);

  return combined.toString("base64url");
}

export function decryptPayload(encryptedString: string): QRPayload {
  const combined = Buffer.from(encryptedString, "base64url");

  const iv = combined.subarray(0, 16);
  const authTag = combined.subarray(16, 32);
  const encrypted = combined.subarray(32);

  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, undefined, "utf8");
  decrypted += decipher.final("utf8");

  return JSON.parse(decrypted);
}
