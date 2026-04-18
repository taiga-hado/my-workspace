export default function PageHero({
  en,
  jp,
}: {
  en: string;
  jp: string;
}) {
  return (
    <section className="bg-navy-950 text-white">
      <div className="container-max py-20 md:py-28">
        <div className="heading-en text-navy-300">{en}</div>
        <h1 className="font-serif text-3xl md:text-5xl font-semibold mt-3 tracking-wide">
          {jp}
        </h1>
      </div>
    </section>
  );
}
