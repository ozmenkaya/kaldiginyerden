'use client';
import { useState } from 'react';
import Navbar from '../components/Navbar';

const sektorler = [
  'Teknoloji', 'Finans & Bankacılık', 'Sağlık', 'Eğitim', 'Hukuk',
  'Pazarlama & Reklam', 'İnsan Kaynakları', 'Muhasebe & Mali Müşavirlik',
  'Lojistik & Tedarik Zinciri', 'Mimarlık & Mühendislik', 'Diğer',
];

const sehirler = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Kocaeli',
  'Gaziantep', 'Konya', 'Mersin', 'Diğer',
];

const nasılDuydunuz = [
  'Sosyal medya', 'Arkadaş/tanıdık tavsiyesi', 'Google arama',
  'Bir etkinlik ya da webinar', 'Haber/makale', 'Diğer',
];

export default function AdayBasvuru() {
  const [form, setForm] = useState({
    ad_soyad: '',
    email: '',
    telefon: '',
    sehir: '',
    linkedin: '',
    sektor: '',
    unvan: '',
    toplam_deneyim: '',
    mola_neden: '',
    mola_sure: '',
    katilim_amac: '',
    calisma_tercihi: '',
    is_sehri: '',
    nasil_duydunuz: '',
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/forms/aday-basvuru`, {
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
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-2xl font-bold text-[#12176b] mb-4">Başvurun Alındı!</h2>
          <p className="text-gray-600 leading-relaxed">
            Teşekkürler! Başvurunu aldık. Ekibimiz en kısa sürede seninle iletişime geçecek.
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
          <h1 className="text-2xl md:text-4xl font-bold mb-4">Aday Başvuru Formu</h1>
          <p className="text-gray-300">
            Bize kendini tanıt. Bu adım 10 dakikadan fazla sürmez.
          </p>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Bölüm 1: Kişisel Bilgiler */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#12176b] mb-5">Bölüm 1 — Kişisel Bilgiler</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Ad Soyad *</label>
                  <input type="text" required value={form.ad_soyad} onChange={e => set('ad_soyad', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>E-posta *</label>
                  <input type="email" required value={form.email} onChange={e => set('email', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Telefon *</label>
                  <input type="tel" required value={form.telefon} onChange={e => set('telefon', e.target.value)} className={inputCls} placeholder="05XX XXX XX XX" />
                </div>
                <div>
                  <label className={labelCls}>Şehir *</label>
                  <select required value={form.sehir} onChange={e => set('sehir', e.target.value)} className={selectCls}>
                    <option value="">Seçiniz</option>
                    {sehirler.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>LinkedIn Profil Linki <span className="text-gray-400 font-normal">(opsiyonel)</span></label>
                  <input type="url" value={form.linkedin} onChange={e => set('linkedin', e.target.value)} className={inputCls} placeholder="https://linkedin.com/in/..." />
                </div>
              </div>
            </div>

            {/* Bölüm 2: Kariyer Geçmişi */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#12176b] mb-5">Bölüm 2 — Kariyer Geçmişi</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>En son çalıştığın sektör *</label>
                  <select required value={form.sektor} onChange={e => set('sektor', e.target.value)} className={selectCls}>
                    <option value="">Seçiniz</option>
                    {sektorler.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>En son unvanın *</label>
                  <input type="text" required value={form.unvan} onChange={e => set('unvan', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Toplam iş deneyimi *</label>
                  <select required value={form.toplam_deneyim} onChange={e => set('toplam_deneyim', e.target.value)} className={selectCls}>
                    <option value="">Seçiniz</option>
                    <option value="6ay-1yil">6 ay – 1 yıl</option>
                    <option value="1-3yil">1 – 3 yıl</option>
                    <option value="3-5yil">3 – 5 yıl</option>
                    <option value="5yil+">5 yıl ve üzeri</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Kariyer molasının nedeni *</label>
                  <select required value={form.mola_neden} onChange={e => set('mola_neden', e.target.value)} className={selectCls}>
                    <option value="">Seçiniz</option>
                    <option value="annelik">Annelik</option>
                    <option value="hastalik">Hastalık</option>
                    <option value="bakim">Bakım sorumluluğu</option>
                    <option value="goc">Zorunlu göç</option>
                    <option value="diger">Diğer</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Kariyer molası süresi *</label>
                  <select required value={form.mola_sure} onChange={e => set('mola_sure', e.target.value)} className={selectCls}>
                    <option value="">Seçiniz</option>
                    <option value="6ay-1yil">6 ay – 1 yıl</option>
                    <option value="1-3yil">1 – 3 yıl</option>
                    <option value="3-5yil">3 – 5 yıl</option>
                    <option value="5yil+">5 yıl ve üzeri</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bölüm 3: Beklentiler */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#12176b] mb-5">Bölüm 3 — Beklentiler</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>Programa katılım amacın nedir? *</label>
                  <textarea
                    required
                    maxLength={300}
                    value={form.katilim_amac}
                    onChange={e => set('katilim_amac', e.target.value)}
                    rows={3}
                    className={inputCls}
                    placeholder="Maksimum 300 karakter"
                  />
                  <p className="text-xs text-gray-400 mt-1">{form.katilim_amac.length}/300</p>
                </div>
                <div>
                  <label className={labelCls}>Çalışma tercihin *</label>
                  <select required value={form.calisma_tercihi} onChange={e => set('calisma_tercihi', e.target.value)} className={selectCls}>
                    <option value="">Seçiniz</option>
                    <option value="tam-zamanli">Tam zamanlı</option>
                    <option value="esnek">Esnek</option>
                    <option value="uzaktan">Uzaktan</option>
                    <option value="hepsi">Hepsi olur</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Hangi şehirde iş arıyorsun? *</label>
                  <input type="text" required value={form.is_sehri} onChange={e => set('is_sehri', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Bizi nasıl duydun? *</label>
                  <select required value={form.nasil_duydunuz} onChange={e => set('nasil_duydunuz', e.target.value)} className={selectCls}>
                    <option value="">Seçiniz</option>
                    {nasılDuydunuz.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
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
