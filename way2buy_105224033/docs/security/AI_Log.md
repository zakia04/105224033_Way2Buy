## AI Usage

AI digunakan sebagai alat bantu dalam proses penyusunan threat modeling dan risk assessment untuk proyek Way2Buy.

### Tujuan Penggunaan AI

AI digunakan untuk membantu:

1. Mengidentifikasi asset yang perlu diperhatikan dalam aplikasi.
2. Menyusun struktur Asset Inventory.
3. Membantu menyusun Data Flow Diagram (DFD).
4. Mengidentifikasi ancaman menggunakan metode STRIDE.
5. Membantu memberikan nilai likelihood dan impact.
6. Menghitung risk score.
7. Menentukan prioritas risiko.
8. Membantu menyusun control plan.
9. Membantu merapikan dokumentasi dalam format Markdown.

### Batasan Penggunaan AI

Hasil dari AI tidak digunakan secara langsung tanpa pemeriksaan. Setiap hasil disesuaikan dengan konteks aplikasi Way2Buy, struktur DFD, asset yang digunakan, dan requirement tugas.

### Validasi

Hasil threat modeling diperiksa kembali dengan memastikan bahwa:

- Asset sesuai dengan fungsi Way2Buy.
- Data flow sesuai dengan proses aplikasi.
- Threat berhubungan dengan elemen DFD.
- Risk score dihitung menggunakan rumus yang diberikan.
- Control yang diberikan relevan dengan threat.
- Dokumentasi mengikuti format tugas.

---

### Penggunaan AI pada Komponen Kriptografi (Pekan 3)

AI digunakan untuk membantu perancangan dan integrasi komponen kriptografi dasar pada repositori produk `way2buy`:

1. Menentukan mekanisme enkripsi simetris terotentikasi **AES-256-GCM** via `node:crypto` untuk melindungi aset data pesanan **D-05** (alamat pengiriman konsumen).
2. Memetakan mitigasi ancaman STRIDE **T-03** (tampering), **T-09** (direct DB access), dan **T-10** (backup disclosure).
3. Menyusun 8 skenario pengujian unit otomatis pada `way2buy/tests/crypto.test.ts`.
4. Mengintegrasikan komponen kriptografi pada API backend (`app/api/crypto` & `app/api/orders`), form pemesanan (`RequestForm.tsx`), serta halaman laboratorium keamanan (`app/kripto/page.tsx`).
5. Memvalidasi bahwa seluruh data uji bersifat sintetis dan tidak ada rahasia/kunci privat di repositori.
