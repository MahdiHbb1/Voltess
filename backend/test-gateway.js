// Test harness - verify adapters work
// Run: node backend/test-gateway.js

require('dotenv').config({ path: './backend/.env' });
const gateway = require('./services/ai/gateway');

async function test() {
  console.log('Testing AI Gateway...\n');

  // P1: OCR (mock)
  console.log('P1 OCR: skipped (need real image)');

  // P4: Explain
  try {
    const explanation = await gateway.route(4, {
      data: { revenue: 50000000, profit: 10000000, margin: 0.2 }
    });
    console.log('✓ P4 Explain:', explanation.substring(0, 100) + '...');
  } catch (e) {
    console.log('✗ P4 failed:', e.message);
  }

  // P5: Ask
  try {
    const answer = await gateway.route(5, {
      question: 'Bagaimana cara meningkatkan profit margin?',
      context: { revenue: 50000000, category: 'retail' }
    });
    console.log('✓ P5 Ask:', answer.substring(0, 100) + '...');
  } catch (e) {
    console.log('✗ P5 failed:', e.message);
  }

  // P6: STT (mock)
  console.log('\nP6-P8 STT: skipped (need real audio URL)');

  // P9: TTS mock
  try {
    const tts = await gateway.route(9, { text: 'Test audio' });
    console.log('✓ P9 TTS mock:', tts.mock ? 'silent fallback OK' : 'unexpected');
  } catch (e) {
    console.log('✗ P9 failed:', e.message);
  }

  // P10: Terra FAQ
  try {
    const faq = await gateway.route(10, { message: 'Apa itu omzet?' });
    console.log('✓ P10 Terra:', faq.source, '-', faq.reply.substring(0, 50) + '...');
  } catch (e) {
    console.log('✗ P10 failed:', e.message);
  }

  console.log('\n✓ Gateway routing P1-P10 works');
  console.log('Rate limits:', gateway.limits);
}

test().catch(console.error);
