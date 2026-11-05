# Catatan Penggunaan AI (AI_LOG.md)

Dokumen ini mencatat penggunaan asisten kecerdasan buatan (AI) selama proses perancangan, implementasi, dokumentasi, dan pengujian komponen kriptografi pada produk **Way2Buy**. Penggunaan AI dilakukan sebagai alat bantu, sedangkan keputusan akhir dan validasi implementasi dilakukan oleh pengembang.

## 1. Alat AI yang Digunakan

- **Google Antigravity:** Gemini 3.8 Flash / Claude Opus Thinking.
- **ChatGPT:** GPT-6.

## 2. Tujuan Penggunaan AI

AI digunakan untuk membantu:

1. Meninjau pemilihan algoritma enkripsi AES-256-GCM.
2. Memeriksa implementasi enkripsi dan dekripsi menggunakan modul `node:crypto`.
3. Meninjau validasi input, pengelolaan kunci, nonce/IV, dan authentication tag.
4. Menyusun serta memperbaiki dokumentasi keputusan kriptografi.
5. Mengembangkan skenario pengujian untuk memastikan data yang dimodifikasi atau menggunakan kunci yang salah ditolak.
6. Memeriksa kesesuaian dokumentasi dan implementasi dengan ketentuan Tugas 2.

## 3. Ringkasan Prompt

Beberapa instruksi yang diberikan kepada AI meliputi:

- Meninjau implementasi AES-256-GCM pada aplikasi Way2Buy.
- Memeriksa keamanan proses enkripsi dan dekripsi serta validasi input.
- Menambahkan pengujian untuk ciphertext yang dimodifikasi, authentication tag yang tidak valid, IV yang tidak sesuai, dan penggunaan kunci yang salah.
- Memperbaiki dokumentasi keputusan kriptografi agar menjelaskan mekanisme, parameter, alasan pemilihan, serta pengelolaan kunci.
- Memastikan dokumentasi pengujian sesuai dengan hasil pengujian aktual.

## 4. Bagian yang Digunakan dan Dimodifikasi

| Bagian | Bantuan AI | Tindakan Pengembang |
|---|---|---|
| `lib/crypto.ts` | Tinjauan validasi input, Base64, kunci, IV, dan authentication tag | Memeriksa dan menyesuaikan implementasi |
| `tests/crypto.test.ts` | Saran penambahan skenario pengujian | Menambahkan dan menjalankan pengujian |
| `KEPUTUSAN.md` | Penyusunan dan perbaikan dokumentasi keputusan | Meninjau serta menyesuaikan isi dokumen |
| Dokumentasi keamanan | Saran konsistensi parameter dan hasil pengujian | Memeriksa kesesuaian dengan implementasi |

## 5. Tindakan dan Validasi

Setiap hasil yang disarankan oleh AI diperiksa dan divalidasi dengan kriteria berikut:

1. **Keamanan Tanpa Secret:** Memastikan tidak ada kunci enkripsi asli, token produksi, password, atau credential yang ditulis langsung ke dalam source code maupun diunggah ke repositori.
2. **Kesesuaian Aset:** Memeriksa konsistensi pemetaan aset D-05, D-06, dan D-01 dengan dokumentasi inventarisasi keamanan.
3. **Pustaka Terpelihara:** Memastikan implementasi menggunakan modul resmi `node:crypto`, bukan algoritma kriptografi buatan sendiri atau sandi klasik seperti Caesar, Vigenere, dan XOR.
4. **Data Sintetis:** Memastikan data yang digunakan dalam pengujian merupakan data dummy dan bukan data pribadi pengguna.
5. **Kesesuaian Rubrik:** Memeriksa kelengkapan pekerjaan berdasarkan komponen penilaian Tugas 2:
   - K1: Pemilihan mekanisme (20%).
   - K2: Implementasi dan parameter (30%).
   - K3: Validasi input dan pengelolaan kunci (15%).
   - K4: Pengujian dan penolakan data tidak valid (25%).
   - K5: Dokumentasi, demonstrasi, dan AI Log (10%).

## 6. Verifikasi Hasil

Hasil implementasi diperiksa melalui pengujian otomatis menggunakan perintah `npm test`. Pada pengujian terakhir, diperoleh hasil:

- Total skenario pengujian: 12.
- Total assertion: 17.
- Pengujian berhasil: 17.
- Pengujian gagal: 0.

Pemeriksaan tambahan terhadap tipe data dilakukan menggunakan perintah `npx tsc --noEmit`. Hasil pengujian dan pemeriksaan tersebut digunakan sebagai dasar validasi implementasi.

## 7. Pernyataan Penggunaan AI

AI digunakan sebagai alat bantu dalam proses pembelajaran, peninjauan kode, penyusunan dokumentasi, dan pengembangan skenario pengujian. Seluruh saran yang digunakan tetap diperiksa dan disesuaikan dengan kebutuhan aplikasi Way2Buy. Tanggung jawab atas kode akhir, pengujian, dan hasil implementasi berada pada pengembang.
