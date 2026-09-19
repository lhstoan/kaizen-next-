import SectionHeading from "@/components/site/SectionHeading";
import MatchItem from "@/components/site/MatchItem";
import { getMatches } from "@/lib/matches";

export const metadata = {
  title: "MATCHES | KAIZEN BADMINTON",
};

export default async function MatchesPage() {
  const matches = await getMatches();

  return (
    <main>
      <div className="pageHeader">
        <SectionHeading en="Matches" jp="マッチ" />
      </div>
      <div className="iMatchDetail">
        <div className="iMatchDetail--wrap">
          <ul className="iMatch--list">
            {matches.map((match) => (
              <MatchItem match={match} key={match.id} />
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
