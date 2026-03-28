use client;

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Header from './header';
import Footer from './footer';

export default function RootLayout({ children }) {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <html lang="en" className={darkMode ? 'dark' : ''}>
      <Head>
        <title>Lead Magnet Builder</title>
        <meta name="description" content="Create and optimize lead magnets to capture and convert leads" />
        <meta name="keywords" content="lead magnet, lead generation, marketing automation, conversion rate optimization, growth hacking" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body className="font-sans text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-900">
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />
        <main className="container mx-auto p-4 md:p-6 lg:p-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}