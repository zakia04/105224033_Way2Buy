# Hardening Notes — Way2Buy

## 1. Pembaruan Sistem
**Tindakan:** Menjalankan `sudo apt update && sudo apt upgrade -y`.

**Alasan:** Memperbarui daftar paket dan memasang pembaruan perangkat lunak, termasuk pembaruan keamanan, untuk mengurangi risiko akibat kerentanan pada versi lama.

**Hasil:** Berhasil memperbarui 139 paket.

## 2. Pengamanan Direktori Sudoers
**Tindakan:** Menjalankan `sudo chmod 750 /etc/sudoers.d`.

**Alasan:** Membatasi akses terhadap direktori konfigurasi sudo agar tidak dapat diakses oleh semua pengguna.

**Hasil:** Permission berubah menjadi `750 root:root`.

## 3. Verifikasi Konfigurasi Sudoers
**Tindakan:** Menjalankan `sudo visudo -c`.

**Alasan:** Memastikan konfigurasi sudoers memiliki sintaks yang valid setelah perubahan permission.

**Hasil:** `/etc/sudoers: parsed OK`.

## 4. Pemeriksaan Pembaruan Otomatis
**Tindakan:** Memeriksa layanan dengan `systemctl status unattended-upgrades`.

**Alasan:** Memastikan mekanisme pembaruan keamanan otomatis tersedia dan berjalan.

**Hasil:** Layanan berstatus `enabled` dan `active (running)`.

## 5. Pemeriksaan Firewall
**Tindakan:** Memeriksa UFW menggunakan `sudo ufw status verbose` dan nftables menggunakan `sudo nft list ruleset`.

**Alasan:** Mengetahui ketersediaan dan konfigurasi firewall pada lingkungan sistem.

**Hasil:** Perintah UFW dan nftables tidak tersedia (`command not found`). Tidak dilakukan perubahan firewall karena lingkungan yang digunakan adalah WSL.

## 6. Pemeriksaan AppArmor
**Tindakan:** Menjalankan `sudo aa-status`.

**Alasan:** Memeriksa status mekanisme pembatasan akses aplikasi pada Linux.

**Hasil:** Modul AppArmor telah dimuat, tetapi filesystem AppArmor belum terpasang. Tidak dilakukan perubahan konfigurasi kernel WSL.

## 7. Pemeriksaan Akun dengan UID 0
**Tindakan:** Menjalankan `sudo awk -F: '$3 == 0 {print $1, $3}' /etc/passwd`.

**Alasan:** Memastikan tidak ada akun tambahan yang memiliki hak setara root.

**Hasil:** Hanya akun `root` yang memiliki UID 0.

## 8. Pemeriksaan Akun Tanpa Password
**Tindakan:** Menjalankan `sudo awk -F: '($2 == "") {print $1}' /etc/shadow`.

**Alasan:** Memeriksa apakah terdapat akun dengan kolom password kosong.

**Hasil:** Tidak ditemukan akun dengan kolom password kosong.

## Catatan Lingkungan
Audit dan hardening dilakukan pada Ubuntu yang berjalan melalui WSL, bukan pada VM VirtualBox atau host Windows. Beberapa fitur keamanan Linux dapat memiliki keterbatasan pada lingkungan WSL.

## 9. Pengaturan Default UMASK
**Tindakan:** Menambahkan `umask 027` ke `~/.profile` dan menerapkannya pada sesi aktif.

**Alasan:** Membatasi izin akses default file dan direktori baru agar tidak dapat diakses oleh pengguna lain yang tidak berwenang.

**Hasil:** Nilai UMASK berubah dari `0022` menjadi `0027`.

## 10. Audit Akhir Lynis
**Tindakan:** Menjalankan kembali `sudo lynis audit system --no-colors`.

**Hasil:** Hardening Index tetap 66 dengan 244 pengujian, 0 warnings, dan 37 suggestions.

**Evaluasi:** Pembaruan paket, pembatasan permission sudoers, dan pengaturan UMASK telah dilakukan. Namun, perubahan tersebut belum meningkatkan Hardening Index. Lynis masih menyarankan konfigurasi UMASK pada tingkat sistem melalui /etc/login.defs dan /etc/profile.

**Catatan:** Audit dilakukan pada Ubuntu WSL, sehingga beberapa fitur keamanan Linux memiliki keterbatasan.
