'use client';

import React, { useState } from 'react';
import { Section, Button, Chip } from '../ui';
import { MascotWithContext } from '../Mascot';

export function CTAWaitlist() {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    whatsapp: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const businessTypes = [
    'Laundry',
    'Rumah makan / Warung',
    'Toko roti / Katering',
    'Depot air / Es',
    'Kafe / Minuman',
    'Lainnya',
  ];
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Nama usaha wajib diisi';
    }
    
    if (!formData.businessType) {
      newErrors.businessType = 'Pilih jenis usaha';
    }
    
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'Nomor WhatsApp wajib diisi';
    } else if (!/^(\+62|62|0)[0-9]{9,12}$/.test(formData.whatsapp.replace(/\s/g, ''))) {
      newErrors.whatsapp = 'Format nomor WhatsApp tidak valid (contoh: 08123456789)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // TODO: sambungkan ke backend
    // Simulasi API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setIsSubmitted(true);
  };
  
  if (isSubmitted) {
    return (
      <Section id="waitlist" dark>
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="flex justify-center">
            <MascotWithContext context="cta" className="w-40 h-40" />
          </div>
          <div>
            <h2 className="heading-lg mb-4">Terima kasih! 🎉</h2>
            <p className="body-lg text-gray-300">
              Kami akan menghubungi Anda di nomor WhatsApp yang didaftarkan.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsSubmitted(false)}
            className="!text-white !border-white hover:!bg-white hover:!text-brand-dark"
          >
            Daftar Lagi
          </Button>
        </div>
      </Section>
    );
  }
  
  return (
    <Section id="waitlist" dark>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <MascotWithContext context="cta" className="w-32 h-32" />
          </div>
          <h2 className="heading-lg mb-4">
            Siap hemat listrik dengan percaya diri?
          </h2>
          <p className="body-lg text-gray-300 mb-4">
            Gabung daftar tunggu sekarang. Kami akan menghubungi Anda saat Voltess siap diluncurkan.
          </p>
          <Chip className="bg-white/10 text-white border-white/20">
            ⏱️ Gratis trial 30 hari untuk pendaftar awal
          </Chip>
        </div>
        
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-8 space-y-6"
        >
          {/* Nama Usaha */}
          <div>
            <label
              htmlFor="businessName"
              className="block text-sm font-semibold text-brand-dark mb-2"
            >
              Nama Usaha <span className="text-red-500">*</span>
            </label>
            <input
              id="businessName"
              type="text"
              value={formData.businessName}
              onChange={(e) =>
                setFormData({ ...formData, businessName: e.target.value })
              }
              placeholder="Contoh: Laundry Berkah"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.businessName ? 'border-red-500' : 'border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-brand-blue`}
            />
            {errors.businessName && (
              <p className="text-sm text-red-500 mt-1">{errors.businessName}</p>
            )}
          </div>
          
          {/* Jenis Usaha */}
          <div>
            <label
              htmlFor="businessType"
              className="block text-sm font-semibold text-brand-dark mb-2"
            >
              Jenis Usaha <span className="text-red-500">*</span>
            </label>
            <select
              id="businessType"
              value={formData.businessType}
              onChange={(e) =>
                setFormData({ ...formData, businessType: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.businessType ? 'border-red-500' : 'border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-brand-blue`}
            >
              <option value="">Pilih jenis usaha</option>
              {businessTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.businessType && (
              <p className="text-sm text-red-500 mt-1">{errors.businessType}</p>
            )}
          </div>
          
          {/* WhatsApp */}
          <div>
            <label
              htmlFor="whatsapp"
              className="block text-sm font-semibold text-brand-dark mb-2"
            >
              Nomor WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              id="whatsapp"
              type="tel"
              value={formData.whatsapp}
              onChange={(e) =>
                setFormData({ ...formData, whatsapp: e.target.value })
              }
              placeholder="08123456789"
              className={`w-full px-4 py-3 rounded-xl border ${
                errors.whatsapp ? 'border-red-500' : 'border-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-brand-blue`}
            />
            {errors.whatsapp && (
              <p className="text-sm text-red-500 mt-1">{errors.whatsapp}</p>
            )}
          </div>
          
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Mengirim...' : 'Gabung Daftar Tunggu'}
          </Button>
          
          <p className="text-xs text-center text-gray-600">
            Dengan mendaftar, Anda setuju data akan digunakan untuk menghubungi Anda terkait peluncuran Voltess.
          </p>
        </form>
      </div>
    </Section>
  );
}
