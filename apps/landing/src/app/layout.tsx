import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Voltess - Ke Mana Uang Listrik Usaha Anda Pergi?',
  description: 'Voltess membantu pemilik UMKM melihat biaya listrik per alat dalam Rupiah dan memberi saran hemat yang jelas. Mulai dari game simulasi gratis, tanpa sensor, tanpa ribet.',
  keywords: 'voltess, hemat listrik, UMKM, laundry, warung, hemat energi, biaya listrik',
  authors: [{ name: 'Tim d1306 UNNES' }],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Voltess - Ke Mana Uang Listrik Usaha Anda Pergi?',
    description: 'AI energy copilot untuk UMKM Indonesia. Hemat listrik dengan percaya diri.',
    type: 'website',
    locale: 'id_ID',
    siteName: 'Voltess',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Voltess - Ke Mana Uang Listrik Usaha Anda Pergi?',
    description: 'AI energy copilot untuk UMKM Indonesia. Hemat listrik dengan percaya diri.',
  },
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
