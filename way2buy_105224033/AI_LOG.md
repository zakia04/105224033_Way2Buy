# Catatan Penggunaan AI (AI_LOG.md)

Dokumen ini mencatat secara transparan seluruh penggunaan asisten kecerdasan buatan (AI) selama perancangan, implementasi, dan membantu dalam pengujian komponen kriptografi pada produk Way2Buy.

---

## Tindakan dan Validasi

**Alat AI**: Google Antigravity (Gemini 3.8 Flash / Claude Opus Thinking) |

Setiap hasil yang disarankan oleh AI diperiksa dan divalidasi dengan kriteria berikut:
1. **Keamanan Tanpa Secret:** Memeriksa bahwa tidak ada kunci privat, token produksi, password, atau credential yang ditulis langsung ke dalam source code.
2. **Kesesuaian Aset:** Memastikan bahwa pemetaan aset (D-05, D-06, D-01) konsisten 100% dengan dokumen inventarisasi pada direktori `security/`.
3. **Pustaka Terpelihara:** Menolak penggunaan sandi klasik (seperti Caesar/Vigenere/XOR) dan memastikan modul resmi `node:crypto` yang digunakan.
4. **Data Sintetis:** Memastikan seluruh data nama dan alamat pada pengujian unit dan demo antarmuka adalah data sintetis (dummy).
5. **Kesesuaian Rubrik:** Memeriksa kelengkapan rubrik penilaian R1 (K1: 20 poin, K2: 20 poin, K3: 25 poin, K4: 25 poin, K5: 10 poin).
