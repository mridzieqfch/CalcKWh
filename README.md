# ⚡ Kalkulator Token Listrik Serbaguna

Aplikasi web untuk menghitung estimasi **tagihan listrik harian**, **prabayar**, **pascabayar**, dan **industri**. Dirancang dengan antarmuka yang modern dan ramah pengguna, proyek ini memudahkan pengguna dalam memahami konsumsi listrik dan estimasi biayanya secara cepat dan akurat.

---

## 📋 Daftar Isi

- [Fitur](#fitur)
- [Tangkapan Layar](#tangkapan-layar)
- [Struktur Proyek](#struktur-proyek)
- [Cara Menjalankan](#cara-menjalankan)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Kontributor](#kontributor)
- [Lisensi](#lisensi)

---

## ✨ Fitur

✅ **Kalkulator Harian** — Menghitung estimasi biaya listrik berdasarkan daya alat, jam pemakaian, dan hari penggunaan dalam sebulan.  
✅ **Kalkulator Prabayar** — Menampilkan estimasi kWh yang akan didapat dari nominal pembelian token.  
✅ **Kalkulator Pascabayar** — Menghitung tagihan listrik berdasarkan meter awal dan akhir.  
✅ **Kalkulator Industri** — Mengakomodasi WBP, LWBP, dan kVARh lengkap dengan faktor kali dan estimasi biaya berdasarkan tarif PLN industri.  
✅ UI responsif dengan animasi ringan dan interaktif.  
✅ Notifikasi error dan validasi input otomatis.  
✅ Tampilan hasil dalam bentuk ringkasan dan detail perhitungan.

---

## 🖼️ Tampilan Page

> <img width="652" height="817" alt="image" src="https://github.com/user-attachments/assets/5fc111a8-6d0f-40ca-a806-00b05c78604e" />


---

---

## 🚀 Cara Menjalankan

Tidak memerlukan instalasi tambahan.

### Langkah-langkah:

1. Unduh atau clone repositori ini ke komputer Anda.
2. Buka file `index.html` menggunakan browser modern (Chrome, Firefox, Edge, Safari).
3. Gunakan fitur kalkulator yang tersedia:
   - **Harian** untuk menghitung biaya pemakaian alat listrik per bulan.
   - **Prabayar** untuk estimasi kWh dari nominal token.
   - **Pascabayar** untuk menghitung tagihan bulanan berdasarkan meter.
   - **Industri** untuk perhitungan tarif WBP, LWBP, dan kVARh.

> 💡 Tidak memerlukan koneksi internet setelah file dibuka. Semua kalkulasi berjalan lokal di browser.

---

## 🛠️ Teknologi yang Digunakan

| Teknologi     | Deskripsi                                      |
|---------------|------------------------------------------------|
| **HTML5**     | Struktur utama tampilan                        |
| **CSS3**      | Styling khusus menggunakan `style.css`         |
| **TailwindCSS** | Framework CSS utilitas melalui CDN          |
| **JavaScript**| Logika kalkulasi di semua mode (modular JS)    |
| **Boxicons & Phosphor Icons** | Ikon visual interaktif       |

---

## 👨‍💻 Kontributor

> Dibuat dan dikembangkan oleh:

- **🐍 Aping Kadut** — Desain antarmuka, logika kalkulasi, dan pengembangan front-end

---

## 📄 Lisensi

Proyek ini dirilis untuk keperluan edukatif dan penggunaan pribadi.

- ✅ Bebas digunakan, dimodifikasi, dan dibagikan.
- ❌ Tidak untuk diperjualbelikan tanpa izin tertulis.

**© 2025 – Made by Aping Kadut**


## 📁 Struktur Proyek

```plaintext
.
├── index.html               # Halaman utama kalkulator
├── assets/
│   ├── css/
│   │   └── style.css        # Styling khusus (floating input, tab, dll)
│   └── js/
│       ├── harian.js        # Logika kalkulator harian
│       ├── prabayar.js      # Logika kalkulator prabayar
│       ├── pascabayar.js    # Logika kalkulator pascabayar
│       └── industri.js      # Logika kalkulator industri
