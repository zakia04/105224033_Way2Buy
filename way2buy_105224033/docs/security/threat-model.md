# 3. Threat Model — STRIDE

Threat Modeling merupakan proses sistematis untuk mengidentifikasi potensi ancaman keamanan terhadap suatu sistem. Pada dokumen ini, analisis ancaman dilakukan menggunakan metode **STRIDE** yang dikembangkan oleh Microsoft. Threat model ini dibangun berdasarkan asset inventory dan data flow diagram yang telah disusun sebelumnya, dengan fokus pada identifikasi ancaman yang relevan terhadap sistem Way2Buy.

---

## 3.1 Metode STRIDE

STRIDE adalah kerangka kerja (framework) yang mengkategorikan ancaman keamanan ke dalam enam kategori. Setiap kategori merepresentasikan jenis serangan yang berbeda dan berkorelasi dengan aspek keamanan yang dapat terdampak. Dengan menggunakan STRIDE, kita dapat secara sistematis menganalisis setiap komponen dan data flow dalam DFD untuk mengidentifikasi ancaman yang mungkin terjadi.

| Kategori | Arti                   | Contoh                                                           |
| -------- | ---------------------- | ---------------------------------------------------------------- |
| S        | Spoofing               | Penyerang menyamar sebagai pengguna lain.                        |
| T        | Tampering              | Penyerang mengubah data secara tidak sah.                        |
| R        | Repudiation            | Pengguna menyangkal pernah melakukan suatu aktivitas.            |
| I        | Information Disclosure | Informasi rahasia bocor kepada pihak yang tidak berwenang.       |
| D        | Denial of Service      | Sistem dibuat tidak tersedia atau sulit digunakan.               |
| E        | Elevation of Privilege | Pengguna memperoleh hak akses yang lebih tinggi dari seharusnya. |

---

## 3.2 Identifikasi Threat

Berdasarkan analisis terhadap komponen DFD, trust boundary, dan data flow yang telah diidentifikasi, berikut adalah daftar ancaman (threat) yang berpotensi terjadi pada sistem Way2Buy. Setiap threat diidentifikasi dengan ID unik, dikategorikan berdasarkan STRIDE, dan dideskripsikan menggunakan format yang mencakup **siapa** penyerangnya, **apa** yang dilakukan, **bagaimana** cara melakukannya, dan **apa dampaknya**.

| ID   | STRIDE                 | Threat                                                                                                                                                                                        |
| ---- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T-01 | Spoofing               | Penyerang dapat melakukan credential stuffing/account takeover terhadap akun pengguna melalui endpoint login yang tidak memiliki rate limiting, sehingga akun pengguna dapat diambil alih.    |
| T-02 | Elevation of Privilege | Pengguna biasa dapat mengakses endpoint admin melalui manipulasi request atau URL jika authorization hanya dilakukan di sisi client, sehingga penyerang memperoleh hak akses administrator.   |
| T-03 | Tampering              | Penyerang dapat memanipulasi parameter pesanan melalui request yang dikirim ke server, sehingga harga, jumlah, atau status pesanan dapat berubah secara tidak sah.                            |
| T-04 | Information Disclosure | Penyerang dapat melakukan SQL Injection terhadap aplikasi untuk membaca data dari database, sehingga data akun dan transaksi dapat terekspos.                                                 |
| T-05 | Information Disclosure | Penyerang dapat menangkap data yang dikirim antara client dan server apabila TLS tidak diterapkan atau dikonfigurasi dengan benar, sehingga informasi sensitif dapat bocor.                   |
| T-06 | Denial of Service      | Penyerang dapat membanjiri endpoint login, pencarian, atau pemesanan dengan request dalam jumlah besar, sehingga layanan menjadi lambat atau tidak tersedia.                                  |
| T-07 | Repudiation            | Pengguna dapat menyangkal pernah melakukan perubahan atau aktivitas pada pesanan apabila sistem tidak memiliki audit log yang memadai, sehingga proses investigasi menjadi sulit.             |
| T-08 | Spoofing               | Penyerang dapat mengirim atau memalsukan response pembayaran apabila aplikasi tidak memvalidasi sumber response Payment Gateway, sehingga transaksi dapat dianggap berhasil secara tidak sah. |
| T-09 | Information Disclosure | Penyerang dapat memperoleh akses langsung ke database apabila credential database terekspos atau kontrol akses database lemah, sehingga data aplikasi dapat dibaca.                           |
| T-10 | Information Disclosure | Penyerang dapat memperoleh backup database yang tidak terenkripsi atau tidak memiliki access control, sehingga seluruh data backup dapat terekspos.                                           |
| T-11 | Tampering              | Penyerang dapat mengubah profil atau layanan jastiper secara tidak sah apabila authorization pada endpoint pengelolaan layanan tidak diterapkan dengan benar.                                 |
| T-12 | Denial of Service      | Penyerang dapat menghapus atau merusak backup apabila penyimpanan backup tidak memiliki access control dan perlindungan yang memadai, sehingga proses pemulihan sistem terganggu.             |

---

## 3.3 Mitigasi Kriptografi pada Repositori Produk

Penerapan komponen kriptografi dasar pada `way2buy/lib/crypto.ts` secara langsung memitigasi beberapa ancaman utama:

1. **Mitigasi T-03 (Tampering Parameter Pesanan):**  
   Penggunaan mode terotentikasi **AES-256-GCM** menghasilkan _Authentication Tag_ 128-bit. Jika penyerang memanipulasi ciphertext alamat pengiriman, OpenSSL decipher akan membatalkan proses dengan error otentikasi, sehingga tampering langsung terdeteksi.
2. **Mitigasi T-09 (Direct Database Access) & T-10 (Backup Disclosure):**  
   Alamat pengiriman disimpan dalam bentuk _ciphertext_ terenkripsi (encryption-at-rest). Jika penyerang memperoleh akses langsung ke basis data atau file cadangan (_backup dump_), data pribadi konsumen tidak dapat dibaca tanpa kunci simetris 256-bit yang tersimpan di variabel lingkungan server.
