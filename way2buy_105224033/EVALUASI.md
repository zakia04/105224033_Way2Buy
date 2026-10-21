# Evaluasi Pengujian Komponen Kriptografi (EVALUASI.md)

Dokumen ini mendokumentasikan lingkungan eksekusi pengujian, skenario uji otomatis, hasil yang diharapkan, dan hasil aktual dari komponen kriptografi produk Way2Buy sesuai kriteria penilaian K4.

---

## 1. Lingkungan Pengujian

| Parameter               | Spesifikasi                                                                         |
| ----------------------- | ----------------------------------------------------------------------------------- |
| **Runtime**             | Node.js v20+ / Node.js LTS                                                          |
| **Framework Pengujian** | `node:test` (bawaan Node.js) dan `assert/strict`                                    |
| **TypeScript Loader**   | `tsx` (`npx tsx --test tests/crypto.test.ts`)                                       |
| **File Pengujian**      | [`tests/crypto.test.ts`](./tests/crypto.test.ts)                                    |
| **Perintah Pengujian**  | `npm test`                                                                          |
| **Kunci Pengujian**     | Kunci sintetis 256-bit dibangkitkan dinamis saat runtime (`crypto.randomBytes(32)`) |
| **Data Uji**            | Data alamat sintetis nusantara (bukan data pribadi nyata)                           |

---

## 2. Ringkasan Eksekusi Pengujian

```text
▶ Skenario 1 — Enkripsi alamat valid
  ✔ harus menghasilkan ciphertext, IV, dan authTag dalam format Base64 (1.52ms)
✔ Skenario 1 — Enkripsi alamat valid (2.41ms)

▶ Skenario 2 — Dekripsi ciphertext valid
  ✔ harus mengembalikan alamat yang sama persis dengan alamat awal (0.42ms)
  ✔ harus berhasil untuk alamat dengan karakter Unicode / aksen nusantara (0.24ms)
✔ Skenario 2 — Dekripsi ciphertext valid (0.81ms)

▶ Skenario 3 — Input kosong ditolak
  ✔ harus melempar error untuk string kosong (0.58ms)
  ✔ harus melempar error untuk string yang hanya berisi spasi/whitespace (0.15ms)
✔ Skenario 3 — Input kosong ditolak (0.87ms)

▶ Skenario 4 — Input bukan string ditolak
  ✔ harus melempar error untuk input bertipe number (0.21ms)
  ✔ harus melempar error untuk input null (0.16ms)
  ✔ harus melempar error untuk input undefined (0.14ms)
✔ Skenario 4 — Input bukan string ditolak (0.72ms)

▶ Skenario 5 — Alamat melebihi batas panjang
  ✔ harus melempar error untuk alamat lebih dari 500 karakter (501 karakter) (0.24ms)
  ✔ harus berhasil untuk alamat tepat batas maksimum 500 karakter (0.28ms)
✔ Skenario 5 — Alamat melebihi batas panjang (0.69ms)

▶ Skenario 6 — Ciphertext yang diubah ditolak
  ✔ harus gagal dekripsi jika ciphertext dimodifikasi (tampering 1 bit) (0.32ms)
✔ Skenario 6 — Ciphertext yang diubah ditolak (0.41ms)

▶ Skenario 7 — Authentication tag tidak sesuai
  ✔ harus gagal dekripsi jika auth tag diganti dengan nilai palsu (0.29ms)
✔ Skenario 7 — Authentication tag tidak sesuai (0.38ms)

▶ Skenario 8 — Dua enkripsi menghasilkan IV berbeda
  ✔ harus menggunakan IV baru (CSPRNG) pada setiap operasi enkripsi (0.36ms)
✔ Skenario 8 — Dua enkripsi menghasilkan IV berbeda (0.44ms)

ℹ tests 13
ℹ suites 8
ℹ pass 13
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ duration_ms ~520ms
```

---

## 3. Matriks Skenario Pengujian Rinci

|  No   | Skenario                  |     Jenis      | Masukan                                        | Hasil Diharapkan                                                 | Hasil Aktual                                       |    Status    |
| :---: | :------------------------ | :------------: | :--------------------------------------------- | :--------------------------------------------------------------- | :------------------------------------------------- | :----------: |
| **1** | Enkripsi alamat valid     |  **Positif**   | Alamat sintetis (string 81 char)               | Ciphertext ≠ Plaintext, IV = 12 byte, AuthTag = 16 byte (Base64) | Seluruh properti terbentuk lengkap dan terenkripsi | ✅ **Lulus** |
| **2** | Dekripsi ciphertext valid |  **Positif**   | Ciphertext valid & string Unicode aksen daerah | Plaintext identik dengan aslinya                                 | Berhasil didekripsi tanpa korupsi karakter         | ✅ **Lulus** |
| **3** | Input kosong ditolak      |  **Negatif**   | `""` dan `"   "`                               | Error: _"tidak boleh kosong"_                                    | Validasi melempar error sesuai ekspektasi          | ✅ **Lulus** |
| **4** | Input non-string ditolak  |  **Negatif**   | `12345`, `null`, `undefined`                   | Error: _"harus berupa string"_                                   | Validasi melempar error pada setiap tipe invalid   | ✅ **Lulus** |
| **5** | Uji batas panjang         |   **Batas**    | String 501 char & 500 char                     | 501 ditolak, 500 diterima                                        | Tepat 500 berhasil; 501 ditolak                    | ✅ **Lulus** |
| **6** | Ciphertext dimodifikasi   | **Integritas** | Ciphertext valid di-flip 1 bit                 | OpenSSL GCM melempar auth failure                                | Dekripsi digagalkan secara otomatis                | ✅ **Lulus** |
| **7** | Auth tag palsu            | **Integritas** | Auth tag diganti string acak                   | OpenSSL GCM melempar auth failure                                | Dekripsi digagalkan secara otomatis                | ✅ **Lulus** |
| **8** | Keacakan IV (CSPRNG)      |  **Keacakan**  | Plaintext sama dienkripsi 2 kali               | IV unik, ciphertext unik, dekripsi cocok                         | Terbukti menggunakan IV acak baru setiap saat      | ✅ **Lulus** |

---

## 4. Evaluasi Kepatuhan Rubrik (Rubrik R1)

1. **Ketentuan Minimum Uji:** Syarat minimum adalah 4 skenario uji dengan minimal 3 berhasil dan minimal 1 uji negatif/batas. Repositori ini menyediakan **8 skenario uji otomatis (13 assertions)** dan seluruhnya **100% Lulus (0 fail)**.
2. **Uji Negatif & Batas:** Mencakup penolakan input kosong (Skenario 3), tipe non-string (Skenario 4), dan uji batas 500 vs 501 karakter (Skenario 5).
3. **Uji Integritas & Autentikasi:** Mencakup pengujian perusakan 1 bit ciphertext (Skenario 6) dan pemalsuan authentication tag (Skenario 7).
4. **Keamanan Tanpa Secrets:** Seluruh pengujian menggunakan kunci acak yang dibangkitkan pada memori saat pengujian berlangsung (`randomBytes(32)`).
