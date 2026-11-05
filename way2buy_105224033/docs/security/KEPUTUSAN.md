# Keputusan Desain Kriptografi (KEPUTUSAN.md)

Dokumen ini memuat catatan keputusan arsitektur (*Architecture Decision Record / ADR*) terkait pemilihan mekanisme kriptografi untuk melindungi data produk Way2Buy, khususnya alamat pengiriman konsumen yang termasuk Aset D-05.

---

## 1. Pemilihan Algoritma Enkripsi Data

### Keputusan: Menggunakan AES-256-GCM (Galois/Counter Mode)

AES-256-GCM dipilih sebagai algoritma simetris utama untuk melindungi data alamat pengiriman konsumen (Aset D-05).

### Alasan Pemilihan

1. **Authenticated Encryption with Associated Data (AEAD)**

   AES-GCM menyediakan dua jaminan keamanan sekaligus dalam satu operasi:
   - **Kerahasiaan (Confidentiality):** Mengubah alamat sensitif menjadi ciphertext yang tidak dapat dibaca tanpa kunci yang sesuai.
   - **Integritas dan Autentikasi (Integrity & Authenticity):** Menghasilkan *Authentication Tag* yang digunakan untuk memverifikasi bahwa ciphertext tidak mengalami perubahan.

2. **Kinerja**

   AES-GCM merupakan mode enkripsi terautentikasi yang banyak digunakan dan didukung oleh pustaka kriptografi Node.js melalui OpenSSL.

3. **Standar Global**

   AES-GCM mengacu pada rekomendasi NIST SP 800-38D.

### Perbandingan Alternatif yang Dipertimbangkan

| Algoritma / Mode | Kerahasiaan | Integritas Bawaan | Alasan Tidak Dipilih |
|---|---|---|---|
| Sandi klasik (Caesar, Vigenère, Playfair) | Tidak memadai | Tidak ada | Tidak memenuhi kebutuhan keamanan modern dan mudah dianalisis. |
| AES-256-CBC | Ya | Tidak | Membutuhkan mekanisme autentikasi tambahan seperti HMAC. |
| ChaCha20-Poly1305 | Ya | Ya | Merupakan alternatif AEAD yang baik, tetapi implementasi Way2Buy menggunakan AES-256-GCM. |
| RSA-2048 / RSA-4096 | Ya | Tidak secara langsung pada enkripsi | Lebih sesuai untuk kebutuhan kriptografi asimetris seperti pertukaran kunci dan tanda tangan digital daripada enkripsi langsung data alamat. |

---

## 2. Pemilihan Panjang Kunci

### Keputusan: 256-bit (32 byte)

Kunci AES menggunakan panjang 256 bit atau 32 byte.

Alasan pemilihan:
- Memberikan tingkat keamanan yang kuat untuk perlindungan data sensitif.
- Sesuai dengan algoritma AES-256.
- Ukuran data alamat pengiriman pada Way2Buy tidak memerlukan optimasi khusus yang mengharuskan penggunaan panjang kunci lebih pendek.

Kunci dibangkitkan menggunakan CSPRNG dan direpresentasikan dalam format Base64.

---

## 3. Pemilihan Panjang IV (Initialization Vector)

### Keputusan: 96-bit (12 byte)

IV menggunakan panjang 96 bit atau 12 byte sesuai rekomendasi NIST SP 800-38D untuk AES-GCM.

Alasan pemilihan:
- Panjang 96 bit merupakan panjang IV yang direkomendasikan untuk penggunaan GCM.
- IV dibangkitkan menggunakan `crypto.randomBytes(12)`.
- CSPRNG menghasilkan IV secara acak sehingga mengurangi risiko penggunaan IV yang sama pada setiap proses enkripsi.

IV harus berbeda untuk setiap proses enkripsi menggunakan kunci yang sama. Penggunaan ulang IV pada GCM dengan kunci yang sama dapat membahayakan kerahasiaan dan integritas data.

---

## 4. Representasi Data Keluaran

### Keputusan: Base64 Encoding

Nilai biner dari ciphertext, IV, dan authentication tag dikonversi ke format string Base64.

Alasan pemilihan:
- Aman digunakan dalam payload JSON.
- Dapat disimpan pada kolom teks basis data.
- Memudahkan integrasi dengan REST API.
- Mempermudah proses pengiriman dan pembacaan data terenkripsi.

Struktur data yang digunakan:

```typescript
interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
}
```

Ketiga komponen disimpan secara terpisah pada tabel `Order`, yaitu:
- `destinationCiphertext`
- `destinationIv`
- `destinationAuthTag`

---

## 5. Strategi Pengelolaan Kunci dan Rahasia (Secrets Management)

### Keputusan: Menggunakan Variabel Lingkungan Server

Kunci enkripsi dibaca melalui variabel lingkungan `WAY2BUY_ENCRYPTION_KEY` pada sisi server.

Ketentuan pengelolaan kunci:

1. Kunci dibangkitkan menggunakan CSPRNG dengan panjang 32 byte.
2. Hasil pembangkitan kunci dikodekan dalam Base64.
3. Kunci disimpan di file `.env.local` atau konfigurasi lingkungan server.
4. File `.env.local` dikecualikan dari Git melalui `.gitignore`.
5. Repository hanya menyediakan `.env.example` sebagai template konfigurasi tanpa kunci produksi.
6. Pengujian otomatis menggunakan kunci sintetis yang dibangkitkan secara acak saat runtime.
7. Kunci yang digunakan untuk mengenkripsi pesanan lama tidak boleh diganti tanpa proses migrasi dan enkripsi ulang yang terencana.

Contoh pembangkitan kunci:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

---

## 6. Validasi Input Sebelum Enkripsi dan Dekripsi

### Keputusan: Validasi Ketat pada Sisi Server

Validasi dilakukan sebelum data diproses oleh fungsi enkripsi maupun dekripsi.

**Validasi alamat:**
- Masukan harus bertipe `string`.
- Masukan tidak boleh kosong atau hanya berisi spasi.
- Panjang maksimum dibatasi hingga 500 karakter.

**Validasi kunci:**
- Kunci harus tersedia melalui `WAY2BUY_ENCRYPTION_KEY`.
- Format Base64 harus valid.
- Hasil decoding harus tepat 32 byte.

**Validasi data dekripsi:**
- Objek `EncryptedData` harus tersedia dan memiliki komponen yang lengkap.
- Ciphertext harus memiliki format Base64 yang valid.
- IV harus tepat 12 byte.
- Authentication tag harus tepat 16 byte.

Jika salah satu validasi gagal, sistem menghentikan proses dan menghasilkan error. Sistem tidak mengembalikan plaintext apabila verifikasi autentikasi gagal (*fail closed*).

---

## 7. Penggunaan Additional Authenticated Data (AAD)

### Keputusan: AAD Tidak Digunakan pada Implementasi Saat Ini

AES-GCM mendukung penggunaan Additional Authenticated Data (AAD), yaitu data tambahan yang ikut diautentikasi tetapi tidak dienkripsi.

Pada implementasi Way2Buy saat ini, AAD tidak digunakan.

Alasan keputusan:
- Basis data Way2Buy sudah memiliki lima pesanan yang dienkripsi menggunakan format AES-256-GCM tanpa AAD.
- Penambahan AAD secara langsung akan menyebabkan data lama gagal diverifikasi apabila didekripsi menggunakan konfigurasi baru.
- Mempertahankan format sebelumnya diperlukan agar kompatibilitas data pesanan tetap terjaga.

Walaupun AAD tidak digunakan, AES-256-GCM tetap memberikan autentikasi dan integritas terhadap ciphertext melalui authentication tag.

Jika penggunaan AAD diperlukan pada pengembangan berikutnya, penerapannya harus disertai mekanisme versi enkripsi dan strategi migrasi agar data lama tetap dapat diproses.

---

## 8. Pengujian Keamanan

### Keputusan: Menggunakan Pengujian Otomatis

Pengujian otomatis dilakukan melalui `tests/crypto.test.ts` menggunakan Node.js built-in test runner (`node:test`).

Pengujian mencakup:

| No. | Skenario Pengujian | Hasil |
|---|---|---|
| 1 | Enkripsi alamat valid | Lulus |
| 2 | Dekripsi ciphertext valid | Lulus |
| 3 | Input kosong ditolak | Lulus |
| 4 | Input bukan string ditolak | Lulus |
| 5 | Alamat melebihi batas 500 karakter ditolak | Lulus |
| 6 | Ciphertext yang dimodifikasi ditolak | Lulus |
| 7 | Authentication tag yang tidak sesuai ditolak | Lulus |
| 8 | Dua proses enkripsi menghasilkan IV berbeda | Lulus |
| 9 | Kunci enkripsi yang salah ditolak | Lulus |
| 10 | IV dengan panjang tidak valid ditolak | Lulus |
| 11 | Authentication tag dengan panjang tidak valid ditolak | Lulus |
| 12 | Format Base64 tidak valid ditolak | Lulus |

**Hasil pengujian terakhir:**
- Jumlah skenario: 12
- Jumlah assertions: 17
- Pengujian berhasil: 17
- Pengujian gagal: 0

Perintah untuk menjalankan pengujian:

```bash
npm test
```

---

## 9. Kesimpulan

AES-256-GCM dipilih sebagai mekanisme perlindungan alamat pengiriman konsumen pada Way2Buy karena menyediakan kerahasiaan, integritas, dan autentikasi data dalam satu mekanisme.

Implementasi menggunakan kunci 256-bit, IV acak 96-bit, authentication tag 128-bit, serta CSPRNG melalui modul bawaan Node.js `node:crypto`.

Validasi input, pengelolaan kunci melalui variabel lingkungan, dan pengujian terhadap perubahan ciphertext maupun penggunaan kunci yang salah menjadi bagian dari penerapan keamanan.

Implementasi tetap mempertahankan kompatibilitas terhadap lima pesanan yang telah tersimpan dengan tidak mengubah format enkripsi yang digunakan sebelumnya.