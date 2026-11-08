/**
 * Indonesian content for Voltess landing page
 * OPTIONAL LANGUAGE - user can switch via navbar
 */

import type { Translation } from '../types';

export const id: Translation = {
  meta: {
    title: 'Voltess - Ke Mana Uang Listrik Usaha Anda Pergi?',
    description: 'Asisten energi AI untuk UMKM Indonesia. Lacak biaya listrik per alat dalam Rupiah, dapat rekomendasi hemat, mulai dari game simulasi gratis.',
    ogTitle: 'Voltess - Ke Mana Uang Listrik Usaha Anda Pergi?',
    ogDescription: 'Asisten energi AI untuk UMKM Indonesia. Lacak biaya listrik per alat dalam Rupiah, dapat rekomendasi hemat.',
  },
  
  nav: {
    problem: 'Masalah',
    howItWorks: 'Cara Kerja',
    product: 'Produk',
    pricing: 'Harga',
    faq: 'FAQ',
    cta: 'Coba Gratis',
    langSwitch: 'Bahasa',
    langLabel: 'Ganti ke English',
  },
  
  hero: {
    badge: 'Untuk UMKM Indonesia',
    title: 'Ke mana uang listrik usaha Anda pergi?',
    subtitle: 'Voltess membantu pemilik usaha kecil melacak biaya listrik per alat dalam Rupiah, lalu memberi rekomendasi hemat yang jelas. Mulai dari game simulasi gratis. Tanpa sensor. Tanpa ribet.',
    ctaPrimary: 'Coba Gratis',
    ctaSecondary: 'Lihat Cara Kerja',
    trustSignals: [
      'Gratis untuk dicoba',
      'Cukup foto & catatan suara, <2 menit/hari',
      'Bayar hanya setelah ada bukti hemat',
    ],
    mascotAlt: 'Maskot Terra menyapa',
  },
  
  problem: {
    title: 'Tagihan listrik hanya satu angka total',
    subtitle: 'Berdasarkan wawancara dengan pemilik laundry dan barbershop di Indonesia',
    statement: 'Anda sudah menduga alat mana yang paling boros, tapi belum tahu berapa Rupiahnya. Anda tidak punya waktu untuk mencatat manual. Anda ragu bayar aplikasi tanpa bukti berhasil.',
    cta: 'Lihat Solusinya',
  },
  
  howItWorks: {
    title: 'Empat langkah ke hemat',
    steps: [
      {
        title: 'Main',
        description: 'Coba Kios Virtual gratis. Geser jam pakai, lihat biaya berubah. Tanpa daftar, tanpa isi data.',
      },
      {
        title: 'Samakan dengan nyata',
        description: 'Ganti alat contoh dengan alat asli lewat foto label. Kirim foto meter dan catatan suara selama 7 hari.',
      },
      {
        title: 'Dapat rekomendasi',
        description: 'Hari ke-7: Laporan Pertama tampilkan estimasi alat boros dan 1-3 tips hemat dalam Rupiah.',
      },
      {
        title: 'Lihat hasil',
        description: 'Hari ke-30: Bandingkan dengan kondisi awal. Berlangganan hanya jika hasilnya terbukti.',
      },
    ],
  },
  
  product: {
    title: 'Lacak biaya per alat',
    subtitle: 'Semua estimasi berlabel "Contoh"',
    screens: {
      home: {
        title: 'Kemarin listrik kios Anda',
        amount: 'Rp 28.172',
        unit: 'Sekitar Rp 563 per kg cucian',
        disclaimer: 'Estimasi dari foto meter dan catatan suara, bukan pemantauan real-time',
        label: 'Contoh',
      },
      track: {
        title: 'Catat hari ini, tanpa ribet',
        tabs: ['Meter', 'Label alat', 'Suara', 'Manual'],
      },
      costs: {
        title: 'Ke mana uang listrik Anda pergi',
        confidence: 'Keyakinan tinggi',
        label: 'Contoh',
      },
    },
  },
  
  virtualKiosk: {
    title: 'Usaha Anda, jadi desa mini yang bisa Anda kelola',
    description: 'Pilih jenis usaha, kios langsung terisi alat-alat yang umum dipakai. Geser jam pakai dan lihat biaya listrik berubah. Selesaikan misi sederhana (foto label alat, foto meter, catatan suara) untuk menaikkan level kios, mendapat dekorasi, dan membuka laporan.',
    features: [
      'Maksimal 2 menit per hari',
      'Level naik dari tindakan nyata, bukan sekadar klik',
    ],
    planned: 'Hadiah nyata direncanakan: kredit langganan dan stiker "Usaha Hemat Energi"',
    labelPlanned: 'Rencana',
  },
  
  aiEngine: {
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
        title: 'Selisih ditampilkan apa adanya',
        description: 'Yang belum terjelaskan ditampilkan apa adanya, lalu Voltess bertanya.',
      },
      {
        title: 'Anda yang memutuskan',
        description: 'Tidak ada tindakan tanpa persetujuan Anda.',
      },
    ],
    disclaimer: 'Estimasi, bukan pemantauan real-time. Pelacakan per alat 24 jam membutuhkan sensor dan ada di peta jalan.',
  },
  
  targetUsers: {
    title: 'Untuk Siapa',
    categories: [
      {
        name: 'Laundry',
        unit: 'per kg',
        appliances: ['Mesin cuci', 'Pengering', 'Setrika'],
      },
      {
        name: 'Rumah makan / Warung',
        unit: 'per porsi',
        appliances: ['Kulkas/freezer', 'Rice cooker', 'Kompor listrik', 'AC'],
      },
      {
        name: 'Toko roti / Katering',
        unit: 'per loyang',
        appliances: ['Oven', 'Mixer', 'Chiller'],
      },
      {
        name: 'Kustom',
        unit: 'kustom',
        appliances: ['Tambah sendiri'],
      },
      {
        name: 'Depot air / Es',
        unit: 'per galon',
        appliances: ['Pompa', 'Freezer', 'Mesin es'],
        status: 'coming',
      },
      {
        name: 'Kafe / Minuman',
        unit: 'per cup',
        appliances: ['Mesin espresso', 'Blender', 'Kulkas display'],
        status: 'coming',
      },
    ],
    statusComing: 'Segera',
    criteria: 'Cocok untuk: tagihan listrik cukup besar, punya alat berdaya besar, memakai ponsel/WhatsApp.',
  },
  
  pricing: {
    title: 'Harga',
    subtitle: 'Perkiraan, dapat berubah',
    plans: [
      {
        name: 'Gratis',
        price: 'Rp 0',
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
        price: 'Rp 0',
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
        price: 'Rp 15.000–25.000',
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
    disclaimer: 'Tidak ada biaya sebelum trial berakhir. Berhenti kapan saja. Game tetap gratis setelah trial tanpa langganan.',
    footnote: 'Harga final ditentukan setelah pilot dan uji kemauan bayar.',
    labelEstimate: 'Perkiraan',
  },
  
  privacy: {
    title: 'Privasi & Keamanan',
    points: [
      'Persetujuan eksplisit sebelum data dipakai',
      'Lihat dan hapus data kapan saja (termasuk akun)',
      'Foto dan suara tidak dipakai untuk hal lain atau melatih model tanpa izin',
      'Mengikuti prinsip UU Pelindungan Data Pribadi Indonesia',
      'Akses data dibatasi per usaha',
    ],
  },
  
  faq: {
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
  },
  
  cta: {
    title: 'Siap hemat dengan percaya diri?',
    subtitle: 'Gabung daftar tunggu sekarang. Kami akan menghubungi Anda saat Voltess siap diluncurkan.',
    benefit: 'Trial gratis 30 hari untuk pendaftar awal',
    form: {
      businessName: 'Nama Usaha',
      businessNamePlaceholder: 'Contoh: Laundry Berkah',
      businessNameRequired: 'Nama usaha wajib diisi',
      businessType: 'Jenis Usaha',
      businessTypePlaceholder: 'Pilih jenis usaha',
      businessTypeRequired: 'Pilih jenis usaha',
      whatsapp: 'Nomor WhatsApp',
      whatsappPlaceholder: '08123456789',
      whatsappRequired: 'Nomor WhatsApp wajib diisi',
      whatsappInvalid: 'Format WhatsApp tidak valid (contoh: 08123456789)',
      submit: 'Gabung Daftar Tunggu',
      submitting: 'Mengirim...',
      consent: 'Dengan mendaftar, Anda setuju data akan digunakan untuk menghubungi Anda terkait peluncuran Voltess.',
    },
    success: {
      title: 'Terima kasih!',
      message: 'Kami akan menghubungi Anda di nomor WhatsApp yang didaftarkan.',
      actionLabel: 'Daftar Lagi',
    },
    mascotAlt: 'Maskot Terra mengundang',
  },
  
  footer: {
    tagline: 'Asisten energi AI untuk UMKM Indonesia',
    product: 'Produk',
    features: 'Fitur',
    pricing: 'Harga',
    company: 'Perusahaan',
    about: 'Tentang',
    privacy: 'Kebijakan Privasi',
    terms: 'Syarat & Ketentuan',
    contact: 'Kontak',
    copyright: 'Hak cipta dilindungi.',
  },
  
  common: {
    sample: 'Contoh',
    example: 'Contoh',
    estimated: 'Perkiraan',
    planned: 'Rencana',
    comingSoon: 'Segera',
    readMore: 'Baca Selengkapnya',
    learnMore: 'Pelajari Lebih Lanjut',
    close: 'Tutup',
  },
};
