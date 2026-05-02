'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [kesfetOpen, setKesfetOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-[#12176b] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <Image src="/logo.png" alt="Kaldığın Yerden" width={200} height={60} className="h-12 w-auto" />
            </Link>
            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div
                className="relative"
                onMouseEnter={() => setKesfetOpen(true)}
                onMouseLeave={() => setKesfetOpen(false)}
              >
                <button className="hover:text-[#fca5a5] transition flex items-center gap-1">
                  Keşfet <span className="text-xs">▾</span>
                </button>
                {kesfetOpen && (
                  <div className="absolute top-full left-0 bg-white text-[#12176b] rounded-lg shadow-lg py-2 min-w-[200px] z-50">
                    <Link href="/" className="block px-4 py-2.5 hover:bg-gray-50 text-sm font-medium">Program Nedir?</Link>
                    <Link href="/nasil-calisir" className="block px-4 py-2.5 hover:bg-gray-50 text-sm font-medium">Nasıl Çalışır?</Link>
                  </div>
                )}
              </div>
              <Link href="/sirketler-icin" className="hover:text-[#fca5a5] transition">Şirketler İçin</Link>
              <Link href="/mentorluk" className="hover:text-[#fca5a5] transition">Mentorluk</Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            <Link href="/login" className="text-sm hover:text-gray-300 transition">
              Giriş Yap
            </Link>
            <Link href="/basvuru" className="bg-[#e8312a] hover:bg-[#c42920] text-white text-sm px-4 py-2 rounded transition">
              Başvur
            </Link>
          </div>
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#1a1f80] border-t border-white/10 px-4 py-3 space-y-2 text-sm">
          <Link href="/" className="block py-2 hover:text-[#fca5a5]" onClick={() => setMobileOpen(false)}>Program Nedir?</Link>
          <Link href="/nasil-calisir" className="block py-2 hover:text-[#fca5a5]" onClick={() => setMobileOpen(false)}>Nasıl Çalışır?</Link>
          <Link href="/sirketler-icin" className="block py-2 hover:text-[#fca5a5]" onClick={() => setMobileOpen(false)}>Şirketler İçin</Link>
          <Link href="/mentorluk" className="block py-2 hover:text-[#fca5a5]" onClick={() => setMobileOpen(false)}>Mentorluk</Link>
          <div className="flex gap-3 pt-2">
            <Link href="/login" className="flex-1 text-center py-2 border border-white/40 rounded hover:bg-white/10" onClick={() => setMobileOpen(false)}>Giriş Yap</Link>
            <Link href="/basvuru" className="flex-1 text-center py-2 bg-[#e8312a] hover:bg-[#c42920] rounded" onClick={() => setMobileOpen(false)}>Başvur</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
