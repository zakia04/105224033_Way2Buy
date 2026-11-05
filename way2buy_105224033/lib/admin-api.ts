import { timingSafeEqual } from "node:crypto";

export function getAdminTokenError(request: Request): string | null {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) {
    return "CRUD admin belum dikonfigurasi: ADMIN_API_TOKEN belum diatur.";
  }

  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!provided) {
    return "Token admin diperlukan.";
  }

  const expectedBytes = Buffer.from(expected);
  const providedBytes = Buffer.from(provided);
  if (
    expectedBytes.length !== providedBytes.length ||
    !timingSafeEqual(expectedBytes, providedBytes)
  ) {
    return "Token admin tidak valid.";
  }

  return null;
}

export function prismaErrorCode(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string" &&
    /^P\d{4}$/.test(error.code)
  ) {
    return error.code;
  }

  return null;
}

export function verifyAdminToken(token: string): string | null {
  const expected = process.env.ADMIN_API_TOKEN;

  if (!expected) {
    return "CRUD admin belum dikonfigurasi: ADMIN_API_TOKEN belum diatur.";
  }

  if (typeof token !== "string" || !token) {
    return "Token admin diperlukan.";
  }

  const expectedBytes = Buffer.from(expected);
  const providedBytes = Buffer.from(token);

  if (
    expectedBytes.length !== providedBytes.length ||
    !timingSafeEqual(expectedBytes, providedBytes)
  ) {
    return "Token admin tidak valid.";
  }

  return null;
}