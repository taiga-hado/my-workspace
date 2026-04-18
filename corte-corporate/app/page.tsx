import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";

const services = [
  {
    title: "東大式逆転塾",
    subtitle: "Online Coaching School",
    description:
      "専属の東大生講師による、逆転合格を狙うための徹底管理個別指導塾。偏差値30〜50からの逆転合格を実現するオンラインスクール。",
    href: "https://todai-gyakuten.example.com",
    badge: "Main Service",
  },
];

const values = [
  {
    num: "01",
    title: "挑戦する人のそばに立つ",
    body: "偏差値や過去の成績ではなく、これから伸びようとする意思を信じる。Corteは挑戦する一人ひとりの最短距離を共に設計します。",
  },
  {
    num: "02",
    title: "再現性のある教育を。",
    body: "東大生の学習法を誰もが実行できる仕組みに翻訳する。属人的なノウハウを、カリキュラムと学習管理で再現可能にします。",
  },
  {
    num: "03",
    title: "結果にこだわり抜く。",
    body: "「やった」ではなく「できた」に責任を持つ。1日単位の計画と毎日の学習管理で、成果に向かう時間の質を最大化します。",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-navy-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#3b5789,transparent_50%),radial-gradient(circle_at_80%_80%,#22345a,transparent_50%)]" />
        <div className="container-max relative py-28 md:py-40">
          <div className="heading-en text-navy-300">Corte Inc.</div>
          <h1 className="font-serif text-4xl md:text-6xl font-semibold mt-4 leading-[1.2] tracking-wide">
            挑戦を、
            <br />
            最短距離の成長に変える。
          </h1>
          <p className="mt-8 max-w-xl text-navy-100 leading-relaxed">
            株式会社Corteは、東大生講師による完全オンライン個別指導塾
            「東大式逆転塾」を運営する教育カンパニーです。
            偏差値や環境に関係なく、本気で挑戦する一人ひとりが
            最短距離で成長できる学びを届けます。
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/service" className="btn-primary bg-white text-navy-900 hover:bg-navy-100">
              事業を見る
            </Link>
            <Link
              href="/contact"
              className="btn-outline border-white text-white hover:bg-white/10"
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 md:py-32">
        <div className="container-max grid md:grid-cols-[1fr_2fr] gap-12">
          <SectionHeading en="Mission" jp="私たちの使命" />
          <div>
            <p className="font-serif text-2xl md:text-3xl font-semibold leading-relaxed text-navy-900">
              「あと一歩」を、
              <br />
              諦めなくていい社会へ。
            </p>
            <p className="mt-8 text-navy-800 leading-loose">
              多くの受験生が、才能ではなく「環境」や「正しい学習法の不在」によって挑戦を諦めています。
              私たちは、東大生の知と、個別最適化された学習管理の仕組みを掛け合わせ、
              どこにいても、どんなスタート地点からでも、挑戦しきれる学びを届けます。
              教育を、一部の人のためのものから、すべての挑戦者のためのものへ。
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-navy-50 py-24 md:py-32">
        <div className="container-max">
          <SectionHeading en="Values" jp="Corteが大切にすること" />
          <div className="mt-14 grid md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div
                key={v.num}
                className="bg-white rounded-sm p-10 border border-navy-100"
              >
                <div className="heading-en">{v.num}</div>
                <h3 className="font-serif text-xl font-semibold text-navy-900 mt-3">
                  {v.title}
                </h3>
                <p className="mt-4 text-sm leading-loose text-navy-800">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service */}
      <section className="py-24 md:py-32">
        <div className="container-max">
          <SectionHeading en="Service" jp="運営サービス" />
          <div className="mt-14 mx-auto max-w-xl">
            {services.map((s) => (
              <Link
                key={s.title}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="aspect-[16/10] bg-white border border-navy-100 rounded-sm overflow-hidden relative flex items-center justify-center transition group-hover:border-navy-300 group-hover:shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/todai-gyakuten-logo.png"
                    alt="東大式逆転塾"
                    className="max-w-[80%] max-h-[70%] object-contain"
                  />
                  <span className="absolute top-5 left-5 px-3 py-1 text-[10px] tracking-wider2 bg-navy-900 text-white rounded-full">
                    {s.badge}
                  </span>
                </div>
                <p className="mt-5 text-sm leading-loose text-navy-800">
                  {s.description}
                </p>
                <div className="mt-4 text-sm text-navy-600 group-hover:text-navy-900 transition">
                  サービスサイトを見る →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-950 text-white">
        <div className="container-max py-20 text-center">
          <div className="heading-en text-navy-300">Contact</div>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mt-3">
            一緒に、挑戦の環境をつくりませんか。
          </h2>
          <p className="mt-6 text-navy-100 text-sm md:text-base">
            取材・協業・採用に関するお問い合わせはこちらから。
          </p>
          <div className="mt-10">
            <Link
              href="/contact"
              className="btn-primary bg-white text-navy-900 hover:bg-navy-100"
            >
              お問い合わせはこちら
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
