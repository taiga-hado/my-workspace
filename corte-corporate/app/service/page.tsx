import Link from "next/link";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";

const strengths = [
  {
    num: "01",
    title: "通過率5%の東大生講師",
    body: "1,000名超の東大生から通過率5%の厳選講師を採用。生徒の志望校・性格・学習段階に合わせた専属講師を配置します。",
  },
  {
    num: "02",
    title: "1日単位のオーダーメイド計画",
    body: "志望校から逆算し、「今日やるべきこと」を1日単位で設計。やるべきことが明確だから、迷わず最短距離で実力が伸びます。",
  },
  {
    num: "03",
    title: "塾外時間の徹底管理",
    body: "LINEでの日次報告、週1回の面談、毎日18-24時のオンライン自習室。塾にいない時間こそを伸ばす学習管理の仕組みを提供。",
  },
];

const stats = [
  { num: "81%", label: "逆転合格率" },
  { num: "+20.4", label: "偏差値平均上昇" },
  { num: "93%", label: "生徒満足度" },
];

const targets = [
  "大学受験を目指す高校生",
  "高校受験を目指す中学生",
  "中学受験を目指す小学生",
  "現役合格を目指す浪人生",
];

export default function Service() {
  return (
    <>
      <PageHero en="Service" jp="運営サービス" />

      {/* Main Service */}
      <section className="py-20 md:py-28">
        <div className="container-max">
          <div className="heading-en">Main Service</div>
          <h2 className="font-serif text-3xl md:text-5xl font-semibold text-navy-900 mt-3">
            東大式逆転塾
          </h2>
          <p className="mt-6 max-w-2xl text-navy-800 leading-loose">
            専属の東大生講師による、逆転合格を狙うための徹底管理個別指導塾。
            偏差値30〜50からの「逆転合格」を本気で実現するための、完全オンラインのスクールです。
          </p>

          <Link
            href="https://todai-gyakuten.example.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block group mt-12"
          >
            <div className="aspect-[21/9] bg-white border border-navy-100 rounded-sm overflow-hidden relative flex items-center justify-center transition group-hover:border-navy-300 group-hover:shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/todai-gyakuten-logo.png"
                alt="東大式逆転塾"
                className="max-w-[60%] max-h-[70%] object-contain"
              />
              <div className="absolute bottom-5 right-6 text-sm text-navy-600">
                サービスサイトへ →
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Strengths */}
      <section className="bg-navy-50 py-20 md:py-28">
        <div className="container-max">
          <SectionHeading en="Strengths" jp="選ばれる3つの理由" />
          <div className="mt-14 grid md:grid-cols-3 gap-8">
            {strengths.map((s) => (
              <div key={s.num} className="bg-white p-10">
                <div className="heading-en">{s.num}</div>
                <h3 className="font-serif text-xl font-semibold text-navy-900 mt-3">
                  {s.title}
                </h3>
                <p className="mt-4 text-sm leading-loose text-navy-800">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 md:py-28">
        <div className="container-max">
          <SectionHeading en="Results" jp="実績" />
          <div className="mt-14 grid md:grid-cols-3 gap-8">
            {stats.map((s) => (
              <div
                key={s.label}
                className="border border-navy-100 p-10 text-center"
              >
                <div className="font-serif text-5xl md:text-6xl font-semibold text-navy-900">
                  {s.num}
                </div>
                <div className="mt-3 text-sm tracking-wider2 text-navy-500">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target */}
      <section className="bg-navy-50 py-20 md:py-28">
        <div className="container-max">
          <SectionHeading en="Target" jp="対象となる方" />
          <ul className="mt-12 grid md:grid-cols-2 gap-4 max-w-3xl">
            {targets.map((t) => (
              <li
                key={t}
                className="flex items-start gap-3 bg-white px-6 py-5"
              >
                <span className="mt-1 w-2 h-2 rounded-full bg-navy-800 flex-shrink-0" />
                <span className="text-navy-900">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container-max text-center">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy-900">
            詳しいサービス内容はサービスサイトへ
          </h2>
          <div className="mt-8">
            <Link
              href="https://todai-gyakuten.example.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              東大式逆転塾サイトへ →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
