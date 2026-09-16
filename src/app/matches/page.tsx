import SectionHeading from "@/components/site/SectionHeading";
import MatchItem from "@/components/site/MatchItem";
import { placeholderMatches } from "@/lib/placeholder-data";

export const metadata = {
  title: "MATCHES | KAIZEN BADMINTON",
};

export default function MatchesPage() {
  return (
    <main>
      <div className="pageHeader">
        <SectionHeading en="Matches" jp="マッチ" />
      </div>
      <div className="iMatchDetail">
        <div className="iMatchDetail--wrap">
          <ul className="iMatch--list">
            {placeholderMatches.map((match) => (
              <MatchItem match={match} key={match.id} />
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
