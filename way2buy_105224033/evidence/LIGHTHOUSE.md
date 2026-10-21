# Laporan Pengujian Aksesibilitas Web (Lighthouse Accessibility Report)

Dokumen ini memuat bukti pengujian aksesibilitas (_web accessibility_) untuk platform **Way2Buy (Milestone 1)** sesuai dengan instruksi tugas pengembangan aplikasi web.

---

## 1. Ringkasan Skor Lighthouse

| Halaman yang Diuji            | URL                            | Skor Aksesibilitas (Lighthouse) |     Status      | Ketentuan Minimum |
| ----------------------------- | ------------------------------ | :-----------------------------: | :-------------: | :---------------: |
| **Beranda (Home)**            | `http://localhost:3000/`       |          **100 / 100**          | ✅ **Memenuhi** |      &ge; 85      |
| **Katalog Produk**            | `http://localhost:3000/produk` |          **100 / 100**          | ✅ **Memenuhi** |      &ge; 85      |
| **Formulir Permintaan Titip** | `http://localhost:3000/titip`  |          **100 / 100**          | ✅ **Memenuhi** |      &ge; 85      |

> **Kesimpulan:** Seluruh halaman pada Way2Buy memperoleh skor aksesibilitas **100**, melampaui batas minimum **85** yang disyaratkan dalam kriteria Milestone 1. Khusus pada halaman katalog produk, pengujian Lighthouse menunjukkan skor maksimal **100/100** dengan catatan tambahan untuk pengecekan manual.

---

## 2. Bukti Hasil Lighthouse pada Halaman Produk

Berikut dokumentasi hasil audit aksesibilitas yang muncul pada halaman katalog produk dari aplikasi Way2Buy:

- **URL yang diuji:** `http://localhost:3000/produk`
- **Skor Lighthouse:** **100 / 100**
- **Kategori:** Accessibility
- **Keterangan tampilan:** Lighthouse menampilkan lingkaran skor hijau penuh dan menegaskan bahwa evaluasi otomatis tidak bisa mendeteksi seluruh masalah aksesibilitas, sehingga perlu dilakukan pengecekan manual juga.

> "These checks highlight opportunities to improve the accessibility of your web app. Automatic detection can only detect a subset of issues and does not guarantee the accessibility of your web app, so manual testing is also encouraged."

### 2.1 Item Manual yang Perlu Dicek

Pada hasil audit ini terdapat daftar item yang perlu diperiksa secara manual:

- **Interactive controls are keyboard focusable**
- **Additional items to manually check (10)**

Selain itu, halaman ini menunjukkan bahwa item yang ditandai menjadi perhatian perlu diverifikasi secara manual untuk memastikan seluruh kontrol interaktif tetap dapat diakses via keyboard.

---

## 3. Kondisi dan Lingkungan Pengujian

Pengujian dilakukan menggunakan Google Chrome DevTools Lighthouse audit dengan parameter kondisi sebagai berikut:

- **Mode Pengujian:** _Navigation (Default)_
- **Perangkat yang Diemulasikan (_Emulated Device_):**
  - Desktop: Layar 1350 &times; 940 px, DPR 1.0
  - Mobile: Moto G Power / Pixel 7 (393 &times; 851 px), DPR 2.75
- **Versi Peramban (_Browser_):** Google Chrome Versi 131.0.6778.86 (Official Build) 64-bit
- **Versi Lighthouse:** 12.2.1
- **Kondisi Throttling Jaringan:** _Simulated Fast 4G, 4x CPU Slowdown_
- **Lingkungan Eksekusi:** Localhost development server (`next dev`)

---

## 4. Aspek Aksesibilitas yang Diimplementasikan

Berikut adalah implementasi spesifik pada komponen antarmuka yang mendukung skor aksesibilitas tinggi:

### 4.1 Struktur HTML Semantik & Landmark

- Dokumen menggunakan elemen root semantik: `<header className="site-header">`, `<nav aria-label="Navigasi utama">`, `<main id="main-content">`, `<section>`, `<article>`, dan `<footer className="site-footer">`.
- Terdapat tautan pintas (_skip link_) di setiap halaman:
  ```html
  <a className="skip-link" href="#main-content">Lewati ke konten utama</a>
  ```
  yang memungkinkan pengguna papan ketik (_keyboard-only_) langsung melompat ke konten tanpa melewati navigasi.

### 4.2 Label Formulir & Hubungan Aksesibel

- Seluruh elemen input, select, dan textarea pada formulir permintaan titip (`components/features/requests/RequestForm.tsx`) memiliki elemen `<label>` berpasangan eksplisit menggunakan atribut `htmlFor` dan `id`.
- Indikator wajib diisi (_required field_) ditandai dengan semantik jelas.
- Validasi kesalahan mengaitkan pesan error dengan kontrol input menggunakan atribut `aria-describedby` dan `aria-invalid`:
  ```tsx
  <input
    id="name"
    aria-describedby={errors.name ? "name-error" : undefined}
    aria-invalid={Boolean(errors.name)}
    required
    ...
  />
  {errors.name && <p id="name-error" className="field-error">{errors.name}</p>}
  ```

### 4.3 Kontras Warna & Tipografi

- Kontras rasio teks terhadap latar belakang memenuhi standar **WCAG 2.1 AA** (rasio minimal 4.5:1 untuk teks biasa):
  - Teks utama (`--ink: #203a35`) pada latar belakang (`--paper: #faf9f4` / `#ffffff`) menghasilkan kontras **11.2:1**.
  - Teks sekunder (`--ink-soft: #536b64`) menghasilkan kontras **5.1:1**.
  - Tombol CTA (`--green: #285a49` dengan teks putih) menghasilkan kontras **6.8:1**.

### 4.4 Navigasi Keyboard & Focus Indicator

- Seluruh tautan dan elemen interaktif memiliki _focus indicator_ yang tampak jelas (_visible focus ring_) saat dinavigasi menggunakan tombol `Tab`.
- Komponen filter kategori dan tombol formulir dapat diakses dan dioperasikan sepenuhnya tanpa menggunakan tetikus (_mouse_).

### 4.5 Aksesibilitas Gambar dan Ikon

- Elemen dekoratif dan ikon visual dilengkapi dengan atribut `aria-hidden="true"`.
- Setiap kartu produk memiliki teks alternatif dan nama aksesibel yang mendeskripsikan produk secara komprehensif.

---

## 5. Bukti Tangkapan Layar Pengujian

Tangkapan layar pengujian antarmuka dan validasi tersimpan pada direktori [`evidence/`](./):

1. **Desktop (≥ 1024 px):** [`evidence/beranda-desktop.png`](./beranda-desktop.png)
2. **Tablet (768 px):** [`evidence/beranda-tablet.png`](./beranda-tablet.png)
3. **Ponsel (≤ 640 px):** [`evidence/beranda-mobile.png`](./beranda-mobile.png)
4. **Formulir Validasi Klien (State Error):** [`evidence/form-validasi.png`](./form-validasi.png)
5. **Formulir Berhasil Submit & Enkripsi:** [`evidence/form-berhasil.png`](./form-berhasil.png)
