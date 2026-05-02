'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Giriş başarısız'); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      const role = data.user.role;
      if (role === 'admin') router.push('/dashboard/admin');
      else if (role === 'company') router.push('/dashboard/company');
      else router.push('/dashboard/participant');
    } catch {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-[#12176b] text-white py-14 md:py-20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h1 className="text-2xl md:text-4xl font-bold mb-3">Tekrar hoş geldin.</h1>
          <p className="text-gray-300">Kaldığın Yerden&apos;e devam et.</p>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#e8312a] text-gray-900 placeholder-gray-400 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#e8312a] text-gray-900 placeholder-gray-400 bg-white"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#e8312a] hover:bg-[#c42920] disabled:opacity-50 text-white py-3 rounded-full font-semibold transition"
              >
                {loading ? 'Giriş yapılıyor...' : 'Giriş Yap →'}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center space-y-2 text-sm text-gray-500">
              <p>Henüz üye değil misin?</p>
              <div className="flex gap-3 justify-center">
                <Link href="/register" className="text-[#e8312a] font-medium hover:underline">Aday olarak kayıt ol</Link>
                <span className="text-gray-300">|</span>
                <Link href="/register?role=company" className="text-[#e8312a] font-medium hover:underline">Şirket olarak kayıt ol</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d1252] text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm">
          <p>© 2026 Kaldığın Yerden. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
