import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KUBIC | Prefactibilidad Inmobiliaria Express',
  description: 'Plataforma profesional para la estructuración y evaluación financiera de proyectos de arquitectura e inversión inmobiliaria.',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  themeColor: '#0f172a',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'KUBIC',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-slate-100 text-slate-900 antialiased selection:bg-orange-500 selection:text-white">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
