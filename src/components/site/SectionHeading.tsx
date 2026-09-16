export default function SectionHeading({ en, jp }: { en: string; jp: string }) {
  return (
    <h3 className="ih3">
      <span className="en">{en}</span>
      <span className="jp">{jp}</span>
    </h3>
  );
}
