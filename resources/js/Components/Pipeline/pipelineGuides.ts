export type PipelineGuidePhaseKey = 'setup' | 'scoring' | 'bwm' | 'edas' | 'tieBreaking' | 'result';

export interface PipelineGuideContentSection {
    title: string;
    items: string[];
}

export interface PipelineGuideContent {
    summary?: string;
    sections: PipelineGuideContentSection[];
    note?: string;
}

export interface PipelineGuideEntry {
    title: string;
    content: PipelineGuideContent;
}

export const PIPELINE_GUIDES: Record<PipelineGuidePhaseKey, PipelineGuideEntry> = {
    setup: {
        title: 'Panduan Kriteria',
        content: {
            summary: 'Tahap ini menetapkan struktur penilaian. Semua tahap setelah ini membaca konfigurasi kriteria yang Anda finalkan di sini.',
            sections: [
                {
                    title: 'Yang harus final di tahap ini',
                    items: [
                        'Setiap kriteria wajib punya kode, nama, sifat benefit atau cost, dan format input numerik atau kategorikal.',
                        'Kriteria numerik akan langsung dipakai sebagai angka pada matriks keputusan, misalnya pre-test atau rapor.',
                        'Kriteria kategorikal wajib punya subskala numerik, misalnya "Sangat Baik" = 5 dan "Baik" = 4.',
                    ],
                },
                {
                    title: 'Dampak ke pipeline',
                    items: [
                        'Tahap peserta membaca daftar kriteria ini untuk membentuk kolom matriks keputusan.',
                        'Tahap BWM memberi bobot ke kriteria yang sudah final di sini.',
                        'Jika subskala diubah setelah peserta masuk, sinkronkan skor lagi agar label kategorikal diterjemahkan ulang dengan benar.',
                    ],
                },
                {
                    title: 'Praktik yang aman',
                    items: [
                        'Jaga jumlah kriteria tetap fokus agar pembobotan dan evaluasi lebih stabil.',
                        'Gunakan label subskala yang mudah dikenali operator dan konsisten dengan template Excel.',
                        'Pastikan benefit atau cost benar karena arah ini dipakai langsung saat EDAS menghitung deviasi.',
                    ],
                },
            ],
        },
    },
    scoring: {
        title: 'Panduan Peserta dan Nilai',
        content: {
            summary: 'Tahap ini mengubah data peserta menjadi matriks keputusan. Semua nilai harus lengkap di sini sebelum bobot dan skor akhir dihitung.',
            sections: [
                {
                    title: 'Sumber data',
                    items: [
                        'Data bisa dimasukkan manual atau melalui template Excel langsung dari pipeline.',
                        'Kolom Pre-Test dan Rapor diisi dengan nilai 0-100, lalu otomatis diklasifikasi ke skor 1-5 saat sinkronisasi.',
                        'Kolom Jarak Domisili diisi dalam kilometer, lalu otomatis diklasifikasi ke skor 1-5 (semakin dekat mendapat skor lebih tinggi sehingga diolah sebagai benefit).',
                        'Kolom Wawancara dan Kesiapan Pelatihan langsung diisi skor 1-5.',
                    ],
                },
                {
                    title: 'Apa yang dikerjakan sinkron skor',
                    items: [
                        'Sistem memetakan field inti peserta ke kode kriteria C1 sampai C5 lalu membuat skor per kriteria untuk setiap peserta.',
                        'Untuk kriteria numerik, angka peserta disalin langsung ke skor.',
                        'Untuk kriteria kategorikal, label peserta dicocokkan ke subskala aktif lalu diubah menjadi nilai numerik.',
                    ],
                },
                {
                    title: 'Checklist sebelum lanjut',
                    items: [
                        'Minimal ada tiga peserta agar pembandingan antarpeserta bermakna.',
                        'Setiap peserta harus memiliki nilai pada semua kriteria.',
                        'Jika ada perubahan data peserta atau subskala, jalankan sinkron ulang sebelum memproses EDAS.',
                    ],
                },
            ],
        },
    },
    bwm: {
        title: 'Panduan BWM',
        content: {
            summary: 'BWM mengubah preferensi operator menjadi bobot kriteria. Inputnya hanya dua vektor skala 1 sampai 9, lalu sistem menghitung bobot dengan total 1, deviasi maksimum atau xi, dan consistency ratio.',
            sections: [
                {
                    title: 'Input yang Anda isi',
                    items: [
                        'Pilih satu kriteria terbaik, yaitu yang paling penting dalam proses seleksi.',
                        'Pilih satu kriteria terendah, yaitu yang tetap dipakai tetapi prioritasnya paling kecil.',
                        'Isi skala 1 sampai 9 untuk dua vektor: Best-to-Others dan Others-to-Worst. Nilai 1 berarti setara, nilai 9 berarti jauh lebih penting.',
                    ],
                },
                {
                    title: 'Bagaimana angka 1 sampai 9 diolah',
                    items: [
                        'Sistem lebih dulu memvalidasi bahwa semua nilai berada pada rentang 1 sampai 9 dan perbandingan kriteria terhadap dirinya sendiri bernilai 1.',
                        'Dua vektor preferensi itu dipakai untuk membentuk bobot awal. Secara praktis sistem membaca pola: kriteria yang makin dekat ke best dan makin jauh dari worst cenderung mendapat bobot lebih besar.',
                        'Bobot awal lalu dinormalisasi agar total seluruh bobot tepat sama dengan 1.',
                    ],
                },
                {
                    title: 'Bagaimana sistem menghitung bobot akhir',
                    items: [
                        'Sistem menjalankan optimasi deterministic simplex pattern search untuk mencari kombinasi bobot yang meminimalkan deviasi maksimum atau xi.',
                        'Xi dihitung dari selisih terbesar antara bobot best terhadap bobot lain dan bobot lain terhadap worst dibandingkan preferensi yang Anda isi.',
                        'Semakin kecil xi, semakin dekat bobot akhir terhadap pola prioritas yang Anda maksud.',
                    ],
                },
                {
                    title: 'Output yang keluar',
                    items: [
                        'Setiap kriteria memperoleh bobot numerik, misalnya 0.320000 atau 0.185000. Bobot ini langsung dipakai EDAS.',
                        'Sistem menampilkan xi atau deviasi maksimum sebagai ukuran kecocokan model terhadap input Anda.',
                        'Sistem menghitung consistency ratio dari xi dan referensi consistency index. Pada aplikasi ini nilai <= 0.1 ditandai konsisten.',
                    ],
                },
                {
                    title: 'Kenapa metode ini dipakai',
                    items: [
                        'Operator tidak perlu membandingkan semua pasangan kriteria satu per satu seperti pairwise penuh.',
                        'Jumlah input lebih sedikit tetapi hasilnya tetap defensibel karena ada optimasi dan ukuran konsistensi.',
                        'Jika hasil belum konsisten, ulangi skala 1 sampai 9 sampai pola prioritas benar-benar sesuai keputusan Anda.',
                    ],
                },
            ],
            note: 'BWM tidak menilai peserta. BWM hanya menghasilkan bobot kriteria yang nanti dipakai EDAS pada matriks peserta.',
        },
    },
    edas: {
        title: 'Panduan EDAS',
        content: {
            summary: 'EDAS mengubah matriks keputusan dan bobot BWM menjadi appraisal score. Intinya, sistem membandingkan nilai setiap peserta terhadap rata-rata pada setiap kriteria.',
            sections: [
                {
                    title: 'Data yang masuk',
                    items: [
                        'Sistem mengambil matriks keputusan hasil tahap scoring, yaitu angka peserta pada setiap kriteria.',
                        'Sistem mengambil bobot kriteria hasil BWM.',
                        'Setiap kriteria tetap mengikuti arah benefit atau cost yang ditetapkan saat setup.',
                    ],
                },
                {
                    title: 'Langkah 1: average solution',
                    items: [
                        'Untuk setiap kriteria, sistem menghitung rata-rata seluruh peserta. Nilai ini menjadi titik acuan.',
                        'Contoh sederhana: jika rata-rata pre-test adalah 78, maka nilai 82 dan 74 sama-sama dibaca relatif terhadap 78.',
                        'Jika rata-rata sebuah kriteria bernilai 0, sistem menetapkan deviasi positif dan negatif sebagai 0 agar perhitungan tetap aman.',
                    ],
                },
                {
                    title: 'Langkah 2: PDA dan NDA',
                    items: [
                        'Untuk kriteria benefit, nilai di atas rata-rata menjadi PDA dan nilai di bawah rata-rata menjadi NDA.',
                        'Untuk kriteria cost, logikanya dibalik: nilai di bawah rata-rata menjadi PDA karena lebih baik, sedangkan nilai di atas rata-rata menjadi NDA.',
                        'Setiap deviasi dibagi nilai rata-rata absolut kriteria agar semua kriteria berada pada skala yang sebanding.',
                    ],
                },
                {
                    title: 'Langkah 3: pembobotan dan appraisal score',
                    items: [
                        'PDA berbobot dijumlahkan menjadi SP dan NDA berbobot dijumlahkan menjadi SN.',
                        'SP dinormalisasi menjadi NSP dengan membandingkan terhadap SP tertinggi. SN dinormalisasi menjadi NSN dengan rumus 1 - SN/maxSN.',
                        'Skor akhir EDAS atau appraisal score adalah rata-rata dari NSP dan NSN. Makin tinggi nilainya, makin baik posisi peserta.',
                    ],
                },
                {
                    title: 'Output yang perlu dibaca operator',
                    items: [
                        'Average solution menunjukkan titik acuan setiap kriteria.',
                        'Matriks PDA dan NDA menjelaskan sumber kontribusi positif dan negatif tiap peserta.',
                        'Tabel appraisal score adalah ranking kualitas peserta yang akan dipakai sebagai hasil akhir.',
                    ],
                },
            ],
        },
    },

    tieBreaking: {
        title: 'Panduan Tie-Breaking',
        content: {
            summary: 'Tie-breaking diselesaikan secara otomatis ketika dua atau lebih peserta memiliki nilai Appraisal Score (AS) EDAS yang identik. Tahap ini menampilkan transparansi proses pemecahan nilai seri.',
            sections: [
                {
                    title: 'Kapan tie-breaking terjadi',
                    items: [
                        'Tie-breaking aktif ketika minimal dua peserta memiliki nilai AS yang sama hingga presisi 6 angka desimal.',
                        'Jika seluruh peserta memiliki nilai AS unik, tahap ini hanya menampilkan konfirmasi bahwa tidak ada nilai seri.',
                        'Sistem menangani tie-breaking secara otomatis sehingga tidak ada aksi manual yang diperlukan di sini.',
                    ],
                },
                {
                    title: 'Mekanisme pemecahan nilai seri',
                    items: [
                        'Kriteria diurutkan berdasarkan bobot BWM dari tertinggi ke terendah.',
                        'Untuk setiap kelompok nilai seri, sistem membandingkan nilai raw peserta pada kriteria berbobot tertinggi.',
                        'Peserta dengan nilai lebih tinggi pada kriteria benefit (atau lebih rendah pada kriteria cost) mendapat peringkat lebih baik.',
                        'Jika masih seri setelah kriteria pertama, dilanjutkan ke kriteria berikutnya secara berurutan.',
                        'Jika seluruh kriteria habis dan masih seri, sistem menggunakan urutan abjad nama peserta sebagai pembeda terakhir.',
                    ],
                },
                {
                    title: 'Yang ditampilkan di halaman ini',
                    items: [
                        'Bobot kriteria hasil BWM yang menentukan urutan prioritas tie-breaking.',
                        'Daftar kelompok nilai seri beserta informasi kriteria pembeda yang digunakan.',
                        'Tabel perbandingan peringkat EDAS awal versus peringkat final setelah tie-breaking.',
                    ],
                },
            ],
            note: 'Peringkat final yang ditampilkan di sini adalah peringkat yang sama yang digunakan pada halaman Hasil Akhir.',
        },
    },

    result: {
        title: 'Panduan Hasil Akhir',
        content: {
            summary: 'Tahap akhir merangkum bobot, skor EDAS, dan ranking final untuk keputusan operasional.',
            sections: [
                {
                    title: 'Yang ditampilkan',
                    items: [
                        'Tiga peserta teratas untuk pembacaan cepat.',
                        'Tabel ranking lengkap dengan skor EDAS.',
                        'Informasi eksekusi run agar hasil dapat diaudit berdasarkan periode dan waktu proses.',
                    ],
                },
                {
                    title: 'Cara membaca hasil',
                    items: [
                        'Gunakan ranking final sebagai rekomendasi utama, bukan pengganti verifikasi administratif.',
                        'Jika hasil terasa tidak sesuai intuisi, periksa data peserta dan bobot BWM lebih dulu sebelum mengubah keputusan.',
                        'Saat kriteria atau peserta berubah, jalankan ulang tahap yang relevan agar hasil tetap valid.',
                    ],
                },
            ],
        },
    },
};
