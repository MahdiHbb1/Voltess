'use client';

import React from 'react';
import { PLACEHOLDERS } from '@/content/placeholders';
import { LOGO_PATHS } from '@voltess/assets';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-brand-dark text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img
                src={LOGO_PATHS.logo}
                alt="Logo Voltess"
                className="h-10 w-10 brightness-0 invert"
              />
              <span className="text-xl font-extrabold tracking-tight">
                VOLTESS
              </span>
            </div>
            <p className="text-sm text-gray-300">
              AI energy copilot untuk UMKM Indonesia
            </p>
          </div>
          
          {/* Product */}
          <div>
            <h3 className="font-bold mb-4">Produk</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#cara-kerja" className="hover:text-white">
                  Cara Kerja
                </a>
              </li>
              <li>
                <a href="#kios-virtual" className="hover:text-white">
                  Kios Virtual
                </a>
              </li>
              <li>
                <a href="#fitur" className="hover:text-white">
                  Fitur
                </a>
              </li>
              <li>
                <a href="#harga" className="hover:text-white">
                  Harga
                </a>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="font-bold mb-4">Perusahaan</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#roadmap" className="hover:text-white">
                  Roadmap
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white" data-placeholder="true">
                  Tim
                </a>
              </li>
              <li>
                <a
                  href={PLACEHOLDERS.links.privacyPolicy}
                  className="hover:text-white"
                  data-placeholder="true"
                >
                  Kebijakan Privasi
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="font-bold mb-4">Kontak</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li data-placeholder="true">
                Email: {PLACEHOLDERS.contact.email}
              </li>
              <li data-placeholder="true">
                WhatsApp: {PLACEHOLDERS.contact.whatsapp}
              </li>
              <li data-placeholder="true">
                Instagram: @{PLACEHOLDERS.contact.instagram}
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom */}
        <div className="pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} Voltess. Dikembangkan oleh {PLACEHOLDERS.university.team},{' '}
              {PLACEHOLDERS.university.name}.
            </p>
            <div className="flex gap-4 text-sm text-gray-400">
              <a href="#" className="hover:text-white" data-placeholder="true">
                Syarat & Ketentuan
              </a>
              <a href="#privasi" className="hover:text-white">
                Privasi
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
