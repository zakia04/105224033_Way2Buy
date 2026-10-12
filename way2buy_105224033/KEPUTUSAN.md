# Keputusan Desain Kriptografi (KEPUTUSAN.md)

Dokumen ini memuat catatan keputusan arsitektur (Architecture Decision Record / ADR) terkait pemilihan mekanisme kriptografi untuk melindungi data produk Way2Buy.

---

## 1. Pemilihan Algoritma Enkripsi Data

### Keputusan: Menggunakan AES-256-GCM (Galois/Counter Mode)

AES-256-GCM dipilih sebagai algoritma simetris utama untuk melindungi data alamat pengiriman konsumen (Aset D-05).

### Alasan Pemilihan:
1. **Authenticated Encryption with Associated Data (AEAD):**
   AES-GCM menyediakan dua jaminan keamanan sekaligus dalam satu operasi:
   - **Kerahasiaan (Confidentiality):** Mengubah data alamat sensitif menjadi ciphertext yang tidak dapat dibaca oleh pihak tanpa kunci.
   - **Integritas dan Autentikasi (Integrity & Authenticity):** Menghasilkan *Authentication Tag* (128 bit) yang memastikan bahwa ciphertext tidak diubah atau dirusak oleh penyerang saat disimpan atau ditransmisikan.
2. **Kinerja Tinggi:**
   Mode GCM dapat diparalelkan dan didukung oleh instruksi perangkat keras prosesor modern (AES-NI), sehingga memiliki latensi enkripsi/dekripsi yang sangat rendah (< 2 ms).
3. **Standar Global:**
   Sesuai rekomendasi NIST SP 800-38D dan standar industri modern.

### Perbandingan Alternatif yang Dipertimbangkan:

| Algoritma / Mode | Kerahasiaan | Integritas Bawaan | Alasan Ditolak / Tidak Dipilih |
|---|:---:|:---:|---|
| **Sandi Klasik** (Caesar, Vigenère, Playfair) | ❌ Tidak Memadai | ❌ Tidak Ada | **Ditolak keras sesuai ketentuan tugas.** Tidak tahan terhadap analisis frekuensi dan mudah dipecahkan dalam hitungan detik. |
| **AES-256-CBC** | ✅ Ya | ❌ Tidak | Tidak menyediakan autentikasi data. Rentan terhadap *Padding Oracle Attack* kecuali dipadukan dengan HMAC manual (meningkatkan kompleksitas implementasi). |
| **ChaCha20-Poly1305** | ✅ Ya | ✅ Ya | Bagus untuk perangkat mobile tanpa AES-NI, namun AES-256 didukung secara native lebih optimal pada server backend Node.js. |
| **RSA-2048 / RSA-4096** | ✅ Ya | ✅ Ya (Signature) | Enkripsi asimetris tidak efisien untuk enkripsi data langsung (lambat dan memiliki batas panjang data sesuai ukuran kunci). |

---

## 2. Pemilihan Panjang Kunci

### Keputusan: 256-bit (32 byte)

- **Marjin Keamanan:** Meskipun AES-128 masih aman saat ini, AES-256 memberikan marjin keamanan jangka panjang terhadap peningkatan kemampuan komputasi masa depan.
- **Efisiensi:** Perbedaan overhead kinerja antara AES-128 dan AES-256 pada volume data alamat pengiriman di Way2Buy tidak terasa (< 0.1 ms).

---

## 3. Pemilihan Panjang IV (Initialization Vector)

### Keputusan: 96-bit (12 byte)

- **Rekomendasi NIST SP 800-38D:** NIST merekomendasikan panjang IV tepat 96-bit untuk GCM.
- Jika panjang IV bukan 96 bit, algoritma harus menjalankan fungsi GHASH tambahan untuk menghitung IV efektif, yang menambah overhead dan meningkatkan risiko implementasi.
- **Keunikan:** IV dibangkitkan menggunakan CSPRNG sistem operasi (`crypto.randomBytes(12)`). IV tidak pernah digunakan ulang dengan kunci yang sama (*nonce*).

---

## 4. Representasi Data Keluaran

### Keputusan: Base64 Encoding

- Nilai biner dari ciphertext, IV, dan authentication tag dikonversi ke format string Base64.
- **Alasan:** Format Base64 aman ditransmisikan melalui payload JSON, disimpan pada kolom teks database (SQL/NoSQL), dan diintegrasikan pada antarmuka REST API tanpa masalah pengkodean karakter.

---

## 5. Strategi Pengelolaan Kunci & Rahasia (Secrets Management)

### Keputusan: Variabel Lingkungan Server (`WAY2BUY_ENCRYPTION_KEY`)

- Kunci enkripsi dibaca melalui `process.env.WAY2BUY_ENCRYPTION_KEY` pada saat runtime server.
- File konfigurasi lokal `.env.local` dikecualikan dari Git melalui `.gitignore`.
- Repositori hanya menyediakan contoh format pada [`.env.example`](./.env.example) dengan data sintetis/dummy.
- Untuk pengujian otomatis, kunci pengujian dibangkitkan secara acak dalam memori saat runtime pengujian dimulai, sehingga tidak ada kunci tetap yang terekspos.

---

## 6. Validasi Input Sebelum Enkripsi

### Keputusan: Validasi Ketat pada Sisi Server

- Masukan harus bertipe `string`.
- Masukan tidak boleh string kosong atau hanya spasi.
- Panjang maksimum dibatasi hingga 500 karakter untuk mencegah konsumsi memori berlebih (*Denial of Service* / DoS).
