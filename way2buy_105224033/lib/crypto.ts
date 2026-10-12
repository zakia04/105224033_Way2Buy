/**
 * lib/crypto.ts
 *
 * Komponen kriptografi Way2Buy — enkripsi dan dekripsi alamat pengiriman
 * menggunakan AES-256-GCM melalui modul bawaan Node.js (node:crypto).
 *
 * Komponen ini berjalan di sisi server (server-side).
 * Kunci enkripsi dibaca dari variabel lingkungan WAY2BUY_ENCRYPTION_KEY.
 *
 * Parameter kriptografi:
 * - Algoritma   : aes-256-gcm (Authenticated Encryption with Associated Data)
 * - Panjang kunci: 256 bit (32 byte)
 * - Panjang IV   : 96 bit (12 byte) — sesuai rekomendasi NIST SP 800-38D
 * - Auth tag     : 128 bit (16 byte)
 * - Sumber acak  : CSPRNG sistem operasi via crypto.randomBytes()
 * - Representasi : Base64 untuk ciphertext, IV, dan auth tag
 *
 * Keterkaitan Aset & Keamanan:
 * - Aset Inventori : D-05 (Data Pesanan — Alamat Pengiriman Konsumen)
 * - Aspek CIA      : Kerahasiaan (Confidentiality) & Integritas (Integrity)
 * - Mitigasi Ancaman: T-03 (Tampering pesanan), T-09 (Akses langsung basis data), T-10 (Kebocoran cadangan data)
 */

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// ─────────────────────────────────────────────
// Konstanta Kriptografi
// ─────────────────────────────────────────────

export const CRYPTO_CONFIG = {
  ALGORITHM: "aes-256-gcm" as const,
  KEY_LENGTH: 32, // 256 bit
  IV_LENGTH: 12, // 96 bit (NIST SP 800-38D)
  AUTH_TAG_LENGTH: 16, // 128 bit
  MAX_ADDRESS_LENGTH: 500, // Batas panjang alamat (karakter)
};

// ─────────────────────────────────────────────
// Representasi Data (Tipe Data)
// ─────────────────────────────────────────────

/**
 * Hasil enkripsi yang berisi ciphertext, IV, dan authentication tag.
 * Seluruh nilai dikodekan dalam representasi string Base64.
 */
export interface EncryptedData {
  /** Ciphertext dalam representasi Base64 */
  ciphertext: string;
  /** Initialization vector (12 byte) dalam representasi Base64 */
  iv: string;
  /** Authentication tag (16 byte) dalam representasi Base64 */
  authTag: string;
}

// ─────────────────────────────────────────────
// Fungsi Pembantu & Validasi
// ─────────────────────────────────────────────

/**
 * Membaca kunci enkripsi dari variabel lingkungan WAY2BUY_ENCRYPTION_KEY
 * dan mengembalikannya sebagai Buffer 32 byte.
 *
 * @param envKey — Nilai kunci Base64 (opsional, untuk keperluan pengujian).
 *                 Jika tidak diberikan, membaca dari process.env.WAY2BUY_ENCRYPTION_KEY.
 * @throws Error jika kunci tidak ditemukan atau panjang tidak sama dengan 32 byte.
 */
export function getEncryptionKey(envKey?: string): Buffer {
  const raw = envKey ?? process.env.WAY2BUY_ENCRYPTION_KEY;

  if (!raw || raw.trim().length === 0) {
    throw new Error(
      "Kunci enkripsi tidak ditemukan. " +
        "Pastikan variabel lingkungan WAY2BUY_ENCRYPTION_KEY sudah diisi."
    );
  }

  const keyBuffer = Buffer.from(raw.trim(), "base64");

  if (keyBuffer.length !== CRYPTO_CONFIG.KEY_LENGTH) {
    throw new Error(
      `Panjang kunci tidak valid: diharapkan ${CRYPTO_CONFIG.KEY_LENGTH} byte, ` +
        `diterima ${keyBuffer.length} byte. ` +
        "Pastikan kunci berupa string Base64 dari 32 byte acak."
    );
  }

  return keyBuffer;
}

/**
 * Memvalidasi masukan alamat sebelum dilakukan proses enkripsi.
 *
 * Aturan validasi:
 * 1. Input harus bertipe string.
 * 2. Input tidak boleh kosong atau hanya berisi spasi.
 * 3. Panjang input tidak boleh melebihi MAX_ADDRESS_LENGTH karakter.
 *
 * @throws Error dengan pesan deskriptif jika validasi gagal.
 */
export function validateAddress(input: unknown): asserts input is string {
  if (typeof input !== "string") {
    throw new Error(
      `Input harus berupa string, diterima: ${typeof input}.`
    );
  }

  if (input.trim().length === 0) {
    throw new Error("Alamat tidak boleh kosong atau hanya berisi spasi.");
  }

  if (input.length > CRYPTO_CONFIG.MAX_ADDRESS_LENGTH) {
    throw new Error(
      `Panjang alamat melebihi batas maksimum (${CRYPTO_CONFIG.MAX_ADDRESS_LENGTH} karakter). ` +
        `Panjang saat ini: ${input.length} karakter.`
    );
  }
}

// ─────────────────────────────────────────────
// Fungsi Utama: Enkripsi & Dekripsi
// ─────────────────────────────────────────────

/**
 * Mengenkripsi alamat pengiriman menggunakan algoritma AES-256-GCM.
 *
 * Masukan:
 * - address: Alamat pengiriman (string)
 * - keyBase64 (opsional): Kunci 32 byte berformat Base64
 *
 * Proses:
 * 1. Validasi masukan alamat (tipe string, non-kosong, maks 500 karakter).
 * 2. Ambil kunci simetris 256-bit dari variabel lingkungan atau parameter.
 * 3. Bangkitkan IV acak 12 byte via CSPRNG `randomBytes(12)`.
 * 4. Inisialisasi cipher AES-256-GCM dan lakukan enkripsi plaintext.
 * 5. Ekstrak authentication tag 16 byte dari cipher.
 * 6. Encode ciphertext, IV, dan authentication tag ke format Base64.
 *
 * Keluaran:
 * - EncryptedData { ciphertext, iv, authTag }
 *
 * @param address — Alamat pengiriman yang akan dienkripsi.
 * @param keyBase64 — Kunci Base64 opsional (untuk unit testing).
 * @returns EncryptedData — Objek berisi ciphertext, iv, dan authTag.
 */
export function encryptAddress(
  address: string,
  keyBase64?: string
): EncryptedData {
  // 1. Validasi masukan
  validateAddress(address);

  // 2. Ambil kunci simetris
  const key = getEncryptionKey(keyBase64);

  // 3. Bangkitkan IV acak via CSPRNG
  const iv = randomBytes(CRYPTO_CONFIG.IV_LENGTH);

  // 4. Inisialisasi cipher AES-256-GCM dan enkripsi
  const cipher = createCipheriv(CRYPTO_CONFIG.ALGORITHM, key, iv, {
    authTagLength: CRYPTO_CONFIG.AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(address, "utf8"),
    cipher.final(),
  ]);

  // 5. Ambil authentication tag
  const authTag = cipher.getAuthTag();

  // 6. Kembalikan representasi Base64
  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
}

/**
 * Mendekripsi ciphertext kembali menjadi plaintext alamat pengiriman.
 *
 * Masukan:
 * - data: Objek EncryptedData { ciphertext, iv, authTag }
 * - keyBase64 (opsional): Kunci 32 byte berformat Base64
 *
 * Proses:
 * 1. Validasi kelengkapan parameter objek masukan.
 * 2. Ambil kunci simetris 256-bit.
 * 3. Decode ciphertext, IV, dan authentication tag dari format Base64 ke Buffer.
 * 4. Inisialisasi decipher AES-256-GCM dan atur authentication tag.
 * 5. Lakukan verifikasi integritas dan dekripsi data.
 *
 * Verifikasi Integritas:
 * Jika ciphertext diubah atau auth tag tidak sesuai, OpenSSL akan melempar
 * error autentikasi dan membatalkan proses dekripsi.
 *
 * Keluaran:
 * - Plaintext alamat (string UTF-8)
 *
 * @param data — Objek EncryptedData yang berisi ciphertext, iv, dan authTag.
 * @param keyBase64 — Kunci Base64 opsional (untuk unit testing).
 * @returns string — Alamat pengiriman plaintext.
 */
export function decryptAddress(
  data: EncryptedData,
  keyBase64?: string
): string {
  // 1. Validasi masukan
  if (!data || typeof data !== "object") {
    throw new Error(
      "Parameter dekripsi tidak valid: objek EncryptedData diperlukan."
    );
  }

  if (!data.ciphertext || !data.iv || !data.authTag) {
    throw new Error(
      "Data terenkripsi tidak lengkap: ciphertext, iv, dan authTag wajib ada."
    );
  }

  // 2. Ambil kunci simetris
  const key = getEncryptionKey(keyBase64);

  // 3. Decode Base64 ke buffer
  const ciphertextBuf = Buffer.from(data.ciphertext, "base64");
  const ivBuf = Buffer.from(data.iv, "base64");
  const authTagBuf = Buffer.from(data.authTag, "base64");

  // 4. Inisialisasi decipher dan pasang auth tag
  const decipher = createDecipheriv(CRYPTO_CONFIG.ALGORITHM, key, ivBuf, {
    authTagLength: CRYPTO_CONFIG.AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTagBuf);

  // 5. Dekripsi dan verifikasi keaslian (autentikasi)
  const decrypted = Buffer.concat([
    decipher.update(ciphertextBuf),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
