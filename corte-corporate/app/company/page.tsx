import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/SectionHeading";

const info: { label: string; value: React.ReactNode }[] = [
  { label: "会社名", value: "株式会社Corte (Corte Inc.)" },
  {
    label: "代表者",
    value: (
      <>
        代表取締役 嵐 弘太郎
        <br />
        代表取締役 北尾 晴喜
      </>
    ),
  },
  {
    label: "所在地",
    value: (
      <>
        〒150-0031
        <br />
        東京都渋谷区桜丘町21-4 渋谷桜丘町ビル3F
      </>
    ),
  },
  {
    label: "事業内容",
    value: (
      <>
        オンライン個別指導塾「東大式逆転塾」の企画・運営
        <br />
        教育コンテンツの開発および提供
      </>
    ),
  },
];

const directors = [
  {
    name: "嵐 弘太郎",
    role: "代表取締役 Co-CEO",
    profile:
      "「挑戦する人の環境を変える」をテーマに、教育事業を立ち上げる。東大式逆転塾の企画・運営を統括し、カリキュラム設計と講師育成を主導。",
  },
  {
    name: "北尾 晴喜",
    role: "代表取締役 Co-CEO",
    profile:
      "マーケティング・事業開発を担当。生徒と保護者に届くサービス体験の設計と、組織づくりを通じて、Corteの事業成長を牽引。",
  },
];

export default function Company() {
  return (
    <>
      <PageHero en="Company" jp="会社概要" />

      <section className="py-20 md:py-28">
        <div className="container-max">
          <SectionHeading en="Overview" jp="基本情報" />
          <dl className="mt-12 border-t border-navy-100">
            {info.map((row) => (
              <div
                key={row.label}
                className="grid md:grid-cols-[220px_1fr] gap-3 md:gap-8 py-6 border-b border-navy-100"
              >
                <dt className="text-sm font-medium text-navy-500">
                  {row.label}
                </dt>
                <dd className="text-navy-900 leading-relaxed">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-navy-50 py-20 md:py-28">
        <div className="container-max">
          <SectionHeading en="Directors" jp="経営陣" />
          <div className="mt-14 grid md:grid-cols-2 gap-10">
            {directors.map((d) => (
              <div key={d.name} className="bg-white p-8 md:p-10">
                <div className="aspect-square w-32 bg-navy-100 rounded-full flex items-center justify-center text-navy-400 text-xs">
                  Photo
                </div>
                <div className="mt-6">
                  <div className="heading-en">{d.role}</div>
                  <div className="font-serif text-2xl font-semibold text-navy-900 mt-2">
                    {d.name}
                  </div>
                  <p className="mt-5 text-sm leading-loose text-navy-800">
                    {d.profile}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="container-max">
          <SectionHeading en="Access" jp="アクセス" />
          <div className="mt-10 aspect-[16/7] bg-navy-50 border border-navy-100 rounded-sm flex items-center justify-center text-navy-400 text-sm">
            Map Placeholder
          </div>
          <p className="mt-6 text-sm text-navy-800">
            JR「渋谷駅」南改札西口より徒歩5分
          </p>
        </div>
      </section>
    </>
  );
}
