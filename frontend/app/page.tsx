'use client';
import Link from 'next/link';
import Navbar from './components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[#12176b] text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
            Kariyerine ara verdin.<br />Ama sen bitmedin.
          </h1>
          <p className="text-gray-300 text-base md:text-lg mb-10 max-w-2xl mx-auto">
            &ldquo;Kaldığın Yerden&rdquo;, kariyer molası vermiş kadınları iş hayatına geri kazandıran Türkiye&apos;nin ilk bütünleşik dönüş platformu.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/basvuru" className="bg-[#e8312a] hover:bg-[#c42920] text-white px-8 py-3 rounded-full font-medium transition flex items-center gap-2">
              Programa Başvur <span>→</span>
            </Link>
            <Link href="/nasil-calisir" className="border border-white/60 hover:bg-white/10 text-white px-8 py-3 rounded-full font-medium transition">
              Nasıl Çalışır?
            </Link>
          </div>
        </div>
      </section>

      {/* Giriş Paragrafı */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-lg leading-relaxed">
            Annelik, hastalık, bakım sorumluluğu ya da zorunlu göç… Kariyerine ara vermenin birçok nedeni olabilir.
            Ama İK sistemleri bunu görmüyor. CV&apos;nizdeki o boşluğu görüyor ve sizi eliyor — daha tanımadan.
          </p>
          <p className="text-[#c42920] font-semibold text-xl mt-6">Biz bu sistemi değiştiriyoruz.</p>
        </div>
      </section>

      {/* Kimi İçin? */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#12176b] text-center mb-10">
            Kaldığın Yerden tam olarak senin için, eğer:
          </h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              'Kariyerine en az 6 ay ara verdiysen',
              'Daha önce en az 3 yıl profesyonel deneyimin varsa',
              'Beyaz yakalı bir pozisyonda çalıştıysan',
              'Yeniden başlamaya hazır hissediyorsan — ya da henüz hazır hissetmiyorsan da',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <span className="text-[#e8312a] font-bold text-lg flex-shrink-0">✓</span>
                <p className="text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Neden Farklı? */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#12176b] text-center mb-4">
            Bir iş ilanı platformu değiliz.
          </h2>
          <div className="overflow-x-auto mt-8">
            <table className="w-full border-collapse rounded-xl overflow-hidden shadow-sm">
              <thead>
                <tr>
                  <th className="p-4 bg-gray-100 text-[#12176b] font-semibold text-left text-base">Geleneksel İK Platformları</th>
                  <th className="p-4 bg-[#e8312a] text-white font-semibold text-left text-base">Kaldığın Yerden</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["CV'ni algoritmaya gönderirsin", 'Seni doğrudan işverene biz sunarız'],
                  ['Herkese aynı içerik', 'Sana özel eğitim haritası'],
                  ['Yalnız başlarsın', 'Psikolog, mentor ve topluluk eşliğinde ilerlersin'],
                  ['Boşluk = ellenme', 'Boşluk = güç alanına dönüştürülür'],
                ].map(([col1, col2], i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-4 text-gray-600 border-t border-gray-100">{col1}</td>
                    <td className="p-4 text-[#c42920] font-medium border-t border-[#fff0f0]">{col2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Ekip */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#12176b] text-center mb-10">
            Arkanda güçlü bir ekip var.
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { name: 'Merve Gamze Kurtkesen', title: 'Kurucu' },
              { name: 'Pınar Çifterler', title: 'İK Direktörü — 18 yıl deneyim' },
              { name: 'Banu Geboloğlu', title: 'Psikolojik Danışman & UYA Kurucu Müdürü' },
              { name: 'Pınar Adanalı', title: 'Stratejik Danışman & İZEK Kurucu Üyesi' },
              { name: 'Gözde Ok', title: 'Görsel Tasarım & Sürdürülebilirlik Uzmanı' },
              { name: 'Aylin Önür', title: 'Stratejik & İşbirliği Danışmanı' },
            ].map((person, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#fee2e2] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[#c42920] font-bold text-lg">{person.name[0]}</span>
                </div>
                <div>
                  <p className="font-semibold text-[#12176b] text-sm">{person.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{person.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#12176b] text-white py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Hazır mısın?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/basvuru" className="bg-[#e8312a] hover:bg-[#c42920] text-white px-8 py-3 rounded-full font-medium transition flex items-center gap-2">
              Programa Başvur <span>→</span>
            </Link>
            <Link href="/nasil-calisir" className="border border-white/60 hover:bg-white/10 text-white px-8 py-3 rounded-full font-medium transition">
              Nasıl Çalışır?
            </Link>
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
