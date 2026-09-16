import Image from "next/image";
import type { Match } from "@/types/home";

function TeamBlock({ name, logoUrl }: { name: string; logoUrl: string }) {
  return (
    <div className="iMatch--team-info">
      <div className="iMatch--team-logo">
        <Image src={logoUrl} alt={name} width={100} height={100} />
      </div>
      <div className="iMatch--team-name">
        <span>{name}</span>
      </div>
    </div>
  );
}

const KAIZEN_TEAM = { name: "KAIZEN BADMINTON", logoUrl: "/images/logo moi/kaizen team badminton circle.png" };

export default function MatchItem({ match }: { match: Match }) {
  const opponent = { name: match.opponentName, logoUrl: match.opponentLogoUrl };
  const first = match.kaizenIsHome ? KAIZEN_TEAM : opponent;
  const second = match.kaizenIsHome ? opponent : KAIZEN_TEAM;

  return (
    <li className="iMatch--item">
      <div className="iMatch--item-title">
        <span className="round">Round {match.round}</span>
        <span className="date">{match.date}</span>
        <span className="name">{match.tournamentName}</span>
      </div>
      <div className="iMatch--team">
        <TeamBlock name={first.name} logoUrl={first.logoUrl} />
        {match.scores ? (
          <ul className="iMatch--team-scores">
            <li className={match.scores.home > match.scores.away ? "win" : ""}>{match.scores.home}</li>
            <li className={match.scores.away > match.scores.home ? "win" : ""}>{match.scores.away}</li>
          </ul>
        ) : (
          <ul className="iMatch--team-coming">
            <span>{match.timeLabel}</span>
          </ul>
        )}
        <TeamBlock name={second.name} logoUrl={second.logoUrl} />
      </div>
      <div className="iMatch--item-map">
        <span>{match.courtLocation}</span>
      </div>
    </li>
  );
}
