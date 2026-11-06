// Gemini mock - untuk test tanpa API key
// ponytail: replace dengan live adapter setelah key aktif

async function ocr(payload) {
  return {
    tanggal: new Date().toISOString().split('T')[0],
    toko: "Mock Store",
    items: [
      { nama: "Item 1", qty: 2, harga: 15000 },
      { nama: "Item 2", qty: 1, harga: 25000 }
    ],
    total: 55000
  };
}

async function tagNote(payload) {
  return ["mock-tag", "test"];
}

async function summarizeBook(payload) {
  return "Mock summary: " + (payload.text || "image content").substring(0, 50);
}

async function explain(payload) {
  return `Mock explanation: Revenue ${payload.data.revenue}, Profit ${payload.data.profit}`;
}

async function ask(payload) {
  return `Mock answer untuk: ${payload.question}`;
}

module.exports = { 
  ocr,
  text: ask,
  tagNote,
  summarizeBook,
  explain,
  ask
};
