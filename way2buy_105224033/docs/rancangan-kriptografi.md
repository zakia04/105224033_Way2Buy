# Rancangan Komponen Kriptografi Way2Buy

Dokumen ini menjelaskan secara teknis dan mendalam perancangan komponen kriptografi untuk produk Way2Buy.

---

## 1. Konteks Bisnis dan Aset Informasi

Way2Buy merupakan platform perantara pemesanan produk lokal (jastip). Konsumen menitipkan pembelian produk ke jastiper lokal yang sedang berada di kota asal produk.

Dalam alur bisnis ini, konsumen memberikan informasi alamat pengiriman agar jastiper atau kurir dapat mengirimkan barang yang telah dibeli. Alamat pengiriman merupakan **Personally Identifiable Information (PII)** dan diklasifikasikan sebagai:
- **Aset D-05 (Data Pesanan)** dalam `security/asset-inventory.md`.
- **Kebutuhan Keamanan:** Kerahasiaan (Confidentiality) dan Integritas (Integrity).
- **Tingkat Prioritas:** Tinggi (High).

---

## 2. Model Ancaman (Threat Model STRIDE)

Berdasarkan analisis ancaman pada `security/threat-model.md`:

1. **T-09 — Akses Langsung Basis Data (Information Disclosure):**
   Jika penyerang berhasil mengakses database Way2Buy melalui celah keamanan infrastruktur, alamat pengiriman konsumen tidak boleh terbaca dalam bentuk teks polos (*plaintext*).
2. **T-10 — Kebocoran Cadangan Basis Data (Backup Disclosure):**
   Salinan cadangan database (Aset B-01 / F6) yang bocor atau dicuri penyerang tidak akan mengekspos alamat konsumen karena tersimpan dalam bentuk *ciphertext*.
3. **T-03 — Manipulasi Parameter Pesanan (Tampering):**
   Penyerang di jalur transit (*Man-in-the-Middle*) atau pihak ketiga yang berusaha memanipulasi alamat pengiriman akan langsung terdeteksi karena perubahan pada ciphertext akan menggagalkan verifikasi *Authentication Tag*.

---

## 3. Spesifikasi Teknis Algoritma

```
+-------------------------------------------------------------+
|                      AES-256-GCM                            |
|  - Cipher simetris blok 128-bit                             |
|  - Panjang kunci: 256-bit (32 byte)                         |
|  - Mode operasi: Galois/Counter Mode (GCM)                  |
|  - Panjang IV: 96-bit (12 byte) (NIST SP 800-38D)           |
|  - Panjang Authentication Tag: 128-bit (16 byte)            |
|  - Sumber keacakan: OpenSSL CSPRNG (crypto.randomBytes)     |
|  - Representasi data: Base64 string                         |
+-------------------------------------------------------------+
```

### 3.1 Diagram Alir Enkripsi
```
[ Alamat Plaintext ]
         │
         ▼
[ Validasi Input ] ──(Gagal)──► Throw Error
         │ (Lolos)
         ▼
[ crypto.randomBytes(12) ] ──► IV (12 Byte)
         │
         ▼
[ createCipheriv('aes-256-gcm', key, iv) ]
         │
         ├──────────────────────────────┐
         ▼                              ▼
  [ update() + final() ]         [ getAuthTag() ]
         │                              │
         ▼                              ▼
 [ Ciphertext Buffer ]          [ Auth Tag (16 Byte) ]
         │                              │
         └──────────────┬───────────────┘
                        ▼
            [ Encode ke Base64 ]
                        ▼
   [ EncryptedData { ciphertext, iv, authTag } ]
```

### 3.2 Diagram Alir Dekripsi
```
[ EncryptedData { ciphertext, iv, authTag } ]
         │
         ▼
[ Validasi Parameter ] ──(Gagal)──► Throw Error
         │ (Lolos)
         ▼
[ Decode Base64 ke Buffer ]
         │
         ▼
[ createDecipheriv('aes-256-gcm', key, ivBuf) ]
         │
         ▼
[ decipher.setAuthTag(authTagBuf) ]
         │
         ▼
[ decipher.update() + decipher.final() ]
         │
         ├─────────────────(Auth Tag Cocok)────────► [ Plaintext String ]
         │
         └─────────────────(Auth Tag Gagal)────────► [ Throw Error: Unsupported state ]
```

---

## 4. Keamanan Kunci (Key Management)

1. **Variabel Lingkungan:** Kunci tidak disimpan dalam repositori. Kunci hanya ada di memori proses server yang membaca variabel `WAY2BUY_ENCRYPTION_KEY`.
2. **Pembangkitan Kunci Acak:**
   ```bash
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
   ```
3. **Pemisahan Lingkungan:** Pengujian otomatis (`tests/crypto.test.ts`) menggunakan kunci sintetis terisolasi yang di-*generate* saat runtime pengujian, sehingga pengujian tidak bergantung pada file eksternal maupun kunci produksi.
