# 1. Asset Inventory

Asset Inventory merupakan langkah awal dalam proses threat modeling yang bertujuan untuk mengidentifikasi dan mengklasifikasikan seluruh aset penting yang dimiliki oleh sistem. Dengan mengetahui aset apa saja yang ada, kita dapat menentukan aset mana yang paling kritis dan memerlukan perlindungan lebih. Setiap aset dinilai berdasarkan tiga aspek keamanan informasi, yaitu **Confidentiality** (kerahasiaan), **Integrity** (integritas), dan **Availability** (ketersediaan), yang masing-masing dikategorikan sebagai High, Medium, atau Low sesuai tingkat sensitivitasnya.

---

## 1.1 Deskripsi Produk

Way2Buy merupakan platform jastip (jasa titip) yang menghubungkan konsumen dengan jastiper dari berbagai daerah di Indonesia. Konsumen dapat mencari produk atau layanan jastip, melakukan pemesanan, melakukan pembayaran, serta melihat status pesanan. Jastiper dapat mengelola profil, layanan jastip, dan pesanan. Admin bertugas melakukan verifikasi dan administrasi sistem.

---

## 1.2 Data

Bagian ini mencakup seluruh data yang disimpan dan diproses oleh sistem Way2Buy. Data merupakan aset yang paling fundamental karena menjadi target utama dari berbagai ancaman keamanan. Klasifikasi CIA (Confidentiality, Integrity, Availability) pada setiap data membantu menentukan kontrol keamanan yang perlu diterapkan.

| ID | Asset | Confidentiality | Integrity | Availability | Alasan |
|---|---|---|---|---|---|
| D-01 | Data akun konsumen | High | High | Medium | Berisi informasi akun pengguna dan harus dilindungi dari akses tidak sah. |
| D-02 | Data akun jastiper | High | High | Medium | Digunakan untuk autentikasi dan pengelolaan akun jastiper. |
| D-03 | Profil jastiper | Medium | High | High | Perubahan tidak sah dapat menyesatkan konsumen dan memengaruhi layanan. |
| D-04 | Data layanan jastip | Medium | High | High | Data layanan menentukan produk, harga, dan ketersediaan jastip. |
| D-05 | Data pesanan | High | High | High | Pesanan berkaitan langsung dengan transaksi dan proses pemenuhan jastip. Khususnya alamat pengiriman konsumen dilindungi menggunakan enkripsi simetris terotentikasi AES-256-GCM. |
| D-06 | Data transaksi | High | High | High | Berkaitan dengan pembayaran dan informasi transaksi pengguna. |
| D-07 | Data review/rating | Medium | High | Medium | Perubahan tidak sah dapat memengaruhi reputasi jastiper. |

### 1.2.1 Pemetaan Kontrol Kriptografi Aset

Untuk memenuhi kebutuhan kerahasiaan dan integritas pada aset dengan prioritas tinggi, kontrol kriptografi berikut diterapkan pada repositori produk (`way2buy/`):

| ID Aset | Data Spesifik | Kebutuhan Keamanan | Mekanisme Kriptografi | Implementasi |
|:---:|:---|:---:|:---|:---|
| **D-05** | Alamat pengiriman konsumen | Kerahasiaan & Integritas | **AES-256-GCM** (NIST SP 800-38D) dengan IV 96-bit dan Auth Tag 128-bit via `node:crypto` | `way2buy/lib/crypto.ts` |
| **D-06** | Data transaksi & pembayaran | Integritas & Kerahasiaan | Enkripsi *in-transit* (HTTPS/TLS) dan validasi signature / HMAC pada response gateway | Integrasi API |
| **D-01** | Data akun & password | Kerahasiaan & Integritas | Password hashing adaptif (Argon2id/bcrypt) | Service autentikasi |

---

## 1.3 Services

Services merujuk pada fitur-fitur atau layanan utama yang disediakan oleh aplikasi Way2Buy. Setiap service memiliki risiko keamanan yang berbeda tergantung pada jenis data yang diproses dan tingkat akses yang diperlukan. Identifikasi service ini penting untuk menentukan titik-titik mana pada aplikasi yang paling rentan terhadap serangan.

| ID | Asset | Confidentiality | Integrity | Availability | Alasan |
|---|---|---|---|---|---|
| S-01 | Registrasi/Login | High | High | High | Digunakan untuk autentikasi dan akses akun pengguna. |
| S-02 | Pencarian jastiper | Low | High | High | Menjadi fitur utama untuk menemukan layanan jastip. |
| S-03 | Manajemen layanan | Medium | High | High | Digunakan jastiper untuk mengelola layanan yang ditawarkan. |
| S-04 | Pemesanan | High | High | High | Berhubungan langsung dengan proses pemesanan produk. |
| S-05 | Pembayaran | High | High | High | Berhubungan dengan proses pembayaran dan status transaksi. |
| S-06 | Tracking pesanan | Medium | High | High | Digunakan untuk melihat perkembangan pesanan. |
| S-07 | Rating/Review | Medium | High | Medium | Memengaruhi reputasi dan kepercayaan terhadap jastiper. |
| S-08 | Administrasi | High | High | High | Memiliki hak akses tinggi terhadap sistem. |

---

## 1.4 Secrets

Secrets adalah informasi sensitif yang digunakan oleh sistem secara internal untuk keperluan autentikasi, enkripsi, dan komunikasi dengan layanan eksternal. Kebocoran secrets dapat memberikan penyerang akses langsung ke infrastruktur sistem, sehingga seluruh secrets dikategorikan sebagai High pada ketiga aspek CIA.

| ID | Asset | Confidentiality | Integrity | Availability | Alasan |
|---|---|---|---|---|---|
| SC-01 | Database credential | High | High | High | Jika bocor dapat digunakan untuk mengakses database secara langsung. |
| SC-02 | Session secret | High | High | High | Digunakan untuk menjaga keamanan sesi pengguna. |
| SC-03 | Payment Gateway API Key | High | High | High | Digunakan untuk komunikasi dengan layanan pembayaran. |
| SC-04 | JWT Secret | High | High | High | Jika JWT digunakan, secret diperlukan untuk validasi token. |
| SC-05 | Environment variables/.env | High | High | High | Dapat berisi credential, API key, dan konfigurasi penting lainnya. |

---

## 1.5 Backup

Backup merupakan salinan data dan konfigurasi yang disimpan untuk keperluan pemulihan sistem (disaster recovery). Meskipun backup bersifat pasif, aset ini tetap kritis karena berisi data yang sama sensitifnya dengan data asli. Perlindungan terhadap backup harus mencakup enkripsi, kontrol akses, dan penyimpanan yang aman.

| ID | Asset | Confidentiality | Integrity | Availability | Alasan |
|---|---|---|---|---|---|
| B-01 | Database backup | High | High | High | Backup dapat berisi seluruh data penting aplikasi dan diperlukan saat pemulihan. |
| B-02 | Configuration backup | High | High | Medium | Dapat berisi konfigurasi sistem yang penting untuk pemulihan aplikasi. |

---

## 1.6 Logs

Logs mencatat aktivitas yang terjadi pada sistem dan merupakan sumber informasi penting untuk pemantauan, audit, dan investigasi insiden keamanan. Log yang tidak dijaga integritasnya dapat dimanipulasi oleh penyerang untuk menghilangkan jejak, sedangkan log yang tidak tersedia dapat menghambat proses forensik digital.

| ID | Asset | Confidentiality | Integrity | Availability | Alasan |
|---|---|---|---|---|---|
| L-01 | Application log | Medium | High | Medium | Membantu pemantauan dan troubleshooting aplikasi. |
| L-02 | Authentication log | High | High | Medium | Mencatat aktivitas login dan dapat digunakan untuk mendeteksi serangan. |
| L-03 | Audit log | High | High | High | Digunakan untuk melacak perubahan dan aktivitas penting dalam sistem. |
| L-04 | Payment log | High | High | Medium | Mencatat aktivitas yang berkaitan dengan proses pembayaran. |

---

## 1.7 Accounts

Accounts merepresentasikan akun-akun yang memiliki akses terhadap sistem Way2Buy. Setiap jenis akun memiliki tingkat privilege yang berbeda. Kompromi terhadap akun, terutama akun admin, dapat berdampak besar terhadap keseluruhan sistem karena memberikan penyerang kemampuan untuk mengakses, mengubah, atau menghapus data.

| ID | Asset | Confidentiality | Integrity | Availability | Alasan |
|---|---|---|---|---|---|
| AC-01 | Consumer account | High | High | High | Akun digunakan untuk mengakses data dan melakukan pemesanan. |
| AC-02 | Jastiper account | High | High | High | Akun digunakan untuk mengelola layanan dan pesanan jastip. |
| AC-03 | Admin account | High | High | High | Admin memiliki hak akses tinggi terhadap sistem sehingga harus dilindungi. |
