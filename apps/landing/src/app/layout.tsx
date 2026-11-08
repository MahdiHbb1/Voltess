import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { I18nProvider } from '@/i18n';
import './globals.css';

export const metadata: Metadata = {
  title: 'Voltess - Smart Energy Management untuk Usaha Mikro',
  description: 'Solusi IoT + AI untuk monitoring listrik real-time, prediksi biaya, dan pencegahan pemborosan energi. Hemat hingga 20% biaya listrik bulanan.',
  keywords: 'IoT, smart energy, hemat listrik, usaha mikro, UMKM, monitoring energi, AI prediksi',
  authors: [{ name: 'Voltess Team' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://voltess.id',
    title: 'Voltess - Smart Energy Management untuk Usaha Mikro',
    description: 'Hemat hingga 20% biaya listrik dengan monitoring real-time dan AI prediksi.',
    siteName: 'Voltess',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Voltess - Smart Energy Management untuk Usaha Mikro',
    description: 'Hemat hingga 20% biaya listrik dengan monitoring real-time dan AI prediksi.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={GeistSans.variable}>
      <body className="antialiased">
        <I18nProvider>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
