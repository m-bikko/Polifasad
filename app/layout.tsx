import type { Metadata } from 'next';
import type { ReactNode, JSX } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Полифасад · ИИ калькулятор',
  description: 'Расчёт облицовки и визуализация брусчатки на основе ИИ',
};

const RootLayout = ({ children }: { children: ReactNode }): JSX.Element => (
  <html lang="ru">
    <body className="min-h-screen antialiased">{children}</body>
  </html>
);

export default RootLayout;
