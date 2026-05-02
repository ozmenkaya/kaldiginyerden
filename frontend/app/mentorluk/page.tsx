'use client';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Mentorluk() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#12176b] text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
            Bir adım öndesin.<br />Şimdi sıra geri dönmeye yardım etmekte.
          </h1>
          <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
            Kaldığın Yerden mentorluk programı, deneyimini paylaşmak isteyenlerle yeni bir başlangıç yapmak isteyenleri buluşturuyor.
          </p>
        </div>
      </section>

      {/* Giriş */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-lg leading-relaxed">
            Kariyer yolculuğunda edindiğin her şey — başarıların, zorlukların, öğrendiklerin — başka bir kadın için en değerli rehber olabilir.
            Mentorluk burada bir görev değil, bir dayanışma seçimi.
          </p>
        </div>
      </section>

      {/* İki Yol */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Mentor Ol */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col">
              <div className="text-5xl mb-4">🌟</div>
              <h2 className="text-xl font-bold text-[#12176b] mb-3">Mentor Olmak İstiyorum</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Deneyimini paylaşmaya hazırsan, sen de bu ekosistemin bir parçasısın.
              </p>
              <Link href="#mentor-ol" className="mt-auto bg-[#e8312a] hover:bg-[#c42920] text-white py-3 rounded-full font-medium transition text-center">
                Mentor Başvurusu Yap
              </Link>
            </div>

            {/* Mentor Ara */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col">
              <div className="text-5xl mb-4">🔍</div>
              <h2 className="text-xl font-bold text-[#12176b] mb-3">Mentor Arıyorum</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Sana rehberlik edecek, sektörünü bilen, yolculuğunu anlayan biriyle tanışmak istiyorsan doğru yerdesin.
              </p>
              <Link href="#mentor-bul" className="mt-auto bg-[#12176b] hover:bg-[#1a1f80] text-white py-3 rounded-full font-medium transition text-center">
                Mentor Havuzunu Keşfet
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Mentor Kim Olabilir? */}
      <section id="mentor-ol" className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#12176b] text-center mb-10">
            Kim mentor olabilir?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-[#12176b] text-lg mb-4">Koşullar</h3>
              <div className="space-y-3">
                {[
                  'Herhangi bir sektörde en az 5 yıl profesyonel deneyimi olan',
                  'Aktif iş hayatında olan ya da kıdemli kariyerinden emekli olmuş',
                  'Kariyer molası vermiş kadınlara empatiyle yaklaşabilen',
                  'Ayda en az 2-3 saat ayırabilecek olan herkes',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-[#e8312a] font-bold flex-shrink-0">✓</span>
                    <p className="text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-[#12176b] text-lg mb-4">Mentor Olmanın Faydaları</h3>
              <div className="space-y-3">
                {[
                  'Liderlik ve koçluk becerilerini geliştirme',
                  'Kaldığın Yerden topluluğuna ve ağına erişim',
                  'Şirketinizin DEI hedeflerine somut katkı',
                  'Geri dönmek isteyen kadınların hayatında gerçek bir fark yaratma',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-[#e8312a] font-bold flex-shrink-0">→</span>
                    <p className="text-gray-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mentorluk Nasıl Çalışır? */}
      <section id="mentor-bul" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#12176b] text-center mb-10">
            Mentorluk Nasıl Çalışır?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#12176b] mb-3">Eşleştirme Süreci</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Egonomist testi ve kariyer profili sonuçlarına göre, her adaya en uygun mentor atanıyor.
                Sektör, deneyim alanı ve kişilik uyumu gözetiliyor.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#12176b] mb-3">Format</h3>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Grup mentorluk — Haftada 1 online oturum, 4-6 kişilik gruplar</li>
                <li>• Birebir mentorluk — Adayın ihtiyacına göre, ayda 2-4 seans</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#12176b] mb-3">Süre</h3>
              <p className="text-gray-600 text-sm">Program boyunca devam eder — ortalama 6-8 hafta.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-[#12176b] mb-3">Ortam</h3>
              <p className="text-gray-600 text-sm">Tamamen online, esnek saatlerde.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pay It Forward */}
      <section className="py-16 bg-[#fff0f0]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#12176b] mb-6">
            Bugünün adayı, yarının mentoru.
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Kaldığın Yerden&apos;den mezun olup bir işe yerleşen her kadın, 1 yıl sonra topluluğa mentor olarak geri dönüyor.
            Bu bir zorunluluk — ama aynı zamanda en güçlü dayanışma biçimi.
          </p>
          <p className="text-[#c42920] font-semibold text-lg mt-4">
            Çünkü sana uzanan o eli, sen de bir başkasına uzatıyorsun.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#12176b] text-white py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Bir fark yaratmaya hazır mısın?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/basvuru" className="bg-[#e8312a] hover:bg-[#c42920] text-white px-8 py-3 rounded-full font-medium transition flex items-center gap-2">
              Mentor Ol <span>→</span>
            </Link>
            <Link href="/basvuru" className="border border-white/60 hover:bg-white/10 text-white px-8 py-3 rounded-full font-medium transition">
              Mentor Bul
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
