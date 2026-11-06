# Access Control Testing – Way2Buy

## 1. Tujuan
Pengujian dilakukan untuk memastikan endpoint administrasi pesanan hanya dapat diakses menggunakan token admin yang valid.

## 2. Mekanisme Autentikasi
Aplikasi menggunakan Bearer Token melalui environment variable ADMIN_API_TOKEN. Pemeriksaan token dilakukan menggunakan fungsi timingSafeEqual dari modul node:crypto.

## 3. Hasil Pengujian

| No. | Endpoint | Skenario | Hasil Aktual | Status |
|---|---|---|---|---|
| 1 | GET | Tanpa token | 401 Unauthorized | LULUS |
| 2 | GET | Token salah | 401 Unauthorized | LULUS |
| 3 | GET | Token benar | 200 OK | LULUS |
| 4 | PATCH | Tanpa token | 401 Unauthorized | LULUS |
| 5 | PATCH | Token salah | 401 Unauthorized | LULUS |
| 6 | PATCH | Token benar, ID tidak ditemukan | 404 Not Found (P2025) | LULUS |
| 7 | DELETE | Tanpa token | 401 Unauthorized | LULUS |
| 8 | DELETE | Token salah | 401 Unauthorized | LULUS |
| 9 | DELETE | Token benar, ID tidak ditemukan | 404 Not Found (P2025) | LULUS |

## 4. Analisis
Seluruh sembilan skenario memberikan hasil sesuai ekspektasi. Permintaan tanpa token dan token tidak valid ditolak dengan status 401. Permintaan menggunakan token valid berhasil melewati autentikasi.

Pada pengujian GET, server memberikan status 200 OK. Pada pengujian PATCH dan DELETE, server memberikan status 404 dengan kode P2025 karena ID pesanan pengujian tidak ditemukan. Dengan demikian, operasi pengujian tidak mengubah atau menghapus pesanan asli.

## 5. Batasan Pengujian
Pengujian ini membuktikan kontrol akses berbasis token admin, tetapi belum membuktikan pemisahan hak akses berdasarkan role pengguna seperti admin dan customer.

Password hashing belum dapat diuji karena aplikasi saat ini belum memiliki mekanisme autentikasi akun dan penyimpanan password pengguna.

## 6. Kesimpulan
Berdasarkan sembilan skenario pengujian, mekanisme autentikasi token pada endpoint GET, PATCH, dan DELETE /api/admin/orders berfungsi sesuai hasil yang diharapkan. Pengujian ini menjadi bukti penerapan kontrol akses terhadap endpoint administrasi Way2Buy.
