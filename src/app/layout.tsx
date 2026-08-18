import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PranaFlow — Desktop Guided Breathing Pacer',
  description:
    'A desktop-focused precision guided breathing application with dynamic biological pacers, anatomical airflow guidance, scientifically proven presets, and multitasking mini mode.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full" suppressHydrationWarning>
      <body
        className="min-h-full bg-[#070a12] text-slate-100 font-sans antialiased flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
