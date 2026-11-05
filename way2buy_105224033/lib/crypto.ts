
/**
 * lib/crypto.ts
 *
 * Enkripsi dan dekripsi alamat pengiriman Way2Buy
 * menggunakan AES-256-GCM melalui node:crypto.
 *
 * Kunci dibaca dari WAY2BUY_ENCRYPTION_KEY.
 * Implementasi berjalan di sisi server.
 *
 * Parameter:
 * - Algoritma: AES-256-GCM
 * - Kunci: 256 bit (32 byte)
 * - IV: 96 bit (12 byte), dibuat menggunakan CSPRNG
 * - Authentication tag: 128 bit (16 byte)
 * - Encoding: Base64
 * - AAD: Tidak digunakan untuk menjaga kompatibilitas
 *   dengan data terenkripsi yang sudah tersimpan.
 */

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

export const CRYPTO_CONFIG = {
  ALGORITHM: "aes-256-gcm" as const,
  KEY_LENGTH: 32,
  IV_LENGTH: 12,
  AUTH_TAG_LENGTH: 16,
  MAX_ADDRESS_LENGTH: 500,
};

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
}

/**
 * Memvalidasi dan mengubah Base64 menjadi Buffer.
 * Hanya menerima format Base64 standar yang valid.
 */
function decodeBase64(value: unknown, fieldName: string): Buffer {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      value,
    )
  ) {
    throw new Error(`Format Base64 ${fieldName} tidak valid.`);
  }

  const decoded = Buffer.from(value, "base64");

  // Memastikan representasi Base64 bersifat kanonis.
  if (decoded.toString("base64") !== value) {
    throw new Error(`Format Base64 ${fieldName} tidak valid.`);
  }

  return decoded;
}

/**
 * Mengambil kunci enkripsi 256-bit dari environment
 * atau parameter khusus pengujian.
 */
export function getEncryptionKey(envKey?: string): Buffer {
  const raw = envKey ?? process.env.WAY2BUY_ENCRYPTION_KEY;

  if (typeof raw !== "string" || raw.trim().length === 0) {
    throw new Error(
      "Kunci enkripsi tidak ditemukan. Periksa WAY2BUY_ENCRYPTION_KEY.",
    );
  }

  const keyBuffer = decodeBase64(raw.trim(), "kunci enkripsi");

  if (keyBuffer.length !== CRYPTO_CONFIG.KEY_LENGTH) {
    throw new Error(
      `Panjang kunci harus ${CRYPTO_CONFIG.KEY_LENGTH} byte (256 bit).`,
    );
  }

  return keyBuffer;
}

/**
 * Memvalidasi alamat sebelum dienkripsi.
 */
export function validateAddress(input: unknown): asserts input is string {
  if (typeof input !== "string") {
    throw new Error("Alamat harus berupa string.");
  }

  if (input.trim().length === 0) {
    throw new Error("Alamat tidak boleh kosong.");
  }

  if (input.length > CRYPTO_CONFIG.MAX_ADDRESS_LENGTH) {
  throw new Error(
    `Panjang alamat melebihi batas maksimum (${CRYPTO_CONFIG.MAX_ADDRESS_LENGTH} karakter).`,
    );
  }
}

/**
 * Mengenkripsi alamat menggunakan AES-256-GCM.
 */
export function encryptAddress(
  address: string,
  keyBase64?: string,
): EncryptedData {
  // 1. Validasi alamat.
  validateAddress(address);

  // 2. Ambil kunci 256-bit.
  const key = getEncryptionKey(keyBase64);

  // 3. Buat IV acak menggunakan CSPRNG.
  const iv = randomBytes(CRYPTO_CONFIG.IV_LENGTH);

  // 4. Inisialisasi AES-256-GCM.
  const cipher = createCipheriv(
    CRYPTO_CONFIG.ALGORITHM,
    key,
    iv,
    {
      authTagLength: CRYPTO_CONFIG.AUTH_TAG_LENGTH,
    },
  );

  // 5. Enkripsi plaintext.
  const ciphertext = Buffer.concat([
    cipher.update(address, "utf8"),
    cipher.final(),
  ]);

  // 6. Ambil authentication tag.
  const authTag = cipher.getAuthTag();

  // 7. Kembalikan seluruh komponen dalam Base64.
  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

/**
 * Mendekripsi alamat dan memverifikasi integritasnya.
 *
 * Jika ciphertext, IV, authentication tag, atau kunci
 * tidak sesuai, proses akan dihentikan.
 */
export function decryptAddress(
  data: EncryptedData,
  keyBase64?: string,
): string {
  // 1. Validasi objek masukan.
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    throw new Error("Objek EncryptedData tidak valid.");
  }

  // 2. Ambil kunci enkripsi.
  const key = getEncryptionKey(keyBase64);

  // 3. Decode seluruh komponen Base64.
  const ciphertextBuf = decodeBase64(
    data.ciphertext,
    "ciphertext",
  );

  const ivBuf = decodeBase64(data.iv, "IV");

  const authTagBuf = decodeBase64(
    data.authTag,
    "authentication tag",
  );

  // 4. Validasi panjang setiap komponen.
  if (ciphertextBuf.length === 0) {
    throw new Error("Ciphertext tidak boleh kosong.");
  }

  if (ivBuf.length !== CRYPTO_CONFIG.IV_LENGTH) {
    throw new Error("Panjang IV tidak valid.");
  }

  if (authTagBuf.length !== CRYPTO_CONFIG.AUTH_TAG_LENGTH) {
    throw new Error("Panjang authentication tag tidak valid.");
  }

  // 5. Inisialisasi proses dekripsi.
  const decipher = createDecipheriv(
    CRYPTO_CONFIG.ALGORITHM,
    key,
    ivBuf,
    {
      authTagLength: CRYPTO_CONFIG.AUTH_TAG_LENGTH,
    },
  );

  decipher.setAuthTag(authTagBuf);

  // 6. Verifikasi autentikasi dan dekripsi.
  // decipher.final() akan gagal jika autentikasi tidak valid.
  const decrypted = Buffer.concat([
    decipher.update(ciphertextBuf),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
