'use client';

import Image from 'next/image';

interface PhoneMockupProps {
  variant?: 'dashboard' | 'breakdown';
  imagePath?: string; // Path to real screenshot
  className?: string;
}

export function PhoneMockup({ variant = 'dashboard', imagePath, className = '' }: PhoneMockupProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Phone Frame */}
      <div className="relative w-full max-w-[320px] mx-auto">
        <div className="bg-navy-900 rounded-[3rem] p-3 shadow-2xl">
          {/* Screen */}
          <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19.5] relative">
            {imagePath ? (
              // Real screenshot
              <Image
                src={imagePath}
                alt="App screenshot"
                fill
                className="object-cover"
              />
            ) : (
              // Fallback to mockup
              variant === 'dashboard' ? <DashboardMockup /> : <BreakdownMockup />
            )}
          </div>
        </div>
        
        {/* Dynamic Island (decorative) */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-navy-900 rounded-full" />
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-navy-900 rounded-full" />
          <span className="font-bold text-navy-900">Voltra</span>
        </div>
        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          Trial · 23 hari
        </div>
      </div>
      
      {/* Date */}
      <div className="text-sm text-navy-600 mb-1">Rabu, 6 November · Laundry Bu Sari</div>
      
      {/* Main Card */}
      <div className="bg-white rounded-2xl p-5 shadow-lg mb-4">
        <h3 className="text-sm text-navy-600 mb-1">Kemarin listrik kios Anda</h3>
        <div className="text-4xl font-bold text-navy-900 mb-1">Rp 28.172</div>
        <p className="text-sm text-navy-600 mb-3">Sekitar Rp 563 per kg cucian</p>
        
        {/* Mini Chart */}
        <div className="flex items-end gap-1 h-16 mb-3">
          {[60, 45, 70, 55, 80, 65, 90].map((height, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <div
                className={`w-full rounded-t ${i === 6 ? 'bg-blue-500' : 'bg-blue-200'}`}
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
        
        <div className="text-xs text-navy-500">Kam · Jum · Sab · Min · Sen · Sel · Rab</div>
      </div>
      
      {/* Bottom card preview */}
      <div className="bg-white rounded-xl p-4 shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-navy-900">24 jam terakhir</span>
          <span className="text-xs text-navy-600 bg-green-50 px-2 py-0.5 rounded">Contoh</span>
        </div>
        <div className="text-2xl font-bold text-navy-900">Rp 28.172</div>
      </div>
    </div>
  );
}

function BreakdownMockup() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-orange-50 p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-navy-900 rounded-full" />
          <span className="font-bold text-navy-900">Voltra</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-navy-900 rounded" />
        </div>
      </div>
      
      <h2 className="text-xl font-bold text-navy-900 mb-1">Ke mana uang listrik Anda pergi</h2>
      <p className="text-sm text-navy-600 mb-4">Rabu, 6 Nov · Laundry Bu Sari</p>
      
      {/* Main breakdown card */}
      <div className="bg-white rounded-2xl p-5 shadow-lg mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-navy-900">Rincian biaya</span>
          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">●●● Keyakinan tinggi</span>
        </div>
        
        {/* Horizontal bar */}
        <div className="h-3 rounded-full overflow-hidden flex mb-4">
          <div className="bg-blue-500" style={{ width: '45%' }} />
          <div className="bg-orange-400" style={{ width: '30%' }} />
          <div className="bg-purple-400" style={{ width: '15%' }} />
          <div className="bg-gray-300" style={{ width: '10%' }} />
        </div>
        
        {/* Legend */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-navy-700">Mesin cuci</span>
            </div>
            <span className="text-sm font-semibold text-navy-900">Rp 12.677</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-400" />
              <span className="text-sm text-navy-700">Pengering</span>
            </div>
            <span className="text-sm font-semibold text-navy-900">Rp 8.451</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-400" />
              <span className="text-sm text-navy-700">Setrika</span>
            </div>
            <span className="text-sm font-semibold text-navy-900">Rp 4.226</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-300" />
              <span className="text-sm text-navy-700">Lainnya</span>
            </div>
            <span className="text-sm font-semibold text-navy-900">Rp 2.818</span>
          </div>
        </div>
      </div>
      
      {/* Bottom action */}
      <div className="text-center">
        <div className="text-xs text-navy-600 mb-2">Paling boros kemarin</div>
        <div className="bg-white rounded-xl p-3 shadow inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <div className="w-4 h-4 bg-blue-500 rounded" />
          </div>
          <span className="text-sm font-medium text-navy-900">Mesin cuci #2</span>
        </div>
      </div>
    </div>
  );
}
