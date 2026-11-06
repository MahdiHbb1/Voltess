// Terra chatbot fallback - P10 rule-based FAQ
// ponytail: integrate real Terra API when chatbot use grows beyond FAQ patterns

const faqs = {
  // Keuangan
  'omzet': 'Omzet = total penjualan sebelum dikurangi biaya. Cek di menu Laporan > Penjualan.',
  'profit': 'Profit = omzet - total biaya. Lihat di Dashboard > Ringkasan Keuangan.',
  'margin': 'Margin = (profit / omzet) × 100%. Margin sehat UMKM: 15-30%.',
  'rugi': 'Cek di Laporan > Laba Rugi. Jika merah, kurangi biaya atau naikkan harga.',
  
  // Fitur
  'catat': 'Ketik /catat atau tekan tombol + di home. Bisa foto struk atau input manual.',
  'laporan': 'Menu Laporan > pilih periode. Export ke PDF/Excel tersedia.',
  'stok': 'Menu Inventori > Stok. Notif otomatis jika stok < minimum.',
  'hutang': 'Menu Keuangan > Hutang/Piutang. Set reminder otomatis.',
  
  // Akun
  'lupa password': 'Klik "Lupa Password" di login, masukkan email. Cek inbox.',
  'ganti': 'Menu Profil > Pengaturan > Ubah Password/Email.',
  'langganan': 'Menu Profil > Langganan. Gratis untuk 3 bulan pertama.',
  
  // Umum
  'kontak': 'Email: support@majuon.id, WhatsApp: 08123456789',
  'jam': 'Support: Senin-Jumat 9-17 WIB'
};

function matchKeyword(text) {
  const lower = text.toLowerCase();
  for (const [keyword, answer] of Object.entries(faqs)) {
    if (lower.includes(keyword)) {
      return answer;
    }
  }
  return null;
}

async function chat(payload) {
  const answer = matchKeyword(payload.message);
  
  if (answer) {
    return {
      reply: answer,
      matched: true,
      source: 'faq'
    };
  }
  
  // Fallback ke Gemini P5 jika tidak match FAQ
  const gemini = require('./gemini');
  const geminiAnswer = await gemini.ask({
    question: payload.message,
    context: payload.context
  });
  
  return {
    reply: geminiAnswer,
    matched: false,
    source: 'gemini'
  };
}

module.exports = { chat };
