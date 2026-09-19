import Image from "next/image";
import type { HallOfFameEntry } from "@/types/home";

export default function HallOfFameItem({ entry }: { entry: HallOfFameEntry }) {
  return (
    <li className="iHof--item">
      <span className="year">{entry.year}</span>

      <div className="iHof--champion">
        <span className="rank">{entry.rank}</span>
        <span className="name">{entry.championName}</span>
      </div>

      {/* Right column: the champion's own badge on the red flag, then one white
          plate per top scorer underneath. */}
      <ul className="iHof--logos">
        <li className="--champion">
          {entry.championLogoUrl && (
            <Image src={entry.championLogoUrl} alt={entry.championName} width={200} height={70} />
          )}
        </li>
        {entry.topScorers.map((scorer, i) => (
          <li key={`${scorer.logoUrl}-${i}`}>
            {scorer.logoUrl && <Image src={scorer.logoUrl} alt={scorer.name} width={200} height={70} />}
          </li>
        ))}
      </ul>
    </li>
  );
}
