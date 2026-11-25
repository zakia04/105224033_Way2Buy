# Dokumen Teknis Modul 7: Debugging dan Telaah Kode

* **Nama / NIM:** Zakiati Latifa / 105224033
* **Repositori:** https://github.com/zakia04/105224033_way2buy

---

## 1. Lingkungan dan Konfigurasi Debugger

* **Sistem Operasi & Runtime:** Windows, Node.js v24 LTS
* **Framework & Bundler:** Next.js 16.4.1 (Turbopack), Prisma ORM 7.x, PostgreSQL 18
* **Peramban & Ekstensi:** Google Chrome + React Developer Tools (`fmkadmapgofadopljbjfkapdkoienihi`)
* **Hash Commit Awal (`praktikum/modul-07`):** `[isi-hash-7-digit-dari-git-log--oneline--1]`

### Konfigurasi `.vscode/launch.json`
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev --inspect"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/next/dist/bin/next",
      "runtimeArgs": ["--inspect"],
      "skipFiles": ["<node_internals>/**"],
      "serverReadyAction": {
        "action": "debugWithChrome",
        "killOnServerStop": true,
        "pattern": "- Local:.+(https?://.+)",
        "uriFormat": "%s",
        "webRoot": "${workspaceFolder}"
      }
    }
  ]
}
```

---

## 2. Daftar Galat yang Ditelusuri

| No | Issue | Gejala | Lapisan | Akar Penyebab | Status / Tindakan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `#11` | Muncul overlay `Console Error: The children should not have changed if we pass in the same set.` dengan badge `Next.js 16.4.1 (stale) Turbopack` saat halaman dijalankan | Peramban (Ekstensi DevTools & Cache Klien) | Ketidakcocokan sinkronisasi pohon *Virtual Fiber* pada *hook* ekstensi React Developer Tools (`installHook.js`) terhadap React 19 / Next.js 16.4.1 Turbopack serta cache bundel `stale` | Diselesaikan tanpa mengubah kode aplikasi (Hard Reload & isolasi ekstensi) |

---

## 3. Catatan Penelusuran

### 3.1 `Console Error: The children should not have changed if we pass in the same set.`

* **Langkah Reproduksi:**
  * **Lingkungan:** Node.js 24, Next.js 16.4.1 (Turbopack), Google Chrome dengan ekstensi React Developer Tools aktif, branch `praktikum/modul-07`.
  * **Data Awal:** Aplikasi `way2buy_105224033` dijalankan dalam mode development (`npm run dev --inspect`).
  1. Buka aplikasi Way2Buy (`http://localhost:3000`) di Google Chrome dalam kondisi ekstensi React Developer Tools aktif.
  2. Lakukan navigasi atau pembaruan halaman saat status bundel klien berada dalam kondisi `(stale)`.
  3. Amati dialog overlay Next.js DevTools yang muncul di layar (`Issues 1/1`).
  * **Hasil yang Diharapkan:** Halaman dirender bersih tanpa *Console Error* maupun status bundel usang (`stale`).
  * **Hasil Aktual:** Muncul dialog overlay merah dengan pesan `Console Error: The children should not have changed if we pass in the same set.` beserta badge `Next.js 16.4.1 (stale) Turbopack` di pojok kanan atas.
  * **Frekuensi:** Muncul konsisten saat ekstensi React Developer Tools menyuntikkan *hook* pada sesi bundel yang belum tersinkronisasi.

* **Bukti Penelusuran (Tangkapan Layar & Pembacaan Call Stack):**
  ![Bukti Console Error dan Call Stack](docs/praktikum/evidence/Issue.png)

  Pembacaan **Call Stack** (50 frame) dari urutan teratas menunjukkan:
  ```text
  updateFiberRecursively
  chrome-extension://fmkadmapgofadopljbjfkapdkoienihi/build/installHook.js (1:114434)

  updateVirtualChildrenRecursively
  chrome-extension://fmkadmapgofadopljbjfkapdkoienihi/build/installHook.js (1:109538)

  updateChildrenRecursively
  chrome-extension://fmkadmapgofadopljbjfkapdkoienihi/build/installHook.js (1:109894)

  updateVirtualInstanceRecursively
  chrome-extension://fmkadmapgofadopljbjfkapdkoienihi/build/installHook.js (1:107953)
  ```

* **Analisis Lapisan dan Akar Penyebab:**
  1. **Penentuan Lapisan Galat:** Berdasarkan prinsip pembacaan *stack trace* dari frame paling atas, seluruh rantai pemanggilan fungsi berasal dari `chrome-extension://fmkadmapgofadopljbjfkapdkoienihi/build/installHook.js`. Tidak ada satu pun frame yang menunjuk ke berkas kode aplikasi (`app/`, `components/`, atau `lib/`).
  2. **Identifikasi Sumber Eksternal:** ID `fmkadmapgofadopljbjfkapdkoienihi` merupakan identitas resmi ekstensi peramban **React Developer Tools**. Berkas `installHook.js` adalah *script* injeksi ekstensi yang memantau perubahan pohon komponen React di peramban.
  3. **Akar Penyebab:** Pesan *"The children should not have changed if we pass in the same set."* adalah galat internal rekonsiliasi *Virtual Fiber* milik ekstensi React Developer Tools saat membaca struktur komponen React 19 yang dikompilasi oleh **Next.js 16.4.1 Turbopack**. Kondisi ini diperkuat oleh indikator **`Next.js 16.4.1 (stale) Turbopack`** di pojok kanan atas yang menandakan *bundle* JavaScript di tab peramban sudah usang (*stale*) dibanding status kompilasi terbaru pada server.

* **Langkah Penyelesaian (Tanpa Mengubah Kode Proyek):**
  Karena akar penyebab terbukti berada pada lapisan ekstensi peramban dan cache klien (bukan *bug* pada logika aplikasi Way2Buy), kode sumber aplikasi **tidak diubah**:
  1. Melakukan **Hard Reload** (`Ctrl + Shift + R`) di Google Chrome untuk menyegarkan bundel klien yang berstatus `(stale)` hingga indikator kembali menjadi `Next.js 16.4.1 Turbopack`.
  2. Menutup dialog overlay galat Next.js (`×`) agar tidak menghalangi interaksi antarmuka.
  3. Mengisolasi penggunaan ekstensi **React Developer Tools** melalui `chrome://extensions` (hanya diaktifkan saat membutuhkan inspeksi *props* dan *state* komponen secara spesifik).

* **Bukti Sesudah Penyelesaian:**
  Setelah dilakukan *Hard Reload* dan penyegaran sesi peramban, badge `(stale)` hilang, overlay `Console Error` tidak lagi muncul, dan seluruh halaman aplikasi Way2Buy berjalan normal.

---

## 4. Keputusan Teknis

* **Menghindari *False Diagnosis* pada Kode Aplikasi:**
  Saat melihat overlay merah Next.js, tindakan mengubah komponen React atau Server Action secara spekulatif tanpa membaca *Call Stack* akan merusak kode yang sebenarnya valid. Dengan memverifikasi asal frame di `chrome-extension://.../installHook.js`, diputuskan bahwa tidak diperlukan perubahan kode pada repositori dan penanganan cukup dilakukan pada lingkungan peramban serta penyegaran bundel Turbopack.

---

## 5. Catatan Pemanfaatan AI

* **Alat yang Digunakan:** Asisten AI (LLM) digunakan untuk membantu menganalisis arti pesan *stack trace* internal `installHook.js` milik ekstensi React Developer Tools dan menyusun format dokumentasi teknis.
* **Verifikasi Mandiri:** Validasi dilakukan dengan mencocokkan ID ekstensi (`fmkadmapgofadopljbjfkapdkoienihi`) pada halaman `chrome://extensions` serta melakukan pengujian muat ulang (*Hard Reload*) langsung pada proyek `way2buy_105224033`.