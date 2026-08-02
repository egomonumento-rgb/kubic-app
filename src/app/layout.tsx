import React from 'react';
import './globals.css';

export const metadata = {
  title: 'KUBIC | Análisis Inmobiliario Express',
  description: 'Plataforma web de prefactibilidad inmobiliaria y residual del suelo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
