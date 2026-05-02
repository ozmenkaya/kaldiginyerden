'use client';
import { useState } from 'react';
import Navbar from '../components/Navbar';

const sektorler = [
  'Teknoloji', 'Finans & Bankacılık', 'Sağlık', 'Eğitim', 'Perakende',
  'Üretim & Sanayi', 'Hizmet', 'Lojistik', 'Medya & İletişim', 'Diğer',
];

const sehirler = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Kocaeli',
  'Gaziantep', 'Konya', 'Mersin', 'Diğer',
];

const nasılDuydunuz = [
  'Sosyal medya', 'LinkedIn', 'Konferans / etkinlik', 'Sektör haberleri',
  'Başka bir şirket tavsiyesi', 'Diğer',
];

export default function KurumsalBasvuru() {
  const [form, setForm] = useState({
    sirket_adi: '',
    sektor: '',
    calisan_sayisi: '',
    website: '',
    sehir: '',
    yetkili_adi: '',
    yetkili_unvani: '',
    email: '',
    telefon: '',
    isbirligi_modeli: '',
    pozisyonlar: '',
    ne_zaman: '',
    dei_program: '',
    nasil_duydunuz: '',
    notlar: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forms/kurumsal-basvuru`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Bir hata oluştu, lütfen tekrar deneyin.');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Bağlantı hatası, lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
          <div className="text-6xl mb-6">🤝</div>
          <h2 className="text-2xl font-bold text-[#12176b] mb-4">Başvurunuz Alındı!</h2>
          <p className="text-gray-600 leading-relaxed">
            Teşekkürler! Kurumsal başvurunuzu aldık. Ekibimiz en kısa sürede sizinle iletişime geçecek.
          </p>
        </div>
      </div>
    );
  }

  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';
  const inputCls = 'w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#e8312a] focus:border-[#e8312a] text-gray-900 placeholder-gray-400 bg-white';
  const selectCls = inputCls;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#12176b] text-white py-14 md:py-20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h1 className="text-2xl md:text-4xl font-bold mb-4">Kurumsal Başvuru Formu</h1>
          <p className="text-gray-300">
            Nitelikli yetenek havuzumuza erişmek için birlikte başlayalım.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Bölüm 1: Şirket Bilgileri */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#12176b] mb-5">Bölüm 1 — Şirket Bilgileri</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Şirket Adı *</label>
                  <input type="text" required value={form.sirket_adi} onChange={e => set('sirket_adi', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Sektör *</label>
                  <select required value={form.sektor} onChange={e => set('sektor', e.target.value)} className={selectCls}>
                    <option value="">Seçiniz</option>
                    {sektorler.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Çalışan Sayısı *</label>
                  <select required value={form.calisan_sayisi} onChange={e => set('calisan_sayisi', e.target.value)} className={selectCls}>
                    <option value="">Seçiniz</option>
                    <option value="1-50">1 – 50</option>
                    <option value="51-200">51 – 200</option>
                    <option value="201-500">201 – 500</option>
                    <option value="500+">500+</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Şirket Web Sitesi *</label>
                  <input type="url" required value={form.website} onChange={e => set('website', e.target.value)} className={inputCls} placeholder="https://" />
                </div>
                <div>
                  <label className={labelCls}>Şehir *</label>
                  <select required value={form.sehir} onChange={e => set('sehir', e.target.value)} className={selectCls}>
                    <option value="">Seçiniz</option>
                    {sehirler.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Bölüm 2: Yetkili Kişi Bilgileri */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#12176b] mb-5">Bölüm 2 — Yetkili Kişi Bilgileri</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Ad Soyad *</label>
                  <input type="text" required value={form.yetkili_adi} onChange={e => set('yetkili_adi', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Unvan *</label>
                  <input type="text" required value={form.yetkili_unvani} onChange={e => set('yetkili_unvani', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>E-posta *</label>
                  <input type="email" required value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Telefon *</label>
                  <input type="tel" required value={form.telefon} onChange={e => set('telefon', e.target.value)} className={inputCls} placeholder="05XX XXX XX XX" />
                </div>
              </div>
            </div>

            {/* Bölüm 3: İşbirliği Talebi */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#12176b] mb-5">Bölüm 3 — İşbirliği Talebi</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Hangi iş birliği modeliyle ilgileniyorsunuz? *</label>
                  <select required value={form.isbirligi_modeli} onChange={e => set('isbirligi_modeli', e.target.value)} className={selectCls}>
                    <option value="">Seçiniz</option>
                    <option value="yerlestirme">Yerleştirme Ücreti</option>
                    <option value="abonelik">Kurumsal Abonelik</option>
                    <option value="returnship">Returnship Programı</option>
                    <option value="karar-vermedim">Henüz karar vermedim</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Hangi pozisyon(lar) için aday arıyorsunuz? *</label>
                  <textarea
                    required
                    value={form.pozisyonlar}
                    onChange={e => set('pozisyonlar', e.target.value)}
                    rows={3}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Ne zaman işe alım yapmayı planlıyorsunuz? *</label>
                  <select required value={form.ne_zaman} onChange={e => set('ne_zaman', e.target.value)} className={selectCls}>
                    <option value="">Seçiniz</option>
                    <option value="hemen">Hemen</option>
                    <option value="1-3ay">1 – 3 ay içinde</option>
                    <option value="3-6ay">3 – 6 ay içinde</option>
                    <option value="bilgi">Sadece bilgi almak istiyorum</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>DEI veya ESG programınız var mı? *</label>
                  <select required value={form.dei_program} onChange={e => set('dei_program', e.target.value)} className={selectCls}>
                    <option value="">Seçiniz</option>
                    <option value="evet">Evet</option>
                    <option value="hayir">Hayır</option>
                    <option value="planliyoruz">Planlıyoruz</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Bizi nasıl duydunuz? *</label>
                  <select required value={form.nasil_duydunuz} onChange={e => set('nasil_duydunuz', e.target.value)} className={selectCls}>
                    <option value="">Seçiniz</option>
                    {nasılDuydunuz.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Eklemek istediğiniz bir şey var mı? <span className="text-gray-400 font-normal">(opsiyonel)</span></label>
                  <textarea
                    value={form.notlar}
                    onChange={e => set('notlar', e.target.value)}
                    rows={3}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e8312a] hover:bg-[#c42920] disabled:opacity-50 text-white py-3 rounded-full font-semibold transition text-lg"
            >
              {loading ? 'Gönderiliyor...' : 'Başvuruyu Gönder →'}
            </button>
          </form>
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
