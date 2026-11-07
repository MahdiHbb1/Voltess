'use client';

import React from 'react';
import { Chip } from './ui';

interface PhoneMockupProps {
  screen?: 'beranda' | 'catat' | 'biaya';
  className?: string;
}

export function PhoneMockup({ screen = 'beranda', className = '' }: PhoneMockupProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Phone Frame */}
      <div className="relative w-full max-w-[320px] mx-auto">
        <div className="bg-brand-dark rounded-[3rem] p-3 shadow-2xl">
          {/* Screen */}
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-[2.5rem] overflow-hidden">
            {/* Status Bar */}
            <div className="bg-white px-6 py-3 flex items-center justify-between text-xs text-gray-600">
              <span className="font-medium">9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-brand-blue rounded-full" />
                <div className="w-4 h-4 bg-brand-blue rounded-full" />
                <div className="w-4 h-4 bg-brand-blue rounded-full" />
              </div>
            </div>
            
            {/* Content */}
            <div className="p-5 min-h-[600px]">
              {screen === 'beranda' && <BerandaScreen />}
              {screen === 'catat' && <CatatScreen />}
              {screen === 'biaya' && <BiayaScreen />}
            </div>
            
            {/* Bottom Nav */}
            <div className="bg-white border-t border-gray-200 px-6 py-3 flex justify-around items-center">
              <NavIcon active={screen === 'beranda'} label="Beranda" />
              <NavIcon active={screen === 'catat'} label="Catat" />
              <NavIcon active={screen === 'biaya'} label="Biaya" />
            </div>
          </div>
        </div>
        
        {/* Dynamic Island (decorative) */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-brand-dark rounded-full" />
      </div>
    </div>
  );
}

function NavIcon({ active, label }: { active: boolean; label: string }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${active ? 'text-brand-blue' : 'text-gray-400'}`}>
      <div className={`w-6 h-6 rounded-lg ${active ? 'bg-brand-blue' : 'bg-gray-300'}`} />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

function BerandaScreen() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-brand-dark mb-1">
          Kemarin listrik kios Anda
        </h3>
        <h2 className="text-3xl font-extrabold text-brand-blue mb-2">
          Rp 28.172
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Sekitar <span className="font-semibold">Rp 563 per kg cucian</span>. Estimasi dari foto meter dan catatan suara, bukan pemantauan real-time.
        </p>
        <Chip variant="example" className="mt-2">Contoh</Chip>
      </div>
      
      {/* Chart Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-brand-dark">24 jam terakhir</span>
          <Chip variant="confidence">Keyakinan tinggi</Chip>
        </div>
        
        {/* Bar Chart */}
        <div className="flex items-end justify-between h-32 gap-1">
          {[60, 45, 70, 55, 80, 65, 50].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-gradient-to-t from-brand-blue to-brand-sky rounded-t-lg transition-all duration-500"
                style={{ height: `${height}%` }}
              />
              <span className="text-xs text-gray-400">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CatatScreen() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-brand-dark mb-1">
          Catat hari ini, tanpa ribet
        </h2>
        <p className="text-sm text-gray-600">Targetnya kurang dari 2 menit</p>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['Meter', 'Label alat', 'Suara', 'Manual'].map((tab, i) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
              i === 0
                ? 'bg-brand-blue text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* Camera Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-brand-dark mb-3">Foto meter listrik</h3>
        <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-brand-blue rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-white rounded-lg" />
            </div>
            <p className="text-sm text-gray-600">Tap untuk foto</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BiayaScreen() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-brand-dark mb-2">
          Ke mana uang listrik Anda pergi
        </h2>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm text-gray-600">Total kemarin</span>
          <span className="text-2xl font-extrabold text-brand-dark">Rp 28.172</span>
        </div>
        <Chip variant="example">Contoh</Chip>
      </div>
      
      {/* Breakdown Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-brand-dark">Perkiraan per alat</span>
          <Chip variant="confidence">Keyakinan tinggi</Chip>
        </div>
        
        {/* Segmented Bar */}
        <div className="h-8 flex rounded-xl overflow-hidden mb-4">
          <div className="bg-brand-blue" style={{ width: '40%' }} />
          <div className="bg-brand-green" style={{ width: '30%' }} />
          <div className="bg-brand-sky" style={{ width: '20%' }} />
          <div className="bg-gray-300" style={{ width: '10%' }} />
        </div>
        
        {/* Legend */}
        <div className="space-y-2">
          {[
            { label: 'Mesin cuci', value: 'Rp 11.268', color: 'bg-brand-blue' },
            { label: 'Pengering', value: 'Rp 8.451', color: 'bg-brand-green' },
            { label: 'Setrika', value: 'Rp 5.634', color: 'bg-brand-sky' },
            { label: 'Lainnya', value: 'Rp 2.817', color: 'bg-gray-300' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${item.color}`} />
                <span className="text-gray-700">{item.label}</span>
              </div>
              <span className="font-semibold text-brand-dark">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
