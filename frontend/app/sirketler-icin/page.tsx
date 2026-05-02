'use client';
import Link from 'next/link';
import Navbar from '../components/Navbar';

const advantages = [
  {
    icon: '🎯',
    title: 'Hazır Aday',
    desc: 'CV tarama, ön eleme, mülakat hazırlığı — hepsi bizden. Siz yalnızca son görüşmeye giriyorsunuz.',
  },
  {
    icon: '💼',
    title: 'Millennial Sadakati',
    desc: 'Kariyer molasından dönen kadınlar, iş dünyasının en sadık çalışanları arasında. Gen Z devir hızının yarattığı İK yorgunluğuna karşı güçlü bir alternatif.',
  },
  {
    icon: '📊',
    title: 'ESG & DEI Hedeflerine Katkı',
    desc: 'Her işe alım, şirketinizin çeşitlilik ve kapsayıcılık metriklerine doğrudan katkı sağlıyor. Raporlarınızda somut bir etki yaratıyorsunuz.',
  },
  {
    icon: '🤝',
    title: 'Önyargıyı Birlikte Kırıyoruz',
    desc: 'İK yöneticilerinizle birlikte seminer ve bilinçlendirme toplantıları düzenliyoruz. Kariyer boşluğunu bir dezavantaj olarak görme alışkanlığını birlikte dönüştürüyoruz.',
  },
];

const models = [
  {
    title: 'Yerleştirme Ücreti',
    desc: 'Başarılı her işe yerleştirme için tek seferlik ücret. Riski minimize eder, sonuca odaklanır.',
  },
  {
    title: 'Kurumsal Abonelik',
    desc: 'Aday havuzuna sürekli erişim, öncelikli eşleştirme ve düzenli İK seminerleri dahil. Yıllık veya dönemsel paketler.',
  },
  {
    title: 'Returnship Programı',
    desc: 'Şirketinize özel bir kariyer dönüşü programı tasarlıyoruz. DEI stratejinizin merkezine yerleştiriyorsunuz.',
  },
];

const steps = [
  'İletişime Geçin — Kurumsal başvuru formunu doldurun veya bizi arayın.',
  'İhtiyaç Analizi — Hangi pozisyonlar, hangi profiller? Birlikte belirliyoruz.',
  'Aday Eşleştirmesi — Size özel hazırlanmış aday listesini sunuyoruz.',
  'Görüşme & İşe Alım — Siz karar veriyorsunuz, biz destekliyoruz.',
  'Takip — İşe alım sonrası 1 yıl boyunca iletişimdeyiz.',
];

export default function SirketlerIcin() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#12176b] text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
            Aradığınız yetenek burada.<br />Sadece göremiyordunuz.
          </h1>
          <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
            Kaldığın Yerden, şirketlere hazır, sadık ve nitelikli Millennial yetenek havuzuna doğrudan erişim sağlıyor.
          </p>
        </div>
      </section>

      {/* Giriş */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            Türkiye&apos;deki işverenlerin %76&apos;sı nitelikli eleman bulmakta zorlandığını söylüyor. Aynı anda 10 milyon kadın,
            kariyer molası nedeniyle iş gücünün dışında bekliyor.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed">
            Bu iki gerçek aynı anda var olabiliyor — çünkü aralarında köprü yok.
          </p>
          <p className="text-[#c42920] font-semibold text-xl mt-6">Biz o köprüyüz.</p>
        </div>
      </section>

      {/* Neden Kaldığın Yerden? */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#12176b] text-center mb-4">
            Sıradan bir İK platformu değil.
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">
            Diğer platformlarda yüzlerce CV arasında kaybolursunuz. Bizde değil. Size yalnızca önceden değerlendirilmiş,
            Egonomist testiyle analiz edilmiş, eğitim programını tamamlamış ve İK görüşmesinden geçmiş adayları sunuyoruz.
          </p>
          <p className="text-[#c42920] font-semibold text-center text-lg">
            Algoritmayı biz aşıyoruz — siz sadece doğru adayla tanışıyorsunuz.
          </p>
        </div>
      </section>

      {/* Avantajlar */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#12176b] text-center mb-10">
            Kaldığın Yerden ile çalışmanın size kattıkları
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {advantages.map((adv, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div className="text-4xl mb-3">{adv.icon}</div>
                <h3 className="font-semibold text-[#12176b] text-lg mb-2">{adv.title}</h3>
                <p className="text-gray-600">{adv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* İşbirliği Modelleri */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#12176b] text-center mb-10">
            Size uygun bir model var.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {models.map((model, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                <h3 className="font-bold text-[#12176b] text-lg mb-3">{model.title}</h3>
                <p className="text-gray-600 text-sm">{model.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Süreç */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#12176b] text-center mb-10">
            Nasıl çalışır?
          </h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#e8312a] text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                  {i + 1}
                </div>
                <p className="text-gray-700 pt-2">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sosyal Etki */}
      <section className="py-16 bg-[#fff0f0]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#12176b] mb-6">
            Sadece yetenek bulmuyorsunuz. Bir dönüşümün parçası oluyorsunuz.
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Kaldığın Yerden ile çalışan şirketler, kariyer molasını bir engel olarak değil, bir birikim olarak gören öncü kurumlar
            arasına katılıyor. Bu tercih, hem çalışanlarınıza hem de kamuoyuna güçlü bir mesaj veriyor.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#12176b] text-white py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Nitelikli yeteneğe ulaşmaya hazır mısınız?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/kurumsal-basvuru" className="bg-[#e8312a] hover:bg-[#c42920] text-white px-8 py-3 rounded-full font-medium transition flex items-center gap-2">
              Kurumsal Başvuru Formu <span>→</span>
            </Link>
            <Link href="/iletisim" className="border border-white/60 hover:bg-white/10 text-white px-8 py-3 rounded-full font-medium transition">
              Bizimle İletişime Geçin
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
