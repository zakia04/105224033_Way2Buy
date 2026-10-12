# 4. Risk Assessment

Risk Assessment merupakan proses evaluasi terhadap setiap ancaman yang telah diidentifikasi pada threat model untuk menentukan tingkat risikonya. Penilaian dilakukan berdasarkan dua faktor utama, yaitu **Likelihood** (kemungkinan terjadinya ancaman) dan **Impact** (dampak yang ditimbulkan jika ancaman terjadi). Hasil penilaian ini digunakan untuk memprioritaskan risiko dan menentukan strategi penanganan yang tepat.

---

## 4.1 Skala Likelihood

Likelihood mengukur seberapa besar kemungkinan suatu ancaman dapat terjadi. Penilaian likelihood mempertimbangkan faktor-faktor seperti kemudahan eksploitasi, ketersediaan tools penyerang, tingkat keahlian yang dibutuhkan, serta kondisi kontrol keamanan yang saat ini diterapkan pada sistem.

| Nilai | Kategori | Keterangan |
|---|---|---|
| 5 | Very High | Sangat mungkin terjadi |
| 4 | High | Kemungkinan tinggi terjadi |
| 3 | Moderate | Kemungkinan sedang terjadi |
| 2 | Low | Kemungkinan rendah terjadi |
| 1 | Very Low | Sangat kecil kemungkinan terjadi |

---

## 4.2 Skala Impact

Impact mengukur seberapa besar dampak yang ditimbulkan jika suatu ancaman berhasil dieksploitasi. Penilaian impact mempertimbangkan potensi kerugian terhadap kerahasiaan data, integritas sistem, ketersediaan layanan, reputasi organisasi, serta kerugian finansial yang mungkin terjadi.

| Nilai | Kategori | Keterangan |
|---|---|---|
| 5 | Very High | Dampak sangat besar terhadap kerahasiaan, integritas, atau ketersediaan |
| 4 | High | Dampak besar terhadap sistem atau data |
| 3 | Moderate | Dampak sedang |
| 2 | Low | Dampak kecil |
| 1 | Very Low | Dampak sangat kecil |

---

## 4.3 Risk Calculation

Risk score dihitung dengan mengalikan nilai likelihood dengan nilai impact. Pendekatan kuantitatif ini memberikan nilai numerik yang dapat digunakan untuk membandingkan dan memprioritaskan risiko secara objektif. Semakin tinggi risk score, semakin mendesak risiko tersebut untuk ditangani.

Rumus:

```text
Risk = Likelihood × Impact
```

Kategori risiko:

| Score | Kategori |
|---|---|
| 15–25 | Very High |
| 8–14 | High |
| 4–7 | Moderate |
| 1–3 | Low |

---

## 4.4 Risk Register

Risk Register merupakan tabel yang merangkum seluruh hasil penilaian risiko untuk setiap threat yang telah diidentifikasi. Tabel ini menjadi acuan utama dalam menentukan prioritas penanganan risiko dan alokasi sumber daya keamanan.

| ID | Threat | Likelihood | Impact | Risk Score | Level | Alasan |
|---|---|---:|---:|---:|---|---|
| T-01 | Credential stuffing / account takeover | 4 | 4 | 16 | Very High | Serangan terhadap login relatif mudah dilakukan dan dapat menyebabkan pengambilalihan akun. |
| T-02 | Privilege escalation ke admin | 4 | 5 | 20 | Very High | Admin memiliki hak akses tinggi sehingga kompromi akun dapat berdampak besar terhadap sistem. |
| T-03 | Manipulasi parameter pesanan | 4 | 4 | 16 | Very High | Manipulasi order dapat menyebabkan kerugian transaksi dan perubahan data pesanan. |
| T-04 | SQL Injection | 3 | 5 | 15 | Very High | SQL Injection dapat memberikan akses terhadap data sensitif dalam database. |
| T-05 | Data exposed in transit | 2 | 5 | 10 | High | Jika komunikasi tidak dilindungi TLS, data sensitif dapat disadap. |
| T-06 | Flooding / DoS | 4 | 4 | 16 | Very High | Request dalam jumlah besar dapat mengganggu availability layanan. |
| T-07 | Repudiation karena audit log tidak memadai | 3 | 3 | 9 | High | Aktivitas penting sulit dibuktikan apabila tidak terdapat pencatatan yang memadai. |
| T-08 | Fake Payment Gateway response | 3 | 5 | 15 | Very High | Pembayaran palsu dapat menyebabkan sistem menganggap transaksi berhasil tanpa pembayaran sebenarnya. |
| T-09 | Direct database access | 3 | 5 | 15 | Very High | Akses langsung ke database dapat mengekspos data dalam jumlah besar. |
| T-10 | Backup disclosure | 3 | 5 | 15 | Very High | Backup dapat berisi data aplikasi dalam jumlah besar sehingga kebocoran berdampak tinggi. |
| T-11 | Unauthorized jastiper data modification | 3 | 3 | 9 | High | Perubahan tidak sah dapat merusak informasi layanan dan reputasi jastiper. |
| T-12 | Backup deletion/damage | 2 | 5 | 10 | High | Kerusakan backup dapat menghambat proses pemulihan sistem ketika terjadi insiden. |

---

# 5. Priority Risk

Berdasarkan hasil risk assessment, lima risiko berikut dipilih sebagai prioritas tertinggi karena memiliki risk score paling besar. Kelima risiko ini memerlukan penanganan segera melalui strategi **Mitigate**, yaitu menerapkan kontrol keamanan yang bertujuan untuk mengurangi likelihood dan/atau impact dari masing-masing risiko.

| Prioritas | ID | Risiko | Score | Response |
|---|---|---|---:|---|
| 1 | T-02 | Privilege escalation ke admin | 20 | Mitigate |
| 2 | T-01 | Credential stuffing / account takeover | 16 | Mitigate |
| 3 | T-03 | Manipulasi parameter pesanan | 16 | Mitigate |
| 4 | T-06 | Denial of Service | 16 | Mitigate |
| 5 | T-04 | SQL Injection | 15 | Mitigate |

---

# 6. Control Plan

Control Plan menjabarkan langkah-langkah pengendalian keamanan (security controls) yang direkomendasikan untuk setiap risiko prioritas. Setiap control plan mencakup deskripsi risiko, kontrol yang perlu diterapkan, dan tujuan dari penerapan kontrol tersebut. Kontrol ini dirancang berdasarkan prinsip **defense in depth**, yaitu menerapkan beberapa lapisan pertahanan untuk mengurangi risiko secara menyeluruh.

## 6.1 T-02 — Privilege Escalation

**Risiko:**  
Pengguna biasa memperoleh hak akses administrator.

**Control:**

- Implementasi Role-Based Access Control (RBAC).
- Setiap endpoint admin harus melakukan authorization di sisi server.
- Jangan hanya mengandalkan pembatasan menu pada frontend.
- Melakukan pengujian terhadap endpoint admin menggunakan akun dengan role berbeda.
- Menerapkan prinsip least privilege.

**Tujuan:**  
Memastikan hanya akun yang memiliki role admin yang dapat mengakses fungsi administrasi.

---

## 6.2 T-01 — Credential Stuffing / Account Takeover

**Risiko:**  
Penyerang mengambil alih akun pengguna melalui percobaan login berulang.

**Control:**

- Menerapkan rate limiting pada endpoint login.
- Menggunakan password hashing yang kuat.
- Menerapkan temporary account lockout setelah sejumlah percobaan gagal.
- Menerapkan MFA terutama untuk akun admin.
- Mencatat aktivitas login pada authentication log.

**Tujuan:**  
Mengurangi kemungkinan brute force dan credential stuffing serta mendeteksi aktivitas login yang mencurigakan.

---

## 6.3 T-03 — Manipulasi Parameter Pesanan

**Risiko:**  
Penyerang mengubah harga, jumlah, atau status pesanan melalui request.

**Control:**

- Melakukan validasi input di sisi server.
- Melakukan authorization pada setiap operasi pesanan.
- Menerapkan enkripsi simetris terotentikasi (AES-256-GCM) pada data pesanan sensitif (alamat pengiriman konsumen D-05) di sisi server (`way2buy/lib/crypto.ts`) untuk menjamin integritas melalui *authentication tag*.
- Tidak mempercayai harga atau status yang dikirim oleh client.
- Mengambil harga dari sumber data server.
- Memvalidasi kembali data sebelum transaksi diproses.

**Tujuan:**  
Memastikan data transaksi dan pesanan ditentukan serta divalidasi oleh server, serta integritas data terlindungi dari modifikasi tidak sah.

---

## 6.4 T-06 — Denial of Service

**Risiko:**  
Penyerang membanjiri server dengan request dalam jumlah besar.

**Control:**

- Menerapkan rate limiting.
- Menerapkan request throttling.
- Membatasi ukuran request.
- Melakukan monitoring terhadap traffic yang tidak normal.
- Memberikan pembatasan khusus pada endpoint yang sensitif seperti login dan pencarian.

**Tujuan:**  
Menjaga availability aplikasi dan mengurangi dampak traffic berlebihan.

---

## 6.5 T-07 — SQL Injection

**Risiko:**  
Penyerang menyisipkan SQL berbahaya untuk membaca atau mengubah database.

**Control:**

- Menggunakan parameterized query/prepared statement.
- Menggunakan ORM apabila sesuai dengan kebutuhan aplikasi.
- Melakukan validasi input.
- Tidak menggabungkan input pengguna secara langsung ke query SQL.
- Menggunakan database account dengan prinsip least privilege.

**Tujuan:**  
Mencegah input pengguna dieksekusi sebagai bagian dari perintah SQL dan membatasi dampak jika terjadi kompromi.
