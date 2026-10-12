# Evaluasi Keamanan Produk Way2Buy: Komponen Kriptografi (AES-256-GCM)

Dokumen ini memuat dokumentasi evaluasi keamanan dan komponen kriptografi produk Way2Buy yang sebelumnya berada pada halaman web laboratorium `/kripto`. Dokumen ini diselaraskan dengan inventarisasi aset (`security/asset-inventory.md`), analisis ancaman STRIDE (`security/threat-model.md`), dan register risiko (`security/risk-register.md`).

---

## Ringkasan Eksekutif

- **Algoritma Terpilih:** **AES-256-GCM** (*Advanced Encryption Standard* - *Galois/Counter Mode*)
- **Pustaka Kriptografi:** Pustaka resmi dan terpercaya **`node:crypto`** bawaan Node.js (didukung oleh *engine* OpenSSL)
- **Standar Kriptografi:** **NIST SP 800-38D**
- **Fokus Perlindungan:** **Alamat Pengiriman Konsumen (Aset D-05)**
- **Tujuan Keamanan (CIA):** **Kerahasiaan (*Confidentiality*)** & **Integritas (*Integrity*)** (AEAD)

---

## 1. Tabel Kebutuhan Keamanan Data Produk

Berdasarkan inventarisasi aset (`security/asset-inventory.md`) dan pemodelan ancaman STRIDE (`security/threat-model.md`):

| ID Aset | Aset Data | Data yang Dilindungi | Tujuan Keamanan | Prioritas | Mitigasi Ancaman |
|:-------:|:----------|:---------------------|:----------------|:---------:|:-----------------|
| **D-05** | Data pesanan | **Alamat pengiriman konsumen** *(Fokus Implementasi)* | Kerahasiaan & Integritas | **Tinggi** | **T-03** (Tampering pesanan), **T-09** (Akses basis data tak sah), **T-10** (Kebocoran salinan backup) |
| **D-06** | Data transaksi | Nominal, status, referensi transaksi | Integritas & Kerahasiaan | **Tinggi** | **T-08** (Pemalsuan respon gateway), **T-03** (Manipulasi transaksi) |
| **D-01** | Data akun konsumen | Informasi akun dan kontak konsumen | Kerahasiaan | **Tinggi** | **T-01** (Credential stuffing), **T-04** (SQL Injection) |

---

## 2. Alur Enkripsi, Dekripsi, dan Uji Integritas (Tampering Test)

### 2.1 Masukan Alamat Pengiriman (Data Sintetis)
Contoh data sintetis yang digunakan dalam pengujian:
```text
Jl. Malioboro No. 45, Danurejan, Kota Yogyakarta 55213
```

### 2.2 Format Keluaran Enkripsi (Representasi Base64)
Setiap enkripsi menghasilkan tiga komponen utama:

1. **Ciphertext (Data Terenkripsi):**
   - String Base64 yang merupakan hasil enkripsi plaintext alamat menggunakan kunci simetris 256-bit dan IV acak.
   - Contoh representasi: `aB7x...==`
2. **IV / Initialization Vector (12 Byte CSPRNG via OpenSSL):**
   - Panjang 96-bit (12 byte) sesuai rekomendasi NIST SP 800-38D untuk mode GCM.
   - Dihasilkan menggunakan `crypto.randomBytes(12)` dan selalu unik setiap kali enkripsi dilakukan.
3. **Authentication Tag (16 Byte GCM):**
   - Tag autentikasi 128-bit (16 byte) yang dihasilkan otomatis oleh mode GCM.
   - Berfungsi memvalidasi keaslian (*authenticity*) dan integritas (*integrity*) ciphertext.

### 2.3 Mekanisme Dekripsi & Verifikasi Integritas
1. Ciphertext, IV, dan Auth Tag diurai kembali dari representasi Base64 ke dalam buffer biner.
2. Cipher AES-256-GCM diinisialisasi dengan fungsi `createDecipheriv` menggunakan kunci simetris yang sama dan IV terkait.
3. Authentication Tag dipasang dengan `decipher.setAuthTag(authTagBuffer)`.
4. Jika ciphertext tidak pernah dimodifikasi, dekripsi berhasil dan mengembalikan plaintext asli secara utuh.

### 2.4 Simulasi Tampering (Modifikasi 1 Bit)
- **Skenario:** Penyerang mengubah 1 byte/karakter pada ciphertext di basis data atau jalur transit (serangan *Tampering* T-03).
- **Hasil Pengujian:** OpenSSL menolak proses dekripsi dan memicu exception:
  ```text
  Unsupported state or unable to authenticate data
  ```
- **Kesimpulan:** Mode GCM membuktikan bahwa manipulasi sekecil apapun akan langsung terdeteksi, sehingga alamat palsu tidak akan pernah diproses ke kurir/jastiper.

---

## 3. Parameter Teknis & Rancangan Komponen Awal

```
┌─────────────────────────────────────────────────────────────┐
│                    AES-256-GCM Parameters                   │
│  - Panjang Kunci : 256-bit (32 byte Buffer)                 │
│  - Panjang IV    : 96-bit (12 byte Buffer, CSPRNG)          │
│  - Auth Tag      : 128-bit (16 byte Buffer)                 │
│  - Encoding      : UTF-8 (Plaintext) -> Base64 (Storage)    │
│  - Batas Input   : 1 s.d. 500 karakter                      │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 Masukan–Proses–Keluaran
- **Masukan:** String alamat (1 s.d. 500 karakter) & Kunci simetris dari variabel lingkungan `WAY2BUY_ENCRYPTION_KEY`.
- **Proses:** Validasi batas input, pembangkitan CSPRNG IV 12B, enkripsi `createCipheriv('aes-256-gcm', ...)`, ekstraksi tag autentikasi 16B.
- **Keluaran:** Objek `EncryptedData` `{ ciphertext: string, iv: string, authTag: string }` seluruhnya dalam format Base64.

### 3.2 Sumber Keacakan (CSPRNG)
- **Pustaka:** `crypto.randomBytes()` bawaan resmi `node:crypto`.
- **Sumber Entropi:** *Cryptographically Secure Pseudo-Random Number Generator* dari kernel sistem operasi melalui OpenSSL.
- **Jaminan:** Nilai IV selalu baru dan acak pada setiap eksekusi, mencegah serangan pengulangan (*replay attack*) dan kebocoran pola enkripsi (*pattern leakage*). Fungsi non-kriptografis seperti `Math.random()` **sama sekali tidak digunakan**.

### 3.3 Kepatuhan & Pengujian Otomatis
- **Rangkaian Pengujian:** File pengujian otomatis berada pada [`tests/crypto.test.ts`](../tests/crypto.test.ts).
- **Total Skenario:** 8 skenario pengujian dengan 13 *assertions* mencakup uji positif, negatif, batas (500 & 501 karakter), integritas (tampering), dan keunikan IV.
- **Kerahasiaan Kunci:** Kunci pengujian 100% sintetis dibangkitkan secara dinamis saat runtime pengujian, tidak ada kunci rahasia (*hardcoded secret*) di dalam repositori git.
