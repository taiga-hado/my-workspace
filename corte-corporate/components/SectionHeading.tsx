export default function SectionHeading({
  en,
  jp,
  center = false,
}: {
  en: string;
  jp: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "text-center" : ""}>
      <div className="heading-en">{en}</div>
      <h2 className="heading-jp">{jp}</h2>
    </div>
  );
}
