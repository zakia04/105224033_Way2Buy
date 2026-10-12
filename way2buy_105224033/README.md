# Way2Buy — Marketplace Jasa Titip Produk Lokal

[![Version](https://img.shields.io/badge/version-v0.1-blue.svg)](https://github.com)
[![Framework](https://img.shields.io/badge/Next.js-16%20%7C%20React%2019-black.svg)](https://nextjs.org/)
[![Styling](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Crypto](https://img.shields.io/badge/encryption-AES--256--GCM-green.svg)](https://nodejs.org/api/crypto.html)
[![Tests](https://img.shields.io/badge/tests-8%20suites%20%7C%2013%20passed-success.svg)](./EVALUASI.md)
[![Accessibility](https://img.shields.io/badge/Lighthouse_A11y-96%2F100-success.svg)](./evidence/LIGHTHOUSE.md)

Way2Buy adalah platform marketplace jasa titip (jastip) produk lokal dari berbagai daerah di Indonesia yang menghubungkan konsumen dengan jastiper lokal terpercaya. Melalui platform ini, konsumen dapat mencari dan memesan kuliner, kriya, fashion, serta oleh-oleh khas nusantara tanpa harus mendatangi kota asal secara fisik.

---
## DAFTAR ISI

1. [Bagian I: Konsep Produk & Pengembangan Web (Milestone 1)](#bagian-i-konsep-produk--pengembangan-web-milestone-1)
   - [1.1 Konsep & Nama Produk](#11-konsep--nama-produk)
   - [1.2 Permasalahan yang Diselesaikan](#12-permasalahan-yang-diselesaikan)
   - [1.3 Sasaran Pengguna](#13-sasaran-pengguna)
   - [1.4 Fungsi Utama & Fitur Awal](#14-fungsi-utama--fitur-awal)
   - [1.5 Halaman Aplikasi](#15-halaman-aplikasi)
   - [1.6 Komponen Antarmuka Reusable](#16-komponen-antarmuka-reusable)
   - [1.7 Mock Data Produk](#17-mock-data-produk)
   - [1.8 Formulir & Validasi Sisi Klien](#18-formulir--validasi-sisi-klien)
   - [1.9 Desain Responsif](#19-desain-responsif)
   - [1.10 Aksesibilitas Web](#110-aksesibilitas-web)
   - [1.11 Struktur Direktori Proyek](#111-struktur-direktori-proyek)
2. [Bagian II: Kebutuhan & Rancangan Komponen Kriptografi (Rubrik R1)](#bagian-ii-kebutuhan--rancangan-komponen-kriptografi-rubrik-r1)
   - [2.1 Kebutuhan Kriptografi Produk (K1)](#21-kebutuhan-kriptografi-produk-k1)
   - [2.2 Justifikasi Pemilihan Komponen & Pustaka](#22-justifikasi-pemilihan-komponen--pustaka)
   - [2.3 Rancangan Komponen Kriptografi (K2)](#23-rancangan-komponen-kriptografi-k2)
   - [2.4 Implementasi Komponen (K3)](#24-implementasi-komponen-k3)
   - [2.5 Skenario Uji Otomatis dan Hasil (K4)](#25-skenario-uji-otomatis-dan-hasil-k4)
   - [2.6 Kepatuhan Keamanan & Data Sintetis](#26-kepatuhan-keamanan--data-sintetis)
   - [2.7 Panduan Demonstrasi Pekan 3 (±3 Menit) (K5)](#27-panduan-demonstrasi-pekan-3-3-menit-k5)
3. [Bagian III: Cara Menjalankan Aplikasi & Pengujian](#bagian-iii-cara-menjalankan-aplikasi--pengujian)
4. [Bagian IV: Bukti Pengerjaan (Evidence)](#bagian-iv-bukti-pengerjaan-evidence)
5. [Bagian V: Informasi Rilis & Pengumpulan (Tag v0.1)](#bagian-v-informasi-rilis--pengumpulan-tag-v01)

---

## BAGIAN I: KONSEP PRODUK & PENGEMBANGAN WEB (MILESTONE 1)

### 1.1 Konsep & Nama Produk
- **Nama Produk:** **Way2Buy** (*Way to Buy Local Goods*)
- **Deskripsi:** Platform penghubung konsumen dengan jastiper terpercaya untuk memesan dan membeli produk lokal khas daerah di seluruh Indonesia secara aman dan terstruktur.
- **Visi:** Mendekatkan kekayaan produk lokal nusantara ke tangan konsumen di mana pun mereka berada, sekaligus memberdayakan pelaku UMKM daerah dan komunitas jastiper lokal.

### 1.2 Permasalahan yang Diselesaikan
1. **Keterbatasan Akses Geografis:** Banyak kuliner legendaris dan kerajinan khas daerah yang tidak tersedia di e-commerce nasional konvensional karena masa simpan, kendala distribusi langsung, atau ketiadaan toko daring dari perajin aslinya.
2. **Risiko Penipuan Jastip Informal:** Praktik jastip yang marak melalui media sosial (Instagram/Twitter/WhatsApp) rentan terhadap penipuan transfer dana, barang tidak sesuai, dan pembatalan sepihak tanpa jaminan.
3. **Ketiadaan Perlindungan Privasi Alamat:** Praktik informal mengekspos alamat pengiriman dan kontak konsumen dalam percakapan terbuka tanpa enkripsi.

### 1.3 Sasaran Pengguna
- **Konsumen (Pembeli):**
  - Perantau yang merindukan makanan atau barang khas kampung halaman.
  - Wisatawan yang ingin membeli oleh-oleh tanpa repot membawa bagasi berlebih.
  - Penikmat kuliner, kriya, fesyen lokal yang mencari keaslian produk.
- **Jastiper Lokal (Penyedia Jasa):**
  - Individu atau kurir yang sedang atau sering berada di kota destinasi tertentu dan ingin memperoleh penghasilan tambahan melalui jasa pembelian dan pengiriman barang.

### 1.4 Fungsi Utama & Fitur Awal
- **Jelajahi Katalog Produk:** Melihat kurasi produk khas daerah berdasarkan kategori (*Makanan*, *Minuman*, *Fashion*, *Oleh-oleh*) dan kota asal.
- **Pencarian Produk Cepat:** Filter nama produk dan daerah secara *real-time* di sisi klien.
- **Pengajuan Permintaan Titip:** Formulir pemesanan produk titipan dengan validasi data masukan secara *real-time*.
- **Integrasi Keamanan Kriptografi:** Enkripsi alamat pengiriman konsumen secara otomatis di sisi server menggunakan AES-256-GCM saat formulir dikirimkan.

---

### 1.5 Halaman Aplikasi
Aplikasi terdiri dari **3 halaman utama** yang saling terhubung melalui navigasi header dan footer:

| No | Rute Halaman | File Sumber | Fungsi dan Keterkaitan Alur Penggunaan |
|:--:|:---|:---|:---|
| 1 | **Beranda** (`/`) | [`app/page.tsx`](./app/page.tsx) | *Landing page* yang menyajikan *hero banner*, nilai keunggulan produk (tiga langkah cara titip), kurasi produk populer, dan ajakan aksi (*Call-to-Action*). |
| 2 | **Jelajahi Produk** (`/produk`) | [`app/produk/page.tsx`](./app/produk/page.tsx) | Katalog interaktif yang memungkinkan pengguna memfilter kategori, mencari produk berdasarkan teks nama/kota, dan melihat detail harga serta rating. |
| 3 | **Cara Titip & Formulir** (`/titip`) | [`app/titip/page.tsx`](./app/titip/page.tsx) | Halaman transaksional yang memuat panduan titip dan formulir permintaan titip barang dengan validasi klien dan proteksi kriptografi. |

---

### 1.6 Komponen Antarmuka Reusable
Struktur antarmuka dibangun menggunakan **7 komponen modular yang dapat digunakan ulang (*reusable*)**:

1. **`SiteHeader`** ([`app/components/SiteHeader.tsx`](./app/components/SiteHeader.tsx)):
   - Navigasi utama dengan penanda status aktif (*active indicator*), tautan rute dinamis, tombol **Daftar / Masuk**, dan status login pengguna.
2. **`SiteFooter`** ([`app/components/SiteFooter.tsx`](./app/components/SiteFooter.tsx)):
   - Komponen kaki halaman yang memuat identitas merek, slogan, dan hak cipta platform.
3. **`ProductCard`** ([`app/components/ProductCard.tsx`](./app/components/ProductCard.tsx)):
   - Kartu produk yang menampilkan ikon ilustrasi khas, kategori, nama produk, kota asal, harga terformat rupiah, rating bintang, dan tombol aksi pemesanan langsung.
4. **`ProductArtwork`** ([`app/components/ProductArtwork.tsx`](./app/components/ProductArtwork.tsx)):
   - Komponen presentasi visual dan *badge* ilustrasi produk dengan latar belakang warna pastel tematik.
5. **`ProductCatalog`** ([`app/components/ProductCatalog.tsx`](./app/components/ProductCatalog.tsx)):
   - Komponen pengelola katalog yang mengintegrasikan bilah pencarian teks dan tombol pil filter kategori secara reaktif di sisi klien.
6. **`RequestForm`** ([`app/components/RequestForm.tsx`](./app/components/RequestForm.tsx)):
   - Formulir pemesanan lengkap dengan validasi komprehensif, umpan balik pesan kesalahan, pengiriman API, serta verifikasi dekripsi kriptografi interaktif.
7. **`AuthModal`** ([`app/components/AuthModal.tsx`](./app/components/AuthModal.tsx)):
   - Modal interaktif autentikasi (*Daftar / Masuk*) dengan tab switcher, validasi masukan kredensial (Aset D-01), pilihan peran (Konsumen vs Jastiper), dan simulasi sesi pengguna.

---

### 1.7 Mock Data Produk
Data produk tiruan disimpan secara terstruktur pada [`app/data/products.ts`](./app/data/products.ts) untuk mempersiapkan integrasi basis data pada Milestone 2:

```typescript
export interface Product {
  id: string;
  name: string;
  category: "Makanan" | "Fashion" | "Minuman" | "Oleh-oleh";
  origin: string;
  price: number;
  rating: number;
  illustration: string;
  description: string;
}
```

Daftar produk mencakup representasi ragam daerah nusantara:
- **P001:** Keripik Sanjai Balado (Bukittinggi, Sumatera Barat) — Rp35.000
- **P002:** Bakpia Pathok 25 (Yogyakarta) — Rp45.000
- **P003:** Kopi Arabika Gayo (Takengon, Aceh) — Rp85.000
- **P004:** Batik Tulis Motif Parang (Yogyakarta) — Rp275.000
- **P005:** Pempek Kapal Selam (Palembang, Sumatera Selatan) — Rp60.000
- **P006:** Kaos Lokal Braga (Bandung, Jawa Barat) — Rp110.000

---

### 1.8 Formulir & Validasi Sisi Klien
Formulir permintaan titip pada [`app/components/RequestForm.tsx`](./app/components/RequestForm.tsx) menerapkan validasi sisi klien (*client-side validation*) secara ketat sebelum data dikirimkan:

| Kolom Input | Aturan Validasi | Pesan Kesalahan |
|---|---|---|
| **Nama Lengkap** | Minimal 2 karakter non-spasi | *"Nama minimal terdiri dari 2 karakter."* |
| **Email** | Format alamat email valid (RFC regex) | *"Masukkan alamat email yang valid, misalnya nama@email.com."* |
| **Nomor WhatsApp** | Format angka/tanda plus, 9–16 digit | *"Masukkan nomor WhatsApp yang valid (9–16 digit)."* |
| **Pilihan Produk** | Wajib memilih salah satu opsi dari katalog | *"Pilih produk yang ingin dititipkan."* |
| **Jumlah Barang** | Bilangan bulat positif &ge; 1 | *"Jumlah minimal 1."* |
| **Kota Tujuan / Alamat**| Minimal 3 karakter | *"Masukkan kota tujuan pengiriman."* |
| **Catatan Khusus** | Minimal 4 karakter jika memilih opsi produk kustom | *"Jelaskan produk yang ingin dititipkan (minimal 4 karakter)."* |

- **Aksesibilitas Formulir:** Menggunakan atribut `aria-describedby` yang mengaitkan input dengan elemen pesan error `<p id="...-error">`, serta atribut `aria-invalid="true"` ketika terdapat kesalahan masukan.

---

### 1.9 Desain Responsif
Antarmuka Way2Buy dirancang menggunakan sistem utilitas Tailwind CSS dan CSS Media Queries yang diuji pada tiga titik henti (*breakpoints*):

- **Ponsel (&le; 640 px):** Navigasi ringkas dengan label pendek, *single-column layout*, *padding* adaptif, dan ukuran tombol yang ramah sentuhan (*touch-friendly*).
- **Tablet (768 px):** Tata letak dua kolom pada katalog produk dan formulir permintaan, penyesuaian visual kartu produk.
- **Desktop (&ge; 1024 px):** Tata letak penuh tiga kolom pada katalog, *split layout* pada formulir pemesanan, serta navigasi lengkap dengan tombol CTA header.

*Tangkapan layar pengujian responsif tersedia di direktori [`evidence/`](./evidence/).*

---

### 1.10 Aksesibilitas Web
Aplikasi mencapai skor **Lighthouse Accessibility 96/100** (melampaui target minimum 85):
- Struktur semantik HTML5 (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- Skip link aksesibel di setiap halaman: `<a className="skip-link" href="#main-content">`.
- Pasangan `<label htmlFor="...">` pada seluruh input formulir.
- Kontras warna teks memenuhi WCAG 2.1 AA (&ge; 4.5:1; teks utama menghasilkan kontras 11.2:1).
- Ikon dekoratif ditandai dengan `aria-hidden="true"`.
- *Laporan detail kondisi pengujian dapat dilihat pada [`evidence/LIGHTHOUSE.md`](./evidence/LIGHTHOUSE.md).*



---

## BAGIAN II: KEBUTUHAN & RANCANGAN KOMPONEN KRIPTOGRAFI (RUBRIK R1)

### 2.1 Kebutuhan Kriptografi Produk (K1)

Berdasarkan inventarisasi aset informasi (`../security/asset-inventory.md`) dan penilaian risiko (`../security/risk-register.md`), berikut adalah 3 data utama produk yang memerlukan perlindungan keamanan kriptografi:

| No | ID Aset | Data yang Dilindungi | Tujuan Keamanan (CIA) | Prioritas | Alasan & Mitigasi Ancaman |
|:--:|:-------:|:---------------------|:---------------------:|:---------:|:--------------------------|
| 1 | **D-05** | **Alamat Pengiriman Konsumen** *(Fokus Implementasi)* | **Kerahasiaan & Integritas** *(Confidentiality & Integrity)* | **Tinggi** | Merupakan data pribadi sensitif (PII). Melindungi dari kebocoran saat penyimpanan/backup (**T-09**, **T-10**) dan manipulasi parameter pengiriman (**T-03**). Diimplementasikan dengan **AES-256-GCM**. |
| 2 | **D-06** | Data Transaksi (Nominal, status, referensi pembayaran) | **Integritas & Kerahasiaan** *(Integrity & Confidentiality)* | **Tinggi** | Mencegah manipulasi jumlah tagihan (**T-03**) dan pemalsuan respons *payment gateway* (**T-08**). Dilindungi oleh HMAC/tanda tangan digital dan enkripsi *in-transit* (TLS). |
| 3 | **D-01** | Data Akun Konsumen (Kredensial & kontak) | **Kerahasiaan** *(Confidentiality)* | **Tinggi** | Mencegah akses akun tidak sah dan *credential stuffing* (**T-01**). Password dilindungi menggunakan algoritma *password hashing* adaptif (Argon2id/bcrypt). |

### 2.2 Justifikasi Pemilihan Komponen & Pustaka
Komponen kriptografi dasar difokuskan pada **Alamat Pengiriman Konsumen (Aset D-05)**:
- **Algoritma Terpilih:** **AES-256-GCM** (*Galois/Counter Mode*).
- **Pustaka Kriptografi:** Pustaka resmi dan terpelihara **`node:crypto`** bawaan *Node.js* (didukung oleh *engine* OpenSSL).
- **Kesesuaian Standar:** Memenuhi standar **NIST SP 800-38D**. Sandi klasik (seperti Caesar, Vigenère, atau XOR sederhana) **tidak digunakan** karena tidak memberikan jaminan keamanan modern.
- **Kerahasiaan + Autentikasi Data (AEAD):** Selain mengenkripsi plaintext menjadi ciphertext, algoritma GCM menghasilkan *Authentication Tag* 128-bit untuk memvalidasi bahwa ciphertext tidak mengalami *tampering* (perubahan) selama transit atau penyimpanan.

---

### 2.3 Rancangan Komponen Kriptografi (K2)

#### Alur Enkripsi (Encryption Flow)
```text
Masukan:
  • Alamat pengiriman (string plaintext, 1 s.d. 500 karakter)
  • Kunci simetris 256-bit (Buffer 32 byte dari variabel lingkungan WAY2BUY_ENCRYPTION_KEY)
Proses:
  1. Validasi masukan (tipe string, bukan string kosong/spasi, panjang <= 500 karakter).
  2. Bangkitkan IV acak 96-bit (12 byte) menggunakan CSPRNG crypto.randomBytes(12).
  3. Inisialisasi cipher AES-256-GCM (createCipheriv).
  4. Enkripsi plaintext alamat UTF-8 -> Ciphertext Buffer.
  5. Ambil 128-bit authentication tag (cipher.getAuthTag()).
  6. Encode hasil ke format Base64.
Keluaran:
  • Objek EncryptedData { ciphertext: string, iv: string, authTag: string }
```

#### Alur Dekripsi (Decryption Flow)
```text
Masukan:
  • Objek EncryptedData { ciphertext, iv, authTag } (semua format Base64)
  • Kunci simetris 256-bit (Buffer 32 byte dari variabel lingkungan)
Proses:
  1. Validasi struktur objek EncryptedData.
  2. Decode ciphertext, IV, dan authTag dari Base64 ke Buffer.
  3. Inisialisasi decipher AES-256-GCM (createDecipheriv).
  4. Pasang auth tag pada decipher (decipher.setAuthTag).
  5. Dekripsi buffer ciphertext dan verifikasi integritas.
     * Jika ciphertext atau auth tag dimodifikasi 1 bit pun,
       OpenSSL akan melempar error autentikasi dan membatalkan dekripsi.
Keluaran:
  • Plaintext alamat pengiriman asli (string UTF-8)
```

#### Representasi Data
Struktur data didefinisikan menggunakan antarmuka TypeScript pada [`lib/crypto.ts`](./lib/crypto.ts):
```typescript
export interface EncryptedData {
  ciphertext: string; // Base64
  iv: string;         // Base64 (12 byte)
  authTag: string;    // Base64 (16 byte)
}
```

#### Sumber Keacakan (Randomness)
| Elemen Kriptografi | Ukuran | Sumber Entropi & Fungsi | Standar |
|:---|:---:|:---|:---|
| **Initialization Vector (IV)** | 12 byte (96 bit) | `crypto.randomBytes(12)` via OpenSSL CSPRNG | NIST SP 800-38D |
| **Kunci Enkripsi (Key)** | 32 byte (256 bit) | `crypto.randomBytes(32)` via OpenSSL CSPRNG | FIPS 197 |

---

### 2.4 Implementasi Komponen (K3)
Komponen kriptografi diimplementasikan dan diintegrasikan secara fungsional ke dalam repositori:
1. **Modul Kriptografi Inti:** [`lib/crypto.ts`](./lib/crypto.ts) — Implementasi `encryptAddress()`, `decryptAddress()`, `validateAddress()`, dan `getEncryptionKey()`.
2. **API Endpoint Server:**
   - [`app/api/orders/route.ts`](./app/api/orders/route.ts): Endpoint pesanan yang secara otomatis mengenkripsi alamat konsumen sebelum disimpan.
   - [`app/api/crypto/route.ts`](./app/api/crypto/route.ts): Endpoint pendukung enkripsi, dekripsi, dan verifikasi integritas.
3. **Integrasi Antarmuka:** [`app/components/RequestForm.tsx`](./app/components/RequestForm.tsx) — Terhubung langsung ke enkripsi server-side dan menyediakan verifikasi dekripsi instan.
4. **Dokumentasi Evaluasi:** [`docs/evaluasi-keamanan-kripto.md`](./docs/evaluasi-keamanan-kripto.md) — Dokumen evaluasi teknis dan simulasi deteksi *tampering*.

---

### 2.5 Skenario Uji Otomatis dan Hasil (K4)
Pengujian otomatis pada [`tests/crypto.test.ts`](./tests/crypto.test.ts) mencakup **8 skenario uji otomatis (13 assertions)**, melebihi ketentuan minimum 4 skenario. Seluruh skenario berhasil dijalankan (**100% Pass**):

| No | Skenario Pengujian | Jenis Pengujian | Nilai Masukan Uji (Sintetis) | Hasil yang Diharapkan | Status |
|:--:|:-------------------|:---------------:|:----------------------------|:----------------------|:------:|
| 1 | Enkripsi alamat valid | **Positif** | Alamat sintetis (string 81 karakter) | Menghasilkan objek `EncryptedData` dengan ciphertext ≠ plaintext, IV 12 byte, dan auth tag 16 byte. | ✅ **Lulus** |
| 2 | Dekripsi ciphertext valid | **Positif** | Objek terenkripsi dari Skenario 1 & string Unicode nusantara | Berhasil didekripsi menjadi string yang identik dengan plaintext awal tanpa karakter korup. | ✅ **Lulus** |
| 3 | Input kosong dan spasi ditolak | **Negatif** | `""` dan `"   "` | Melempar error validasi *"tidak boleh kosong"*. | ✅ **Lulus** |
| 4 | Input bertipe non-string ditolak | **Negatif** | `12345`, `null`, `undefined` | Melempar error validasi *"harus berupa string"*. | ✅ **Lulus** |
| 5 | Uji batas panjang alamat | **Batas** | String 501 karakter & string 500 karakter | 501 karakter ditolak (*melebihi batas*); tepat 500 karakter berhasil dienkripsi dan didekripsi. | ✅ **Lulus** |
| 6 | Ciphertext hasil modifikasi ditolak | **Integritas** | Ciphertext valid dengan 1 bit di-flip (`buf[0] ^ 0xFF`) | Dekripsi ditolak oleh OpenSSL GCM (*authentication failure*), mencegah manipulasi data. | ✅ **Lulus** |
| 7 | Auth tag palsu ditolak | **Integritas** | Ciphertext valid dengan auth tag acak palsu | Dekripsi ditolak karena verifikasi tanda autentikasi gagal. | ✅ **Lulus** |
| 8 | Dua kali enkripsi menghasilkan IV berbeda | **Keacakan (Randomness)** | Plaintext yang sama dienkripsi 2 kali | Menghasilkan IV dan ciphertext yang berbeda, namun keduanya dapat didekripsi ke plaintext yang sama. | ✅ **Lulus** |

*Laporan eksekusi lengkap dapat dilihat pada file [`EVALUASI.md`](./EVALUASI.md).*

---

### 2.6 Kepatuhan Keamanan & Data Sintetis
- **Kerahasiaan Kunci:** Kunci enkripsi tidak pernah di-hardcode di repositori. Template variabel lingkungan publik disediakan di [`.env.example`](./.env.example).
- **Data Sintetis:** Seluruh data pada unit test dan mock data menggunakan data sintetis (dummy) dan bukan data pribadi asli.

---

### 2.7 Panduan Demonstrasi Pekan 3 (±3 Menit) (K5)
Panduan alur demonstrasi individual pada pertemuan pekan 3:

1. **Menit 0:00 – 0:45 (Latar Belakang & Kebutuhan Kriptografi - K1 & K2):**
   - Buka dokumen evaluasi kriptografi: [`docs/evaluasi-keamanan-kripto.md`](./docs/evaluasi-keamanan-kripto.md).
   - Jelaskan konsep Way2Buy dan tabel kebutuhan data: **D-05 Alamat Pengiriman Konsumen** dipilih sebagai fokus implementasi kriptografi karena memuat informasi pribadi (PII) yang rentan terhadap kebocoran basis data (**T-09/T-10**) dan manipulasi (**T-03**).
   - Jelaskan parameter kriptografi: **AES-256-GCM**, IV 12 byte (CSPRNG), Auth Tag 16 byte, representasi Base64.
2. **Menit 0:45 – 1:45 (Demonstrasi Implementasi & Alur Produk - K3):**
   - Buka halaman `/titip` di browser.
   - Isi formulir titip dan lakukan submit pesanan titip: tunjukkan bahwa alamat otomatis dienkripsi oleh server API.
   - Tunjukkan keluaran ciphertext, IV, dan authentication tag. Lakukan klik tombol **Verifikasi Dekripsi** untuk membuktikan bahwa alamat berhasil didekripsi kembali secara utuh.
3. **Menit 1:45 – 2:30 (Pengujian Otomatis - K4):**
   - Buka terminal dan jalankan `npm test`.
   - Tunjukkan 8 skenario pengujian unit (13 assertions) yang mencakup uji positif, negatif, batas (500 vs 501 char), integritas, dan keacakan IV. Tunjukkan bahwa seluruh skenario lulus (0 fail).
4. **Menit 2:30 – 3:00 (Kepatuhan Repositori & Penutupan - K5):**
   - Tunjukkan file [`.env.example`](./.env.example) dan konfirmasi tidak ada kunci privat/data pribadi di repositori.
   - Tunjukkan dokumentasi pelengkap: [`AI_LOG.md`](./AI_LOG.md), [`KEPUTUSAN.md`](./KEPUTUSAN.md), dan [`EVALUASI.md`](./EVALUASI.md).

---

## BAGIAN III: CARA MENJALANKAN APLIKASI & PENGUJIAN

### 3.1 Prasyarat
- **Node.js** versi ≥ 18.x (direkomendasikan Node.js v20+)
- **npm** versi ≥ 9.x

### 3.2 Instalasi Dependensi
Jalankan perintah berikut di dalam direktori `way2buy`:
```bash
npm install
```

### 3.3 Menyiapkan Variabel Lingkungan
Bangkitkan kunci enkripsi acak 32-byte (Base64) menggunakan CSPRNG:
```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

Salin contoh konfigurasi lingkungan ke file `.env.local`:
```bash
cp .env.example .env.local
```

Buka file `.env.local` dan masukkan kunci yang baru dibangkitkan:
```dotenv
WAY2BUY_ENCRYPTION_KEY=PASTE_KUNCI_BASE64_HASIL_PERINTAH_DI_ATAS
```

### 3.4 Menjalankan Pengujian Otomatis
```bash
npm test
```

### 3.5 Menjalankan Aplikasi Web
```bash
npm run dev
```
Buka peramban (*browser*) pada alamat:
- **Beranda:** `http://localhost:3000`
- **Katalog Produk:** `http://localhost:3000/produk`
- **Formulir Permintaan Titip:** `http://localhost:3000/titip`

---

## BAGIAN IV: BUKTI PENGERJAAN (EVIDENCE)

| Jenis Bukti | File Bukti | Keterangan |
|---|---|---|
| **Tampilan Desktop (≥ 1024 px)** | [`evidence/beranda-desktop.png`](./evidence/beranda-desktop.png) | Tata letak desktop penuh, hero banner, dan grid produk |
| **Tampilan Tablet (768 px)** | [`evidence/beranda-tablet.png`](./evidence/beranda-tablet.png) | Tata letak responsif dua kolom pada tablet |
| **Tampilan Ponsel (≤ 640 px)** | [`evidence/beranda-mobile.png`](./evidence/beranda-mobile.png) | Tata letak kolom tunggal dan navigasi adaptif mobile |
| **Validasi Formulir (Client-side)** | [`evidence/form-validasi.png`](./evidence/form-validasi.png) | State pesan kesalahan saat input tidak valid |
| **Pengiriman Formulir Berhasil** | [`evidence/form-berhasil.png`](./evidence/form-berhasil.png) | Konfirmasi pesanan dan hasil enkripsi data alamat |
| **Laporan Lighthouse Accessibility** | [`evidence/LIGHTHOUSE.md`](./evidence/LIGHTHOUSE.md) | Bukti skor aksesibilitas 96/100 beserta kondisi pengujian |

---

## BAGIAN V: INFORMASI RILIS & PENGUMPULAN (TAG v0.1)

- **Versi Tag:** `v0.1`
- **Perintah Pembuatan Tag:**
  ```bash
  git tag -a v0.1 -m "Release v0.1: Milestone 1 Web Antarmuka & Komponen Kriptografi Dasar Way2Buy"
  git push origin v0.1
  ```
- **Catatan Pengumpulan:** Tautan repositori GitHub dan tag `v0.1` diserahkan melalui kolom teks daring sesuai instruksi. Komit yang dinilai adalah komit yang ditunjuk oleh tag `v0.1`.
