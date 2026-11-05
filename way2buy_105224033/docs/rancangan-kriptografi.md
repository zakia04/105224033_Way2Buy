# Rancangan Komponen Kriptografi Way2Buy

Dokumen ini menjelaskan secara teknis perancangan komponen kriptografi untuk produk Way2Buy, khususnya perlindungan alamat pengiriman konsumen menggunakan algoritma AES-256-GCM.

---

## 1. Konteks Bisnis dan Aset Informasi

Way2Buy merupakan platform perantara pemesanan produk lokal (jastip). Konsumen menitipkan pembelian produk kepada jastiper lokal yang sedang berada di kota asal produk.

Dalam alur bisnis ini, konsumen memberikan informasi alamat pengiriman agar jastiper atau kurir dapat mengirimkan barang yang telah dibeli. Alamat pengiriman merupakan **Personally Identifiable Information (PII)** dan diklasifikasikan sebagai:

- **Aset D-05 (Data Pesanan)** dalam `security/asset-inventory.md`.
- **Kebutuhan Keamanan:** Kerahasiaan (*Confidentiality*) dan Integritas (*Integrity*).
- **Tingkat Prioritas:** Tinggi (*High*).

---

## 2. Model Ancaman (Threat Model STRIDE)

Berdasarkan analisis ancaman pada `security/threat-model.md`:

1. **T-09 — Akses Langsung Basis Data (Information Disclosure):**  
   Jika penyerang berhasil mengakses database Way2Buy melalui celah keamanan infrastruktur, alamat pengiriman konsumen tidak boleh terbaca dalam bentuk teks polos (*plaintext*).

2. **T-10 — Kebocoran Cadangan Basis Data (Backup Disclosure):**  
   Salinan cadangan database (Aset B-01 / F6) yang bocor atau dicuri penyerang tidak akan langsung mengekspos alamat konsumen karena data tersebut tersimpan dalam bentuk *ciphertext*. Perlindungan ini bergantung pada keamanan kunci enkripsi yang disimpan terpisah dari database.

3. **T-03 — Manipulasi Parameter Pesanan (Tampering):**  
   Pihak yang berusaha memanipulasi alamat pengiriman akan terdeteksi apabila perubahan dilakukan terhadap ciphertext atau authentication tag, karena perubahan tersebut menyebabkan verifikasi autentikasi gagal.

---

## 3. Spesifikasi Teknis Algoritma

```text
+-------------------------------------------------------------+
|                       AES-256-GCM                           |
|  - Cipher simetris blok : 128-bit                           |
|  - Panjang kunci        : 256-bit (32 byte)                 |
|  - Mode operasi         : Galois/Counter Mode (GCM)         |
|  - Panjang IV           : 96-bit (12 byte)                  |
|  - Authentication Tag   : 128-bit (16 byte)                 |
|  - Sumber keacakan      : CSPRNG (crypto.randomBytes)       |
|  - Representasi data    : Base64                            |
|  - Batas input          : 1 s.d. 500 karakter               |
|  - AAD                  : Tidak digunakan saat ini          |
+-------------------------------------------------------------+
```

### 3.1 Diagram Alir Enkripsi

```text
[ Alamat Plaintext ]
         |
         v
[ Validasi Input ]
         |
    (Gagal) ----------------> [ Throw Error ]
         |
      (Lolos)
         |
         v
[ Ambil dan Validasi Kunci ]
         |
         v
[ crypto.randomBytes(12) ]
         |
         v
[ IV (12 Byte) ]
         |
         v
[ createCipheriv('aes-256-gcm', key, iv) ]
         |
         v
[ update() + final() ]
         |
         v
[ Ciphertext Buffer ]
         |
         v
[ getAuthTag() ]
         |
         v
[ Authentication Tag (16 Byte) ]
         |
         v
[ Encode ke Base64 ]
         |
         v
[ EncryptedData { ciphertext, iv, authTag } ]
```

### 3.2 Diagram Alir Dekripsi

```text
[ EncryptedData { ciphertext, iv, authTag } ]
         |
         v
[ Validasi Objek dan Format Base64 ]
         |
    (Gagal) ----------------> [ Throw Error ]
         |
      (Lolos)
         |
         v
[ Validasi Kunci, IV, dan Auth Tag ]
         |
    (Gagal) ----------------> [ Throw Error ]
         |
      (Lolos)
         |
         v
[ createDecipheriv('aes-256-gcm', key, ivBuf) ]
         |
         v
[ decipher.setAuthTag(authTagBuf) ]
         |
         v
[ decipher.update() + decipher.final() ]
         |
         +---- (Autentikasi Berhasil) ---> [ Plaintext String ]
         |
         +---- (Autentikasi Gagal) ------> [ Throw Error ]
```

Proses dekripsi hanya mengembalikan plaintext setelah verifikasi authentication tag berhasil. Jika autentikasi gagal, proses dihentikan dan data tidak dikembalikan.

### 3.3 Validasi Input dan Parameter

Sebelum enkripsi dan dekripsi dilakukan, sistem menerapkan validasi berikut:

1. Alamat harus berupa string dan tidak boleh kosong.
2. Panjang alamat dibatasi maksimal 500 karakter.
3. Kunci harus tersedia dalam variabel lingkungan `WAY2BUY_ENCRYPTION_KEY`.
4. Kunci harus memiliki panjang tepat 32 byte setelah di-decode dari Base64.
5. Ciphertext, IV, dan authentication tag harus memiliki format Base64 yang valid.
6. IV harus memiliki panjang 12 byte.
7. Authentication tag harus memiliki panjang 16 byte.
8. Ciphertext tidak boleh kosong.

Validasi tersebut bertujuan mencegah pemrosesan data yang tidak sesuai dengan parameter algoritma. Jika validasi gagal, sistem menghasilkan error dan tidak melanjutkan proses.

---

## 4. Keamanan Kunci (Key Management)

### 4.1 Penyimpanan Kunci

Kunci enkripsi tidak ditulis langsung di dalam source code maupun disimpan dalam repositori Git. Kunci dibaca melalui variabel lingkungan:

```text
WAY2BUY_ENCRYPTION_KEY
```

Pada lingkungan pengembangan lokal, variabel tersebut dapat disimpan di `.env.local`, yang harus dikecualikan dari repositori melalui `.gitignore`.

File `.env.example` hanya berisi placeholder konfigurasi dan tidak boleh berisi kunci asli.

### 4.2 Pembangkitan Kunci Acak

Kunci AES-256 dapat dibangkitkan menggunakan modul `node:crypto` dengan perintah:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Perintah tersebut menghasilkan 32 byte data acak kriptografis yang direpresentasikan dalam format Base64.

Hasil pembangkitan harus disimpan sebagai secret di luar repositori. Kunci asli tidak boleh dibagikan atau dimasukkan ke dalam dokumentasi.

### 4.3 Pemisahan Lingkungan dan Pengujian

Pengujian otomatis pada `tests/crypto.test.ts` menggunakan kunci sintetis yang dibangkitkan secara dinamis saat runtime pengujian. Dengan demikian, pengujian tidak menggunakan kunci produksi dan tidak bergantung pada penyimpanan secret eksternal.

### 4.4 Penggantian Kunci

Kunci yang digunakan untuk mengenkripsi data pesanan yang sudah tersimpan harus dipertahankan agar data lama tetap dapat didekripsi.

Pergantian kunci tidak boleh dilakukan secara langsung tanpa strategi migrasi atau enkripsi ulang terhadap data yang masih menggunakan kunci lama.

---

## 5. Penggunaan Additional Authenticated Data (AAD)

AES-GCM mendukung *Additional Authenticated Data* (AAD), yaitu data tambahan yang tidak dienkripsi tetapi ikut dilindungi oleh proses autentikasi.

Pada implementasi Way2Buy saat ini, AAD belum digunakan. Keputusan ini diambil untuk mempertahankan kompatibilitas dengan lima data pesanan terenkripsi yang sudah tersimpan sebelumnya.

Penambahan AAD tanpa mekanisme versi dan migrasi dapat menyebabkan data lama gagal didekripsi. Apabila AAD diperlukan pada pengembangan berikutnya, penerapannya harus disertai versi format ciphertext dan strategi migrasi data.

---

## 6. Parameter dan Batasan Keamanan

| Parameter | Nilai Implementasi | Keterangan |
|---|---|---|
| Algoritma | AES-256-GCM | Enkripsi terautentikasi |
| Panjang kunci | 256-bit (32 byte) | Dibaca dari environment variable |
| Panjang IV | 96-bit (12 byte) | Dibangkitkan menggunakan CSPRNG |
| Authentication tag | 128-bit (16 byte) | Digunakan untuk verifikasi integritas |
| Encoding plaintext | UTF-8 | Representasi teks sebelum enkripsi |
| Encoding penyimpanan | Base64 | Representasi ciphertext, IV, dan tag |
| Batas input | 1–500 karakter | Divalidasi sebelum enkripsi |
| AAD | Tidak digunakan | Mempertahankan kompatibilitas data lama |

IV dibangkitkan menggunakan `crypto.randomBytes(12)`. Penggunaan CSPRNG mengurangi kemungkinan IV yang sama terpakai kembali, tetapi tidak menjamin keunikan mutlak. Oleh karena itu, penggunaan IV tetap perlu mempertimbangkan batas jumlah enkripsi dengan kunci yang sama.

IV acak juga tidak secara langsung mencegah *replay attack*. Pencegahan replay memerlukan mekanisme tambahan pada tingkat aplikasi, seperti pencatatan nonce, timestamp, atau validasi status transaksi.

---

## 7. Kesimpulan Rancangan

Komponen kriptografi Way2Buy dirancang menggunakan AES-256-GCM dengan kunci 256-bit, IV 96-bit, dan authentication tag 128-bit. Implementasi memanfaatkan modul resmi `node:crypto` dari Node.js.

Perlindungan difokuskan pada alamat pengiriman konsumen sebagai aset D-05. Kunci disimpan di luar repositori melalui variabel lingkungan, sedangkan input dan parameter kriptografi divalidasi sebelum diproses.

Penggunaan AES-256-GCM memberikan perlindungan kerahasiaan dan integritas. Jika ciphertext, authentication tag, atau kunci tidak sesuai, proses dekripsi ditolak. AAD belum digunakan untuk menjaga kompatibilitas dengan data pesanan yang telah terenkripsi sebelumnya.