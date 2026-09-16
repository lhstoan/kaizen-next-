export type Member = {
  id: string;
  fullName: string;
  nationality: string;
  event: string[];
  photoUrl: string;
};

export type Match = {
  id: string;
  round: number;
  date: string;
  tournamentName: string;
  courtLocation: string;
  kaizenIsHome: boolean;
  opponentName: string;
  opponentLogoUrl: string;
  timeLabel: string;
  scores?: { home: number; away: number };
};

export type Partner = {
  id: string;
  name: string;
  logoUrl: string;
};
