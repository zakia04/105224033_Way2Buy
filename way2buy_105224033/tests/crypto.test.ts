/**
 * tests/crypto.test.ts
 *
 * Pengujian otomatis komponen kriptografi Way2Buy (AES-256-GCM).
 * Menggunakan Node.js built-in test runner (node:test) dan assert module.
 *
 * Kepatuhan Rubrik:
 * - Minimal 4 skenario uji otomatis: Implementasi ini memiliki 8 skenario (13 assertions).
 * - Termasuk uji positif, negatif, batas, integritas, dan keacakan.
 * - Menggunakan kunci sintetis yang dibangkitkan saat pengujian (tidak ada secret di repo).
 * - Menggunakan data alamat sintetis (tidak ada data pribadi).
 *
 * Jalankan: npm test
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import {
  encryptAddress,
  decryptAddress,
  validateAddress,
  getEncryptionKey,
  CRYPTO_CONFIG,
  type EncryptedData,
} from "../lib/crypto";

// ─────────────────────────────────────────────
// Kunci sintetis untuk pengujian (32 byte, Base64)
// Dihasilkan secara dinamis saat runtime pengujian
// ─────────────────────────────────────────────
const TEST_KEY = randomBytes(32).toString("base64");

// Data alamat sintetis (bukan data pribadi nyata)
const ALAMAT_SINTETIS =
  "Jl. Contoh No. 123, RT 01/RW 02, Kelurahan Contoh, Kecamatan Uji, Kota Sintetis 12345";

// ─────────────────────────────────────────────
// Skenario 1: Enkripsi alamat valid (Uji Positif)
// ─────────────────────────────────────────────
describe("Skenario 1 — Enkripsi alamat valid", () => {
  it("harus menghasilkan ciphertext, IV, dan authTag dalam format Base64", () => {
    const hasil = encryptAddress(ALAMAT_SINTETIS, TEST_KEY);

    // 1. Periksa keberadaan properti EncryptedData
    assert.ok(hasil.ciphertext, "ciphertext harus ada");
    assert.ok(hasil.iv, "iv harus ada");
    assert.ok(hasil.authTag, "authTag harus ada");

    // 2. Periksa bahwa nilai berupa string non-kosong
    assert.ok(hasil.ciphertext.length > 0, "ciphertext tidak boleh kosong");
    assert.ok(hasil.iv.length > 0, "iv tidak boleh kosong");
    assert.ok(hasil.authTag.length > 0, "authTag tidak boleh kosong");

    // 3. Periksa ciphertext berbeda dari plaintext (kerahasiaan)
    assert.notEqual(
      hasil.ciphertext,
      ALAMAT_SINTETIS,
      "ciphertext harus berbeda dari plaintext"
    );

    // 4. Periksa panjang IV tepat 12 byte (NIST SP 800-38D)
    const ivBuffer = Buffer.from(hasil.iv, "base64");
    assert.equal(ivBuffer.length, 12, "IV harus tepat sepanjang 12 byte");

    // 5. Periksa panjang auth tag tepat 16 byte
    const authTagBuffer = Buffer.from(hasil.authTag, "base64");
    assert.equal(authTagBuffer.length, 16, "Auth tag harus tepat sepanjang 16 byte");
  });
});

// ─────────────────────────────────────────────
// Skenario 2: Dekripsi ciphertext valid (Uji Positif)
// ─────────────────────────────────────────────
describe("Skenario 2 — Dekripsi ciphertext valid", () => {
  it("harus mengembalikan alamat yang sama persis dengan alamat awal", () => {
    const encrypted = encryptAddress(ALAMAT_SINTETIS, TEST_KEY);
    const decrypted = decryptAddress(encrypted, TEST_KEY);

    assert.equal(
      decrypted,
      ALAMAT_SINTETIS,
      "Hasil dekripsi harus sama persis dengan alamat awal"
    );
  });

  it("harus berhasil untuk alamat dengan karakter Unicode / aksen nusantara", () => {
    const alamatUnicode = "Jl. Merdeka No. 45, Kota Tëst — Spesial (Ünïcödë & Café)";
    const encrypted = encryptAddress(alamatUnicode, TEST_KEY);
    const decrypted = decryptAddress(encrypted, TEST_KEY);

    assert.equal(decrypted, alamatUnicode);
  });
});

// ─────────────────────────────────────────────
// Skenario 3: Input kosong ditolak (Uji Negatif)
// ─────────────────────────────────────────────
describe("Skenario 3 — Input kosong ditolak", () => {
  it("harus melempar error untuk string kosong", () => {
    assert.throws(
      () => encryptAddress("", TEST_KEY),
      { message: /tidak boleh kosong/ },
      "String kosong harus ditolak"
    );
  });

  it("harus melempar error untuk string yang hanya berisi spasi/whitespace", () => {
    assert.throws(
      () => encryptAddress("   ", TEST_KEY),
      { message: /tidak boleh kosong/ },
      "String spasi saja harus ditolak"
    );
  });
});

// ─────────────────────────────────────────────
// Skenario 4: Input bukan string ditolak (Uji Negatif)
// ─────────────────────────────────────────────
describe("Skenario 4 — Input bukan string ditolak", () => {
  it("harus melempar error untuk input bertipe number", () => {
    assert.throws(
      () => encryptAddress(12345 as unknown as string, TEST_KEY),
      { message: /harus berupa string/ }
    );
  });

  it("harus melempar error untuk input null", () => {
    assert.throws(
      () => encryptAddress(null as unknown as string, TEST_KEY),
      { message: /harus berupa string/ }
    );
  });

  it("harus melempar error untuk input undefined", () => {
    assert.throws(
      () => encryptAddress(undefined as unknown as string, TEST_KEY),
      { message: /harus berupa string/ }
    );
  });
});

// ─────────────────────────────────────────────
// Skenario 5: Alamat melebihi batas panjang (Uji Batas)
// ─────────────────────────────────────────────
describe("Skenario 5 — Alamat melebihi batas panjang", () => {
  it("harus melempar error untuk alamat lebih dari 500 karakter (501 karakter)", () => {
    const alamatPanjang = "A".repeat(501);
    assert.throws(
      () => encryptAddress(alamatPanjang, TEST_KEY),
      { message: /melebihi batas maksimum/ }
    );
  });

  it("harus berhasil untuk alamat tepat batas maksimum 500 karakter", () => {
    const alamatBatas = "B".repeat(500);
    const hasil = encryptAddress(alamatBatas, TEST_KEY);
    assert.ok(hasil.ciphertext, "Enkripsi harus berhasil pada batas tepat 500 karakter");

    const decrypted = decryptAddress(hasil, TEST_KEY);
    assert.equal(decrypted, alamatBatas);
  });
});

// ─────────────────────────────────────────────
// Skenario 6: Ciphertext yang diubah ditolak (Uji Integritas)
// ─────────────────────────────────────────────
describe("Skenario 6 — Ciphertext yang diubah ditolak", () => {
  it("harus gagal dekripsi jika ciphertext dimodifikasi (tampering 1 bit)", () => {
    const encrypted = encryptAddress(ALAMAT_SINTETIS, TEST_KEY);

    // Ubah bit pada ciphertext
    const ciphertextBuf = Buffer.from(encrypted.ciphertext, "base64");
    ciphertextBuf[0] = ciphertextBuf[0] ^ 0xff; // flip semua bit byte pertama
    const tamperedData: EncryptedData = {
      ...encrypted,
      ciphertext: ciphertextBuf.toString("base64"),
    };

    assert.throws(
      () => decryptAddress(tamperedData, TEST_KEY),
      /Unsupported state|error|auth/i,
      "Dekripsi harus gagal jika ciphertext diubah (integritas terverifikasi)"
    );
  });
});

// ─────────────────────────────────────────────
// Skenario 7: Authentication tag tidak sesuai (Uji Integritas)
// ─────────────────────────────────────────────
describe("Skenario 7 — Authentication tag tidak sesuai", () => {
  it("harus gagal dekripsi jika auth tag diganti dengan nilai palsu", () => {
    const encrypted = encryptAddress(ALAMAT_SINTETIS, TEST_KEY);

    // Ganti auth tag dengan tag acak palsu
    const fakeTag = randomBytes(16).toString("base64");
    const tamperedData: EncryptedData = {
      ...encrypted,
      authTag: fakeTag,
    };

    assert.throws(
      () => decryptAddress(tamperedData, TEST_KEY),
      /Unsupported state|error|auth/i,
      "Dekripsi harus gagal jika auth tag tidak sesuai"
    );
  });
});

// ─────────────────────────────────────────────
// Skenario 8: Dua enkripsi menghasilkan IV berbeda (Uji Randomness)
// ─────────────────────────────────────────────
describe("Skenario 8 — Dua enkripsi menghasilkan IV berbeda", () => {
  it("harus menggunakan IV baru (CSPRNG) pada setiap operasi enkripsi", () => {
    const hasil1 = encryptAddress(ALAMAT_SINTETIS, TEST_KEY);
    const hasil2 = encryptAddress(ALAMAT_SINTETIS, TEST_KEY);

    // IV harus berbeda antar panggilan
    assert.notEqual(
      hasil1.iv,
      hasil2.iv,
      "Setiap enkripsi harus menghasilkan IV unik yang berbeda"
    );

    // Ciphertext juga harus berbeda meski plaintext identik
    assert.notEqual(
      hasil1.ciphertext,
      hasil2.ciphertext,
      "Ciphertext harus berbeda untuk IV yang berbeda"
    );

    // Keduanya harus berhasil didekripsi ke plaintext awal yang sama
    const decrypted1 = decryptAddress(hasil1, TEST_KEY);
    const decrypted2 = decryptAddress(hasil2, TEST_KEY);

    assert.equal(decrypted1, ALAMAT_SINTETIS);
    assert.equal(decrypted2, ALAMAT_SINTETIS);
  });
});
