# SPK Penerimaan Peserta LPKS

## Deskripsi

Aplikasi ini merupakan Sistem Pendukung Keputusan Penerimaan Peserta LPKS berbasis Laravel, Inertia React, dan TypeScript. Sistem mendukung alur penilaian terstruktur mulai dari pengelolaan periode, pengaturan 5 kriteria inti, input peserta, perhitungan BWM, evaluasi EDAS, hingga pemeringkatan akhir dengan Copeland.

## Teknologi

- Laravel
- PHP
- Inertia.js
- React
- TypeScript
- Vite
- MySQL

## Fitur Utama

- Login administrator
- Manajemen periode penilaian
- Konfigurasi 5 kriteria inti C1-C5
- Input peserta manual dan impor Excel
- Sinkronisasi `participant_scores` dari data peserta
- Pembobotan kriteria dengan BWM
- Perhitungan EDAS beserta nilai antara
- Pemeringkatan akhir dengan Copeland
- Tampilan hasil akhir per peserta

## Instalasi

1. Clone repository ini.
2. Jalankan `composer install`.
3. Jalankan `npm install`.
4. Salin `.env.example` menjadi `.env`.
5. Sesuaikan konfigurasi database, URL aplikasi, dan kredensial mail bila diperlukan.
6. Jalankan `php artisan key:generate`.

## Migrasi Database

1. Buat database MySQL kosong, misalnya `spk_lpks`.
2. Atur `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, dan `DB_PASSWORD` pada `.env`.
3. Jalankan `php artisan migrate:fresh`.
4. Jika membutuhkan akun admin awal dan template kriteria, jalankan `php artisan db:seed`.

Seeder bawaan hanya membuat admin awal dan periode dengan 5 kriteria inti. Seeder tidak mengisi peserta atau hasil perhitungan dummy.

## Menjalankan Aplikasi

### Mode pengembangan

1. Jalankan `php artisan serve`.
2. Jalankan `npm run dev`.
3. Buka URL aplikasi sesuai `APP_URL`.

### Build produksi

1. Pastikan file `public/hot` tidak ada.
2. Jalankan `npm run build`.
3. Laravel akan menggunakan manifest Vite pada `public/build/manifest.json`.

## Alur Penggunaan Singkat

1. Login sebagai administrator.
2. Buat atau pilih periode penilaian yang aktif.
3. Tinjau 5 kriteria inti C1-C5.
4. Tambahkan peserta secara manual atau impor Excel.
5. Jalankan sinkron skor agar `participant_scores` terisi dari data peserta.
6. Lengkapi penilaian peserta sampai seluruh skor tersedia.
7. Isi preferensi BWM: kriteria terbaik, kriteria terlemah, Best-to-Others, dan Others-to-Worst.
8. Jalankan perhitungan BWM untuk mendapatkan bobot, `xi`, dan `consistency ratio`.
9. Jalankan EDAS untuk memperoleh PDA, NDA, SP, SN, NSP, NSN, dan Appraisal Score.
10. Jalankan Copeland untuk menghasilkan jumlah menang, kalah, imbang, skor Copeland, dan ranking akhir.
11. Tinjau hasil akhir pada tahap hasil.

## Catatan Deploy

- Jangan sertakan file `.env`.
- Jangan gunakan `database/database.sqlite` sebagai sumber data produksi.
- Jalankan `php artisan config:clear`, `php artisan route:clear`, dan `php artisan view:clear` setelah update konfigurasi.
- Jalankan `npm run build` sebelum deploy agar aset frontend memakai build produksi.
