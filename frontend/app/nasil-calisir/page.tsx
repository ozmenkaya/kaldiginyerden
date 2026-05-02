'use client';
import Link from 'next/link';
import Navbar from '../components/Navbar';

const steps = [
  {
    num: '1',
    title: 'Başvurunu Yap',
    desc: 'Kayıt formunu doldur, bize kendini tanıt. Kariyer geçmişin, ara verme nedenin ve beklentilerin hakkında birkaç soru soracağız. Bu adım 10 dakikadan fazla sürmez.',
  },
  {
    num: '2',
    title: 'Programı Keşfet & Katıl',
    desc: 'Başvurunun ardından seni programın tüm detaylarını anlatan sayfamıza yönlendiriyoruz. Hazır hissettiğinde "Programa Katıl" butonuyla yolculuğunu başlatıyorsun.',
  },
  {
    num: '3',
    title: 'Egonomist Testi & Hazırbulunuşluk Değerlendirmesi',
    desc: 'İki güçlü araçla seni tanımaya başlıyoruz: Egonomist Testi ile kişilik analizin, güçlü ve zayıf yönlerin, mesleki yatkınlıkların ortaya çıkıyor. Hazırbulunuşluk Formu ile psikolojik hazırlık düzeyini, beklentilerini ve motivasyonunu anlıyoruz.',
  },
  {
    num: '4',
    title: 'Kişiye Özel Eğitim Paketin',
    desc: 'Herkese aynı eğitimi vermiyoruz. Test sonuçlarına göre, ihtiyacın olan mesleki ve teknik beceri geliştirme eğitimleri senin panona özel olarak atanıyor. 800\'den fazla uzman içeriği arasından sadece sana gerekli olanlar seçiliyor. Program süresi: 4-6 hafta.',
  },
  {
    num: '5',
    title: 'Mentorun Seninle',
    desc: 'Sektörüne ve ihtiyaçlarına göre bir mentor ile eşleştiriliyorsun. Mentorluk süreci hem grup hem de birebir formatlarda ilerliyor. Program boyunca yalnız değilsin.',
  },
  {
    num: '6',
    title: 'İK Görüşmesi & Hazırlık',
    desc: 'Eğitim programını tamamladığında, deneyimli İK uzmanlarımızla birebir görüşüyorsun. CV\'ni birlikte güncelliyoruz, mülakat hazırlığı yapıyoruz. Program sonunda sana dijital sertifikan veriliyor.',
  },
  {
    num: '7',
    title: 'İşveren Eşleştirmesi',
    desc: 'Algoritmaya bırakmıyoruz. Hazır olduğunda, seni kapsayıcı işverenlerle doğrudan buluşturuyoruz. CV\'n bir havuza girmez — sen, doğru şirkete doğrudan sunulursun.',
  },
];

const faqs = [
  {
    q: 'Program ücretli mi?',
    a: `Kaldığın Yerden'de bazı içerikler ücretsiz, bazıları ücretlidir.

Ücretsiz olanlar: Webinarlar, seminerler, İK hazırlık süreci, mentorluk programı ve dayanışma topluluğuna erişim.

Ücretli olanlar: Kişiye özel eğitim paketindeki içerikler için Corpitall gibi profesyonel kurumlarla işbirliği yapıyoruz. Ancak kurumsal işbirliğimiz sayesinde bu ücret, bireysel satın alıma kıyasla çok daha avantajlı.

Program ücretine dahil olanlar: Egonomist testi & hazırbulunuşluk değerlendirmesi, kişiye özel eğitim paketi, tüm webinar ve seminerler, İK görüşmesi & mülakat hazırlığı, mentorluk programı, dayanışma topluluğuna tam erişim, dijital sertifika & başarı rozetleri.`,
  },
  {
    q: 'Ne kadar sürer?',
    a: 'Eğitim programı 4-6 hafta sürer. İK görüşmesi ve işveren eşleştirmesi bu sürecin ardından başlar.',
  },
  {
    q: 'Hangi sektörlerden kadınlara yönelik?',
    a: 'Beyaz yakalı pozisyonlarda deneyim sahibi tüm kadınlara açığız. Belirli bir sektör kısıtlamamız yok.',
  },
  {
    q: 'Uzaktan katılabilir miyim?',
    a: 'Evet. Program tamamen dijital olarak yürütülüyor.',
  },
];

export default function NasilCalisir() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#12176b] text-white py-20 md:py-28">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
            Dönüşün bir yol haritası var.
          </h1>
          <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto">
            Seni tanıyarak başlıyoruz. Hazır hissettirerek ilerliyoruz. Doğru işveren ile buluşturarak tamamlıyoruz.
          </p>
        </div>
      </section>

      {/* Adım Adım Yolculuk */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#12176b] text-center mb-12">
            Adım Adım Yolculuğun
          </h2>
          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-[#e8312a] text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg">
                    {step.num}
                  </div>
                  {i < steps.length - 1 && <div className="w-0.5 bg-teal-200 flex-1 my-2" />}
                </div>
                <div className="pb-8">
                  <h3 className="font-semibold text-[#12176b] text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Topluluk */}
      <section className="py-16 bg-[#fff0f0]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#12176b] mb-6">
            Tüm bu süreç boyunca bir topluluğun parçasısın.
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {[
              { icon: '👥', text: 'Benzer yolculukta olan kadınlarla tanışıyorsun' },
              { icon: '🎙️', text: 'Haftalık webinarlara katılıyorsun' },
              { icon: '💬', text: 'Sorularını sorabildiğin, deneyimlerini paylaşabildiğin güvenli bir alan seni bekliyor' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-4xl mb-3">{item.icon}</div>
                <p className="text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SSS */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-[#12176b] text-center mb-10">
            Sıkça Sorulan Sorular
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 group">
                <summary className="p-5 font-semibold text-[#12176b] cursor-pointer hover:text-[#c42920] transition list-none flex justify-between items-center">
                  {faq.q}
                  <span className="text-[#e8312a] group-open:rotate-180 transition-transform text-xl leading-none">+</span>
                </summary>
                <div className="px-5 pb-5 text-gray-600 leading-relaxed whitespace-pre-line">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#12176b] text-white py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Yolculuğuna başlamaya hazır mısın?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/basvuru" className="bg-[#e8312a] hover:bg-[#c42920] text-white px-8 py-3 rounded-full font-medium transition flex items-center gap-2">
              Hemen Başvur <span>→</span>
            </Link>
            <Link href="/iletisim" className="border border-white/60 hover:bg-white/10 text-white px-8 py-3 rounded-full font-medium transition">
              Bize Ulaş
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
