import PageHero from "@/components/PageHero";

export default function Message() {
  return (
    <>
      <PageHero en="Message" jp="代表メッセージ" />

      <section className="py-20 md:py-28">
        <div className="container-max max-w-4xl">
          <p className="font-serif text-2xl md:text-3xl font-semibold leading-relaxed text-navy-900">
            「才能」ではなく「環境」で、
            <br />
            挑戦の結果が決まってしまう。
            <br />
            その現実を変えたい。
          </p>

          <div className="mt-12 space-y-8 text-navy-800 leading-loose">
            <p>
              私たちが教育事業を立ち上げたのは、受験という挑戦の中で、
              「もう少し環境があれば伸びたはずの人」を何人も見てきたからです。
              情報、学習法、継続する仕組み——。
              必要なのは才能ではなく、それらに正しく出会えるかどうか。
              その差がそのまま、人生の選択肢の差になってしまっています。
            </p>
            <p>
              東大式逆転塾は、その「差」を埋めるためのサービスです。
              通過率5%の東大生講師、1日単位のオーダーメイド計画、塾外時間までを見守る学習管理。
              これらを完全オンラインで提供することで、
              どこに住んでいても、どんなスタート地点からでも、
              本気で挑戦する一人ひとりを支えられるはずだと信じています。
            </p>
            <p>
              Corteという社名は、ラテン語で「選び取る」という語源を持ちます。
              誰もが、自分の意志で未来を選び取れるように。
              そのための学びと環境を、これからも愚直につくり続けていきます。
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-2 gap-10">
            {[
              { name: "嵐 弘太郎", role: "代表取締役 Co-CEO" },
              { name: "北尾 晴喜", role: "代表取締役 Co-CEO" },
            ].map((p) => (
              <div key={p.name} className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-navy-100 flex items-center justify-center text-navy-400 text-xs flex-shrink-0">
                  Photo
                </div>
                <div>
                  <div className="text-xs tracking-wider2 text-navy-500">
                    {p.role}
                  </div>
                  <div className="font-serif text-xl font-semibold text-navy-900 mt-1">
                    {p.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
