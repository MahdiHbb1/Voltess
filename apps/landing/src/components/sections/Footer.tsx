'use client';

import Image from 'next/image';
import { useTranslation } from '@/i18n';
import { LOGO_PATHS } from '@voltess/assets';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-navy-900 text-white border-t border-navy-800">
      <div className="container-width py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Tagline */}
          <div className="md:col-span-2 space-y-4">
            <div className="relative w-32 h-12">
              <Image
                src={LOGO_PATHS.wordmark}
                alt="Voltess"
                fill
                className="object-contain object-left"
              />
            </div>
            <p className="body-base text-navy-100 max-w-sm">
              {t.footer.tagline}
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.product}</h3>
            <ul className="space-y-2 body-sm">
              <li>
                <a href="#features" className="text-navy-100 hover:text-white transition-colors">
                  {t.footer.features}
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-navy-100 hover:text-white transition-colors">
                  {t.footer.pricing}
                </a>
              </li>
              <li>
                <a href="#faq" className="text-navy-100 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">{t.footer.company}</h3>
            <ul className="space-y-2 body-sm">
              <li>
                <a href="#about" className="text-navy-100 hover:text-white transition-colors">
                  {t.footer.about}
                </a>
              </li>
              <li>
                <a href="#privacy" className="text-navy-100 hover:text-white transition-colors">
                  {t.footer.privacy}
                </a>
              </li>
              <li>
                <a href="/terms" className="text-navy-100 hover:text-white transition-colors">
                  {t.footer.terms}
                </a>
              </li>
              <li>
                <a href="/contact" className="text-navy-100 hover:text-white transition-colors">
                  {t.footer.contact}
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="pt-8 border-t border-navy-800 flex flex-col md:flex-row justify-between items-center gap-4 body-sm text-navy-100">
          <p>
            © {currentYear} Voltess. {t.footer.copyright}
          </p>
          
          <div className="flex gap-6">
            <a href="https://twitter.com/voltess" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Twitter
            </a>
            <a href="https://instagram.com/voltess" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Instagram
            </a>
            <a href="https://linkedin.com/company/voltess" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
