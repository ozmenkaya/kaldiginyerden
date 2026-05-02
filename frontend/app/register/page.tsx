'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'choose' | 'form'>('choose');
  const [role, setRole] = useState<'participant' | 'company'>('participant');
  const [form, setForm] = useState({ email: '', password: '', company_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Kayıt başarısız'); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (role === 'company') router.push('/dashboard/company');
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

      {/* Hero */}
      <section className="bg-[#12176b] text-white py-14 md:py-20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h1 className="text-2xl md:text-4xl font-bold mb-4">
            Hangi yolculukta olduğunu anlat.
          </h1>
          <p className="text-gray-300 text-lg">Sana özel kapıyı açalım.</p>
          <p className="text-gray-400 mt-2">
            Kaldığın Yerden&apos;de iki farklı kullanıcı profili var. Senin için doğru olanı seç.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">

          {step === 'choose' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Aday Kartı */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-transparent hover:border-[#e8312a] transition cursor-pointer flex flex-col"
                onClick={() => { setRole('participant'); setStep('form'); }}>
                <div className="text-5xl mb-4">👩</div>
                <h2 className="text-xl font-bold text-[#12176b] mb-2">Ben bir adayım</h2>
                <p className="text-gray-500 text-sm mb-2">Kariyerime dönmeye hazırlanıyorum.</p>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  Kariyer molası vermiş, iş hayatına güçlü bir dönüş yapmak isteyen birisin. Seni tanımak,
                  doğru yola koymak ve doğru işverenle buluşturmak için buradayız.
                </p>
                <button className="mt-auto bg-[#e8312a] hover:bg-[#c42920] text-white py-2.5 rounded-full font-medium transition">
                  Aday Olarak Kayıt Ol
                </button>
                <p className="text-center text-sm text-gray-500 mt-3">
                  <Link href="/login" className="text-[#e8312a] hover:underline">Zaten üye misin? Giriş Yap</Link>
                </p>
              </div>

              {/* Şirket Kartı */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-transparent hover:border-[#e8312a] transition cursor-pointer flex flex-col"
                onClick={() => { setRole('company'); setStep('form'); }}>
                <div className="text-5xl mb-4">🏢</div>
                <h2 className="text-xl font-bold text-[#12176b] mb-2">Ben bir şirketim</h2>
                <p className="text-gray-500 text-sm mb-2">Nitelikli, sadık yeteneğe ulaşmak istiyorum.</p>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  Hazır, değerlendirilmiş ve işe dönmeye kararlı adaylara doğrudan erişim arıyorsun.
                  Yetenek havuzumuza katılmak için kurumsal hesabını oluştur.
                </p>
                <button className="mt-auto bg-[#12176b] hover:bg-[#1a1f80] text-white py-2.5 rounded-full font-medium transition">
                  Kurumsal Hesap Oluştur
                </button>
                <p className="text-center text-sm text-gray-500 mt-3">
                  <Link href="/login" className="text-[#e8312a] hover:underline">Zaten üye misin? Giriş Yap</Link>
                </p>
              </div>
            </div>
          )}

          {step === 'form' && (
            <div className="max-w-md mx-auto bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <button onClick={() => setStep('choose')} className="text-sm text-gray-500 hover:text-[#e8312a] mb-5 flex items-center gap-1">
                ← Geri
              </button>
              <h2 className="text-xl font-bold text-[#12176b] mb-6">
                {role === 'participant' ? 'Aday Hesabı Oluştur' : 'Kurumsal Hesap Oluştur'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {role === 'company' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Şirket Adı</label>
                    <input
                      type="text"
                      required
                      value={form.company_name}
                      onChange={e => setForm({ ...form, company_name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#e8312a] text-gray-900 placeholder-gray-400 bg-white"
                    />
                  </div>
                )}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Şifre (en az 8 karakter)</label>
                  <input
                    type="password"
                    required
                    minLength={8}
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
                  {loading ? 'Hesap oluşturuluyor...' : 'Kayıt Ol →'}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-4">
                Zaten üye misin?{' '}
                <Link href="/login" className="text-[#e8312a] font-medium hover:underline">Giriş Yap</Link>
              </p>
            </div>
          )}
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
