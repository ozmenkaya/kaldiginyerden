'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', role: 'participant', company_name: '' });
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
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Kayıt başarısız'); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      const role = data.user.role;
      if (role === 'company') router.push('/dashboard/company');
      else router.push('/dashboard/participant');
    } catch {
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-700">Kalıyor</h1>
          <p className="text-gray-500 mt-2">Yeni hesap oluşturun</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hesap Türü</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button"
                onClick={() => setForm({ ...form, role: 'participant' })}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition ${form.role === 'participant' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'}`}>
                👩 Katılımcı
              </button>
              <button type="button"
                onClick={() => setForm({ ...form, role: 'company' })}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition ${form.role === 'company' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'}`}>
                🏢 Şirket
              </button>
            </div>
          </div>
          {form.role === 'company' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şirket Adı</label>
              <input
                type="text"
                required
                value={form.company_name}
                onChange={e => setForm({ ...form, company_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Şifre (en az 8 karakter)</label>
            <input type="password" required minLength={8} value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition">
            {loading ? 'Kayıt oluşturuluyor...' : 'Kayıt Ol'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Hesabınız var mı?{' '}
          <a href="/login" className="text-purple-600 font-medium hover:underline">Giriş Yap</a>
        </p>
      </div>
    </div>
  );
}
