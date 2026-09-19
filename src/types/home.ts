export type MemberGender = "men" | "women";

export type Member = {
  id: string;
  fullName: string;
  gender: MemberGender;
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

export type HallOfFameEntry = {
  id: string;
  year: number;
  rank: string;
  championName: string;
  championLogoUrl: string;
  topScorers: { name: string; logoUrl: string }[];
};

export type NewsItem = {
  id: string;
  labelEn: string;
  labelJp: string;
  title: string;
  link: string;
  imageUrl: string;
  featured: boolean;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverUrl: string;
  publishedAt: string;
};
