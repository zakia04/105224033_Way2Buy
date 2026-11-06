# Risk ID Mapping – Way2Buy

Dokumen ini menjelaskan hubungan antara risiko yang telah diidentifikasi pada Tugas 1 dengan kontrol keamanan yang diterapkan atau diperiksa pada Tugas 2.

## 1. Pemetaan Risiko dan Kontrol

| Risk ID | Risiko | Kontrol Tugas 2 | Status |
|---|---|---|---|
| T-02 | Privilege escalation ke admin | Proteksi endpoint admin menggunakan token, pengujian akses tanpa token dan token tidak valid, serta container berjalan sebagai user non-root dengan Linux capabilities terbatas. | Sebagian diterapkan |
| T-01 | Credential stuffing / account takeover | Belum terdapat mekanisme akun dan password pada aplikasi, sehingga password hashing, MFA, dan account lockout belum dapat diuji. | Belum diterapkan |
| T-03 | Manipulasi parameter pesanan | Validasi input menggunakan Zod, authorization pada endpoint admin, dan enkripsi AES-256-GCM untuk data pesanan sensitif. | Sebagian diterapkan |
| T-06 | Denial of Service | Belum terdapat bukti implementasi rate limiting dan request throttling. | Belum diterapkan |
| T-04 | SQL Injection | Penggunaan Prisma ORM dan validasi input membantu mengurangi risiko query berbahaya. | Sebagian diterapkan |
| T-09 | Direct database access | Tidak ada port database yang dipublikasikan oleh konfigurasi container yang diuji. | Diterapkan pada konfigurasi container yang diuji |

## 2. Kontrol Hardening Sistem

| Kontrol | Hasil | Keterangan |
|---|---|---|
| Pembaruan paket sistem | Berhasil | 139 paket diperbarui |
| Permission direktori sudoers | Berhasil | 750 root:root |
| Validasi konfigurasi sudoers | Berhasil | visudo -c menghasilkan parsed OK |
| Automatic security updates | Berhasil | unattended-upgrades aktif |
| Pemeriksaan akun UID 0 | Berhasil | Hanya root yang memiliki UID 0 |
| Pemeriksaan password kosong | Berhasil | Tidak ditemukan akun dengan password kosong |
| Pengaturan UMASK | Sebagian | UMASK sesi pengguna menjadi 0027 |
| Firewall | Belum diverifikasi | UFW dan nftables tidak tersedia pada WSL |
| AppArmor | Belum aktif sepenuhnya | Modul dimuat, tetapi filesystem AppArmor belum terpasang |
| SSH hardening | Belum diverifikasi | SSH daemon tidak tersedia pada lingkungan WSL |
| Lynis | Belum mencapai target | Hardening Index 66, target minimal 70 |

## 3. Container Hardening

Pengujian container menunjukkan hasil berikut:

- Aplikasi berjalan menggunakan user non-root `nextjs`.
- Effective Linux capabilities bernilai 0.
- Root filesystem container bersifat read-only.
- Aplikasi hanya dipublikasikan ke host melalui `127.0.0.1:3000`.
- Tidak ada port database yang dipublikasikan pada konfigurasi container yang diuji.
- Aplikasi berhasil memberikan HTTP Status 200.

## 4. Vulnerability Scanning dan SBOM

Pemindaian image menggunakan Trivy menunjukkan perubahan berikut:

| Severity | Scan Awal | Scan Akhir |
|---|---:|---:|
| CRITICAL | 2 | 0 |
| HIGH | 11 | 10 |
| MEDIUM | 12 | 12 |
| LOW | 1 | 1 |
| TOTAL | 26 | 23 |

Dua temuan CRITICAL pada pemindaian awal berkaitan dengan Next.js 16.4.0. Setelah dependency diperbarui ke Next.js 16.4.1 dan image dibangun ulang, temuan CRITICAL tidak lagi ditemukan.

Masih terdapat 23 temuan kerentanan sehingga image belum dapat dinyatakan bebas kerentanan.

SBOM dibuat menggunakan format CycloneDX 1.7 dan disimpan pada `security/sbom.cdx.json`.

## 5. Evaluasi

Penerapan kontrol pada Tugas 2 telah memberikan peningkatan keamanan pada aspek autentikasi endpoint admin, pembatasan hak akses container, dan pengurangan kerentanan dependency kritis.

Namun, beberapa kontrol belum dapat dinyatakan selesai, terutama password hashing, rate limiting, konfigurasi SSH, firewall, dan peningkatan Lynis Hardening Index hingga minimal 70.

Audit sistem dilakukan pada Ubuntu WSL, bukan VM VirtualBox. Oleh karena itu, hasil pemeriksaan sistem operasi harus dipahami sesuai keterbatasan lingkungan tersebut.
