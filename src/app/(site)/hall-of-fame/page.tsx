import MainVisual from "@/components/site/MainVisual";
import Partners from "@/components/site/Partners";
import HallOfFameItem from "@/components/site/HallOfFameItem";
import { getHallOfFame } from "@/lib/hall-of-fame";
import { getPartnerGroups } from "@/lib/partners";

export const metadata = {
  title: "HALL OF FAME | KAIZEN BADMINTON",
};

export default async function HallOfFamePage() {
  const [entries, { mainPartners, internationalPartners, otherPartners }] = await Promise.all([
    getHallOfFame(),
    getPartnerGroups(),
  ]);

  return (
    <main>
      <MainVisual />
      <section className="iHof">
        <div className="iHof--wrap">
          <div className="iHof--head">
            <span className="champion">Champion</span>
            <span className="scorers">
              Top Scorers
              <small>Hall of Fame</small>
            </span>
          </div>
          <ul className="iHof--list">
            {entries.map((entry) => (
              <HallOfFameItem entry={entry} key={entry.id} />
            ))}
          </ul>
        </div>
      </section>
      <Partners
        mainPartners={mainPartners}
        internationalPartners={internationalPartners}
        otherPartners={otherPartners}
      />
    </main>
  );
}
