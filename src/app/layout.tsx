import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ComeYa | Puno',
  description: 'Comida local, recojo y delivery en Puno.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
