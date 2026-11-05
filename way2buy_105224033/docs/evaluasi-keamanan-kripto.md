# Evaluasi Keamanan Produk Way2Buy: Komponen Kriptografi (AES-256-GCM)

Dokumen ini memuat evaluasi keamanan dan dokumentasi komponen kriptografi produk Way2Buy yang sebelumnya tersedia pada halaman web laboratorium `/kripto`. Dokumentasi diselaraskan dengan inventarisasi aset (`security/asset-inventory.md`), analisis ancaman STRIDE (`security/threat-model.md`), dan register risiko (`security/risk-register.md`).

---

## Ringkasan Eksekutif

- **Algoritma Terpilih:** AES-256-GCM (*Advanced Encryption Standard – Galois/Counter Mode*).
- **Pustaka Kriptografi:** Modul resmi `node:crypto` bawaan Node.js yang didukung oleh OpenSSL.
- **Standar Kriptografi:** NIST SP 800-38D.
- **Fokus Perlindungan:** Alamat pengiriman konsumen (Aset D-05).
- **Tujuan Keamanan (CIA):** Kerahasiaan (*Confidentiality*) dan integritas (*Integrity*) melalui mekanisme AEAD (*Authenticated Encryption with Associated Data*).

---

## 1. Tabel Kebutuhan Keamanan Data Produk

Berdasarkan inventarisasi aset (`security/asset-inventory.md`) dan pemodelan ancaman STRIDE (`security/threat-model.md`):

| ID Aset | Aset Data | Data yang Dilindungi | Tujuan Keamanan | Prioritas | Mitigasi Ancaman |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **D-05** | Data pesanan | **Alamat pengiriman konsumen (Fokus Implementasi)** | Kerahasiaan dan Integritas | **Tinggi** | **T-03** (Tampering pesanan), **T-09** (Akses basis data tak sah), **T-10** (Kebocoran salinan backup) |
| **D-06** | Data transaksi | Nominal, status, referensi transaksi | Integritas dan Kerahasiaan | **Tinggi** | **T-08** (Pemalsuan respons gateway), **T-03** (Manipulasi transaksi) |
| **D-01** | Data akun konsumen | Informasi akun dan kontak konsumen | Kerahasiaan | **Tinggi** | **T-01** (Credential stuffing), **T-04** (SQL Injection) |

Implementasi enkripsi pada tugas ini berfokus pada aset D-05, yaitu alamat pengiriman konsumen.

---

## 2. Alur Enkripsi, Dekripsi, dan Uji Integritas (Tampering Test)

### 2.1 Masukan Alamat Pengiriman (Data Sintetis)

Contoh data sintetis yang digunakan dalam pengujian:

```text
Jl. Malioboro No. 45, Danurejan, Kota Yogyakarta 55213
```

Alamat tersebut merupakan data dummy untuk demonstrasi dan bukan data pribadi konsumen.

### 2.2 Format Keluaran Enkripsi (Representasi Base64)

Setiap proses enkripsi menghasilkan tiga komponen utama:

1. **Ciphertext (Data Terenkripsi)**
   - Berupa string Base64 yang merupakan hasil enkripsi plaintext alamat menggunakan kunci simetris 256-bit dan IV.
   - Contoh representasi: `aB7x...==`.

2. **IV / Initialization Vector (12 Byte CSPRNG)**
   - Memiliki panjang 96-bit atau 12 byte, sesuai parameter yang digunakan pada implementasi AES-GCM.
   - Dibangkitkan menggunakan `crypto.randomBytes(12)`.
   - Penggunaan IV acak mengurangi kemungkinan penggunaan IV yang sama. Namun, keacakan tidak memberikan jaminan matematis bahwa IV tidak akan pernah bertabrakan.

3. **Authentication Tag (16 Byte GCM)**
   - Memiliki panjang 128-bit atau 16 byte.
   - Dihasilkan otomatis oleh mode GCM.
   - Digunakan untuk memverifikasi autentikasi dan integritas data ketika proses dekripsi dilakukan.

Ketiga komponen disimpan dalam bentuk Base64 agar dapat direpresentasikan sebagai string pada penyimpanan data.

### 2.3 Mekanisme Dekripsi dan Verifikasi Integritas

1. Ciphertext, IV, dan authentication tag diurai dari representasi Base64 menjadi buffer biner.
2. Kunci diperoleh dari variabel lingkungan `WAY2BUY_ENCRYPTION_KEY`.
3. Cipher AES-256-GCM diinisialisasi menggunakan `createDecipheriv` dengan kunci dan IV yang sesuai.
4. Authentication tag dipasang menggunakan `decipher.setAuthTag(authTagBuf)`.
5. Proses dekripsi diselesaikan menggunakan `decipher.final()`.

Jika ciphertext, authentication tag, atau kunci tidak sesuai, proses verifikasi gagal dan dekripsi ditolak. Plaintext hanya dikembalikan setelah autentikasi berhasil.

### 2.4 Simulasi Tampering (Modifikasi Data)

- **Skenario:** Penyerang mengubah ciphertext atau authentication tag yang tersimpan di basis data atau dikirim melalui jalur komunikasi. Skenario ini berkaitan dengan ancaman *Tampering* T-03.
- **Hasil Pengujian:** Proses dekripsi gagal pada tahap verifikasi autentikasi dan menghasilkan exception.
- **Contoh pesan kesalahan:**

```text
Unsupported state or unable to authenticate data
```

- **Kesimpulan:** AES-256-GCM dapat mendeteksi perubahan pada ciphertext atau authentication tag. Data yang gagal melewati verifikasi autentikasi tidak dikembalikan sebagai plaintext oleh fungsi dekripsi.

---

## 3. Parameter Teknis dan Rancangan Komponen

```text
┌─────────────────────────────────────────────────────────────┐
│                    AES-256-GCM Parameters                   │
│  - Panjang Kunci : 256-bit (32 byte Buffer)                 │
│  - Panjang IV    : 96-bit (12 byte Buffer, CSPRNG)          │
│  - Auth Tag      : 128-bit (16 byte Buffer)                 │
│  - Encoding      : UTF-8 (Plaintext) -> Base64 (Storage)    │
│  - Batas Input   : 1 s.d. 500 karakter                      │
│  - AAD           : Tidak digunakan pada implementasi saat ini│
└─────────────────────────────────────────────────────────────┘
```

### 3.1 Masukan–Proses–Keluaran

- **Masukan:** String alamat dengan panjang 1 sampai 500 karakter dan kunci simetris yang diperoleh dari variabel lingkungan `WAY2BUY_ENCRYPTION_KEY`.
- **Proses:** Validasi input, pengambilan kunci, pembangkitan IV acak sepanjang 12 byte menggunakan CSPRNG, enkripsi menggunakan `createCipheriv('aes-256-gcm', ...)`, dan ekstraksi authentication tag sepanjang 16 byte.
- **Keluaran:** Objek `EncryptedData` dengan struktur `{ ciphertext: string, iv: string, authTag: string }` yang seluruh nilainya direpresentasikan dalam format Base64.

### 3.2 Pengelolaan Kunci

Kunci enkripsi menggunakan panjang 256-bit atau 32 byte. Kunci diperoleh melalui variabel lingkungan `WAY2BUY_ENCRYPTION_KEY`, bukan ditulis langsung di dalam source code.

Kunci harus dibangkitkan menggunakan sumber acak kriptografis yang aman dan disimpan di luar repositori. File `.env.local` digunakan untuk konfigurasi lokal dan tidak boleh diunggah ke Git. File `.env.example` hanya berisi contoh konfigurasi atau placeholder, bukan kunci asli.

Penggunaan kunci yang berbeda dari kunci saat enkripsi akan menyebabkan proses verifikasi dan dekripsi gagal. Kunci yang digunakan untuk mengenkripsi data pesanan yang sudah tersimpan juga harus dipertahankan. Pergantian kunci memerlukan proses migrasi atau enkripsi ulang data agar data lama tetap dapat dibaca.

### 3.3 Sumber Keacakan (CSPRNG)

- **Pustaka:** `crypto.randomBytes()` dari modul resmi `node:crypto`.
- **Penggunaan:** Menghasilkan IV sepanjang 12 byte untuk setiap proses enkripsi.
- **Keamanan:** CSPRNG menghasilkan nilai acak yang sesuai untuk kebutuhan kriptografi. Penggunaan IV acak mengurangi risiko penggunaan ulang IV, tetapi tidak menjamin bahwa tabrakan tidak mungkin terjadi.
- **Batasan:** IV acak tidak dengan sendirinya mencegah *replay attack*. Pencegahan replay membutuhkan mekanisme tambahan pada tingkat aplikasi, seperti pencatatan nonce, timestamp, atau validasi status transaksi.
- **Catatan:** Fungsi non-kriptografis seperti `Math.random()` tidak digunakan untuk menghasilkan IV.

### 3.4 Penggunaan AAD

AES-GCM mendukung *Additional Authenticated Data* (AAD), yaitu data tambahan yang ikut diverifikasi integritasnya tetapi tidak dienkripsi.

Pada implementasi saat ini, AAD tidak digunakan. Keputusan ini mempertahankan kompatibilitas dengan lima data pesanan terenkripsi yang sudah tersimpan sebelumnya. Penambahan AAD tanpa mekanisme versi dan migrasi dapat menyebabkan data lama gagal didekripsi.

Jika AAD diperlukan pada pengembangan berikutnya, penerapannya perlu disertai versi format ciphertext dan strategi migrasi data.

### 3.5 Kepatuhan dan Pengujian Otomatis

- **Rangkaian Pengujian:** File pengujian otomatis berada pada `tests/crypto.test.ts`.
- **Total Skenario:** 12 skenario pengujian dengan 17 assertion.
- **Hasil Pengujian Terakhir:** 17 pengujian berhasil dan 0 pengujian gagal.

Skenario pengujian mencakup:

1. Enkripsi dan dekripsi alamat berhasil.
2. Enkripsi dan dekripsi teks Unicode.
3. Penolakan input kosong.
4. Penolakan input dengan tipe data yang tidak sesuai.
5. Validasi batas maksimum 500 karakter.
6. Penolakan input yang melebihi 500 karakter.
7. Deteksi perubahan ciphertext.
8. Penolakan authentication tag yang tidak sesuai.
9. Penolakan penggunaan kunci yang salah.
10. Penolakan panjang IV yang tidak valid.
11. Penolakan panjang authentication tag yang tidak valid.
12. Penolakan ciphertext dengan format Base64 yang tidak valid.

Pengujian menggunakan kunci dan data sintetis yang dibangkitkan saat runtime. Kunci pengujian tidak menggunakan kunci produksi dan tidak disimpan sebagai secret di dalam repositori Git.

---

## 4. Kesimpulan Evaluasi

Berdasarkan rancangan dan pengujian yang dilakukan, implementasi AES-256-GCM pada Way2Buy telah menyediakan perlindungan kerahasiaan dan integritas untuk alamat pengiriman konsumen (D-05).

Implementasi menggunakan kunci 256-bit, IV acak 96-bit, dan authentication tag 128-bit. Validasi input serta pemeriksaan format data dilakukan sebelum proses dekripsi. Apabila kunci atau data autentikasi tidak sesuai, proses dekripsi ditolak sehingga plaintext tidak dikembalikan.

Hasil pengujian otomatis terakhir menunjukkan 12 skenario dengan 17 assertion berhasil dijalankan tanpa kegagalan. Dengan demikian, komponen kriptografi telah memenuhi kebutuhan dasar perlindungan data yang menjadi fokus implementasi tugas ini.