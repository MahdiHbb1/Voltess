/**
 * Konten landing page Voltess
 * Semua teks dipisah dari komponen agar mudah diubah tim
 */

export const BRAND = {
  name: 'VOLTESS',
  tagline: 'Ke mana uang listrik usaha Anda pergi?',
  subtitle: 'Pahami listrik usaha Anda. Hemat dengan percaya diri.',
  forWho: 'Untuk UMKM Indonesia',
} as const;

export const HERO = {
  badge: 'Untuk UMKM Indonesia',
  title: 'Ke mana uang listrik usaha Anda pergi?',
  subtitle: 'Voltess membantu pemilik usaha melihat biaya listrik per alat dalam Rupiah, lalu memberi saran hemat yang jelas. Mulai dari game simulasi gratis. Tanpa sensor, tanpa ribet.',
  ctaPrimary: 'Coba Gratis',
  ctaSecondary: 'Lihat Cara Kerja',
  trustSignals: [
    'Gratis untuk dicoba',
    'Cukup foto & suara, < 2 menit/hari',
    'Bayar hanya setelah ada bukti hemat',
  ],
} as const;

export const PROBLEM_STRIP = {
  title: 'Masalah yang Kami Dengar',
  items: [
    'Tagihan listrik hanya satu angka total.',
    'Pemilik sudah menduga alat terbesar, tapi belum tahu berapa Rupiahnya.',
    'Tidak ada waktu untuk mencatat.',
  ],
  note: 'Berdasarkan wawancara awal dengan pelaku usaha laundry dan barbershop.',
} as const;

export const PROBLEMS = {
  title: 'Tagihan naik, tapi tidak tahu gara-gara apa.',
  items: [
    {
      problem: 'Tagihan naik, saya tidak tahu gara-gara apa.',
      solution: 'Voltess: estimasi biaya per alat/jam dalam Rupiah.',
    },
    {
      problem: 'Saya tidak tahu harus ngapain.',
      solution: '1–3 saran jelas dengan perkiraan hemat.',
    },
    {
      problem: 'Tidak sempat mencatat.',
      solution: 'Foto meter dan catatan suara, < 2 menit/hari.',
    },
    {
      problem: 'Takut bayar aplikasi yang belum tentu hemat.',
      solution: 'Gratis dulu, trial 30 hari, hasil terukur sebelum memutuskan.',
    },
  ],
} as const;

export const HOW_IT_WORKS = {
  title: 'Cara Kerja',
  subtitle: 'Dari main game sampai lihat hasil hemat dalam 30 hari',
  steps: [
    {
      number: 1,
      title: 'Main',
      description: 'Coba Kios Virtual gratis. Geser jam pakai, lihat biaya berubah. Tanpa data, tanpa daftar.',
    },
    {
      number: 2,
      title: 'Samakan dengan nyata',
      description: 'Ganti alat contoh dengan alat asli lewat foto label. Foto meter dan catatan suara singkat selama 7 hari.',
    },
    {
      number: 3,
      title: 'Dapat saran',
      description: 'Hari ke-7, Laporan Pertama: alat yang diperkirakan paling boros dan 1–3 saran dalam Rupiah.',
    },
    {
      number: 4,
      title: 'Lihat hasil',
      description: 'Hari ke-30, bandingkan dengan kondisi awal. Lanjut berlangganan hanya jika hasilnya terbukti.',
    },
  ],
} as const;

export const KIOS_VIRTUAL = {
  title: 'Kios Anda, jadi desa mini yang bisa Anda kelola',
  description: 'Pilih jenis usaha, kios langsung terisi alat-alat yang umum dipakai. Geser jam pakai dan lihat biaya listrik berubah. Selesaikan misi sederhana (foto label alat, foto meter, catatan suara) untuk menaikkan level kios, mendapat dekorasi, dan membuka laporan.',
  features: [
    'Maksimal 2 menit per hari',
    'Level naik dari tindakan nyata, bukan sekadar klik',
    'Hadiah nyata direncanakan: kredit langganan dan stiker "Usaha Hemat Energi"',
  ],
  featurePlanned: 'Hadiah nyata direncanakan: kredit langganan dan stiker "Usaha Hemat Energi"',
} as const;

export const AI_ENGINE = {
  title: 'Angka yang bisa Anda periksa, bukan tebakan',
  subtitle: 'Mesin AI yang jujur',
  points: [
    {
      title: 'Berbasis rumus',
      description: 'Daya alat × jam pakai, dicocokkan dengan angka meter.',
    },
    {
      title: 'Ada tingkat keyakinan',
      description: 'Tinggi / Sedang / Rendah. Bila data kurang, Voltess bilang "belum cukup data".',
    },
    {
      title: 'Selisih tidak dibagi paksa',
      description: 'Yang belum terjelaskan ditampilkan apa adanya, lalu Voltess bertanya.',
    },
    {
      title: 'Anda yang memutuskan',
      description: 'Tidak ada tindakan tanpa persetujuan.',
    },
  ],
  disclaimer: 'Estimasi, bukan pemantauan real-time. Pelacakan per alat 24 jam membutuhkan sensor dan ada di peta jalan.',
} as const;

export const FEATURES_PLUS = {
  title: 'Fitur Plus',
  subtitle: 'Analisis berkelanjutan setelah trial',
  items: [
    {
      title: 'Peringatan penyimpangan',
      description: 'Tahu saat pemakaian mulai naik dari pola normal.',
    },
    {
      title: 'Prediksi token',
      description: 'Perkiraan token prabayar habis (untuk pengguna prabayar).',
    },
    {
      title: 'Kalkulator ROI',
      description: 'Hitung balik modal sebelum ganti alat.',
    },
    {
      title: 'Tanya Terra',
      description: 'Tanya dengan suara/teks, mis. "Alat mana yang diperkirakan paling boros minggu ini?" Jawaban bersumber dan berlabel estimasi.',
    },
    {
      title: 'Laporan bulanan',
      description: 'Ringkasan kWh, Rupiah, dan tren, siap dibagikan.',
    },
  ],
} as const;

export const TARGET_USERS = {
  title: 'Untuk Siapa',
  subtitle: 'Jenis usaha yang cocok dengan Voltess',
  categories: [
    {
      name: 'Laundry',
      unit: 'kg cucian',
      appliances: ['Mesin cuci', 'Pengering', 'Setrika'],
      status: 'ready',
    },
    {
      name: 'Rumah makan / Warung',
      unit: 'porsi',
      appliances: ['Kulkas/freezer', 'Rice cooker', 'Kompor listrik', 'AC'],
      status: 'ready',
    },
    {
      name: 'Toko roti / Katering',
      unit: 'loyang/porsi',
      appliances: ['Oven', 'Mixer', 'Chiller'],
      status: 'ready',
    },
    {
      name: 'Kustom',
      unit: 'sesuai kebutuhan',
      appliances: ['Tambah alat sendiri'],
      status: 'ready',
    },
    {
      name: 'Depot air / Es',
      unit: 'galon',
      appliances: ['Pompa', 'Freezer', 'Mesin es'],
      status: 'soon',
    },
    {
      name: 'Kafe / Minuman',
      unit: 'cup',
      appliances: ['Espresso machine', 'Blender', 'Kulkas display'],
      status: 'soon',
    },
  ],
  criteria: 'Cocok untuk: tagihan listrik cukup besar, punya alat berdaya besar, memakai ponsel/WhatsApp.',
} as const;

export const PRICING = {
  title: 'Harga',
  subtitle: 'Perkiraan, dapat berubah',
  plans: [
    {
      name: 'Gratis',
      price: 'Rp0',
      period: 'selamanya',
      features: [
        'Kios Virtual',
        'Simulasi biaya',
        'Template jenis usaha',
        'Misi foto label',
        'Dekorasi kios',
      ],
    },
    {
      name: 'Trial 30 hari',
      price: 'Rp0',
      period: '30 hari',
      features: [
        'Semua fitur Plus',
        'Dimulai saat data asli pertama terhubung',
        'Tanpa kartu kredit',
      ],
      highlight: true,
    },
    {
      name: 'Plus',
      price: 'Rp15.000–25.000',
      period: '/bulan',
      features: [
        'Analisis berkelanjutan',
        'Peringatan penyimpangan',
        'Prediksi token',
        'Kalkulator ROI',
        'Tanya Terra',
        'Laporan bulanan',
      ],
      note: 'perkiraan',
    },
  ],
  disclaimer: 'Tidak ada biaya sebelum trial berakhir. Berhenti kapan saja. Setelah trial tanpa langganan, game tetap gratis.',
  footnote: 'Harga final ditentukan setelah pilot dan uji kemauan bayar.',
} as const;

export const PRIVACY = {
  title: 'Privasi & Keamanan',
  points: [
    'Persetujuan eksplisit sebelum data dipakai',
    'Lihat dan hapus data kapan saja (termasuk akun)',
    'Foto dan suara tidak dipakai untuk hal lain atau melatih model tanpa izin',
    'Mengikuti prinsip UU Pelindungan Data Pribadi',
    'Akses data dibatasi per usaha',
  ],
} as const;

export const ROADMAP = {
  title: 'Peta Jalan',
  subtitle: 'Dari validasi sampai kemitraan',
  phases: [
    {
      phase: 'Fase 0',
      period: 'Nov 2026–Jan 2027',
      title: 'Validasi',
      description: 'Wawancara hingga 30 usaha, uji OCR dan suara dengan data asli.',
      status: 'running' as const,
    },
    {
      phase: 'Fase 1',
      period: 'Jan–Feb 2027',
      title: 'MVP',
      description: 'Kios Virtual, 3 template, trial 30 hari, Laporan Pertama dan Hasil.',
      status: 'planned' as const,
    },
    {
      phase: 'Fase 2',
      period: 'Mar–Apr 2027',
      title: 'Pilot berbayar',
      description: 'Langganan Plus, validasi dengan sensor pembanding di beberapa usaha.',
      status: 'planned' as const,
    },
    {
      phase: 'Fase 3',
      period: 'Setelah Mei 2027',
      title: 'Lanjutan',
      description: 'Template tambahan, sensor/AMI untuk pemantauan lebih dekat real-time, kemitraan.',
      status: 'planned' as const,
    },
  ],
} as const;

export const FAQ = {
  title: 'Pertanyaan Sering Ditanya',
  items: [
    {
      question: 'Apakah Voltess memantau listrik secara real-time?',
      answer: 'Belum. Voltess menganalisis setelah Anda mengirim foto/suara. Pemantauan per alat 24 jam memerlukan sensor dan ada di peta jalan.',
    },
    {
      question: 'Seberapa akurat estimasinya?',
      answer: 'Selalu berlabel estimasi dengan tingkat keyakinan. Kami menguji akurasi di fase validasi dan pilot, dan menampilkan "belum cukup data" bila perlu.',
    },
    {
      question: 'Apakah saya harus memasang alat?',
      answer: 'Tidak. Cukup ponsel.',
    },
    {
      question: 'Berapa lama harus mencatat setiap hari?',
      answer: 'Targetnya kurang dari 2 menit.',
    },
    {
      question: 'Apakah gratis?',
      answer: 'Game gratis selamanya, trial 30 hari gratis, lalu Plus berbayar bila Anda mau lanjut.',
    },
    {
      question: 'Usaha saya kecil, tagihan hanya beberapa ratus ribu. Cocok?',
      answer: 'Anda tetap bisa bermain dan mencoba trial; manfaat hemat paling terasa pada usaha dengan tagihan lebih besar.',
    },
    {
      question: 'Listrik prabayar bisa?',
      answer: 'Bisa, lewat foto struk token dan layar sisa kWh.',
    },
    {
      question: 'Bagaimana data saya diperlakukan?',
      answer: 'Lihat bagian Privasi; Anda bisa menghapus data kapan saja.',
    },
    {
      question: 'Jenis usaha apa saja yang didukung?',
      answer: 'Awalnya Laundry, Rumah makan/warung, Toko roti/katering, dan Kustom.',
    },
  ],
} as const;
