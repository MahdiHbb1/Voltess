/**
 * Test script to verify EN and ID content structure match
 * Run: node --loader ts-node/esm verify-i18n-keys.ts
 */

import { en } from '../src/i18n/locales/en';
import { id } from '../src/i18n/locales/id';

function getKeys(obj, prefix = '') {
  return Object.keys(obj).flatMap(key => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return getKeys(value, newKey);
    }
    
    return [newKey];
  });
}

const enKeys = getKeys(en).sort();
const idKeys = getKeys(id).sort();

const missing = enKeys.filter(key => !idKeys.includes(key));
const extra = idKeys.filter(key => !enKeys.includes(key));

if (missing.length > 0) {
  console.error('❌ MISSING in ID:', missing);
  process.exit(1);
}

if (extra.length > 0) {
  console.error('❌ EXTRA in ID:', extra);
  process.exit(1);
}

console.log('✅ i18n keys match:', enKeys.length, 'keys');
process.exit(0);
