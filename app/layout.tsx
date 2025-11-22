import type { Metadata } from 'next';
import './globals.css';
import { Amiri, Cairo } from 'next/font/google';

const amiri = Amiri({ subsets: ['arabic'], weight: ['400','700'] });
const cairo = Cairo({ subsets: ['arabic'], weight: ['400','700'] });

export const metadata: Metadata = {
  title: '?????? ????? ?????? ??????',
  description: '???? ???? ???? ???? ????? ????? ????? ?????? ?????? ?? ?? ????? PNG.',
  metadataBase: new URL('https://agentic-6ea963da.vercel.app'),
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${amiri.className} ${cairo.className}`}>
        {children}
      </body>
    </html>
  );
}
