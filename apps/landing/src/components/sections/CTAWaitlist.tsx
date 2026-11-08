'use client';

import { useState } from 'react';
import { useTranslation } from '@/i18n';
import { Button, Label } from '../ui';
import { MascotWithContext } from '../Mascot';

const BUSINESS_TYPES = [
  'Laundry',
  'Restaurant / Food stall',
  'Bakery / Catering',
  'Water / Ice depot',
  'Café / Beverages',
  'Custom',
];

export function CTAWaitlist() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    whatsapp: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.businessName.trim()) {
      newErrors.businessName = t.cta.form.businessNameRequired;
    }
    
    if (!formData.businessType) {
      newErrors.businessType = t.cta.form.businessTypeRequired;
    }
    
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = t.cta.form.whatsappRequired;
    } else if (!/^0\d{9,12}$/.test(formData.whatsapp.trim())) {
      newErrors.whatsapp = t.cta.form.whatsappInvalid;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSuccess(true);
  };
  
  const resetForm = () => {
    setFormData({ businessName: '', businessType: '', whatsapp: '' });
    setErrors({});
    setIsSuccess(false);
  };
  
  if (isSuccess) {
    return (
      <section id="cta" className="section-padding bg-navy-900 text-white">
        <div className="container-width">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="mx-auto">
              <MascotWithContext context="cta" width={128} height={128} />
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {t.cta.success.title}
            </h2>
            
            <p className="text-lg text-navy-100">
              {t.cta.success.message}
            </p>
            
            <Button variant="secondary" onClick={resetForm}>
              {t.cta.success.actionLabel}
            </Button>
          </div>
        </div>
      </section>
    );
  }
  
  return (
    <section id="cta" className="section-padding bg-navy-900 text-white relative overflow-hidden">
      {/* Decorative Terra - bottom right corner */}
      <div className="absolute bottom-0 right-8 opacity-20 hidden lg:block">
        <MascotWithContext context="cta" width={200} height={200} />
      </div>
      
      <div className="container-width relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t.cta.title}
            </h2>
            
            <p className="text-lg text-navy-100">
              {t.cta.subtitle}
            </p>
            
            <div className="inline-block mt-4">
              <Label variant="accent" className="!text-base">
                {t.cta.benefit}
              </Label>
            </div>
          </div>
          
          {/* Form */}
          <div className="bg-white rounded-2xl p-8 md:p-10 text-navy-900 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Name */}
              <div>
                <label htmlFor="businessName" className="block font-semibold mb-2">
                  {t.cta.form.businessName}
                </label>
                <input
                  type="text"
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder={t.cta.form.businessNamePlaceholder}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors.businessName ? 'border-red-500' : 'border-navy-200'
                  }`}
                />
                {errors.businessName && (
                  <p className="text-red-500 text-sm mt-1">{errors.businessName}</p>
                )}
              </div>
              
              {/* Business Type */}
              <div>
                <label htmlFor="businessType" className="block font-semibold mb-2">
                  {t.cta.form.businessType}
                </label>
                <select
                  id="businessType"
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors.businessType ? 'border-red-500' : 'border-navy-200'
                  }`}
                >
                  <option value="">{t.cta.form.businessTypePlaceholder}</option>
                  {BUSINESS_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {errors.businessType && (
                  <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>
                )}
              </div>
              
              {/* WhatsApp */}
              <div>
                <label htmlFor="whatsapp" className="block font-semibold mb-2">
                  {t.cta.form.whatsapp}
                </label>
                <input
                  type="tel"
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder={t.cta.form.whatsappPlaceholder}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors.whatsapp ? 'border-red-500' : 'border-navy-200'
                  }`}
                />
                {errors.whatsapp && (
                  <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>
                )}
              </div>
              
              {/* Consent */}
              <p className="text-sm text-navy-600">
                {t.cta.form.consent}
              </p>
              
              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? t.cta.form.submitting : t.cta.form.submit}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
