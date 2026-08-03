import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KUBIC | Prefactibilidad Inmobiliaria Express',
  description: 'Plataforma profesional para la estructuración y evaluación financiera de proyectos de arquitectura e inversión inmobiliaria.',
  manifest: '/manifest.json',
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
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="bg-slate-100 text-slate-900 antialiased selection:bg-orange-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
