import SectionHeading from "@/components/site/SectionHeading";
import MatchItem from "@/components/site/MatchItem";
import type { Match } from "@/types/home";

export default function Matches({ matches, monthLabel }: { matches: Match[]; monthLabel: string }) {
  return (
    <div className="iMatch">
      <div className="iMatch--bg"></div>
      <div className="iMatch--title">
        <SectionHeading en="Matches" jp="マッチ" />
      </div>
      <div className="iMatch--month">
        <span className="month">{monthLabel}</span>
      </div>
      <div className="iMatch--wrap">
        <ul className="iMatch--list">
          {matches.map((match) => (
            <MatchItem match={match} key={match.id} />
          ))}
        </ul>
      </div>
    </div>
  );
}
