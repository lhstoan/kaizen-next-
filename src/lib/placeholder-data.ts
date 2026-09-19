import type { Match, Member } from "@/types/home";

export const placeholderMembers: Member[] = Array.from({ length: 7 }).map((_, i) => ({
  id: String(i),
  fullName: "Tong Hoang Nam",
  gender: i % 3 === 2 ? ("women" as const) : ("men" as const),
  nationality: "vn",
  event: ["MS", "MX"],
  photoUrl: "/images/members/0.png",
}));

export const placeholderMatches: Match[] = [
  {
    id: "1",
    round: 5,
    date: "Wed 17 Sept 2025",
    tournamentName: "MBA TOURNAMENT - ULTIMATE CLANS LEAGUE SEASON 2",
    courtLocation: "909 Truong Chinh Badminton Court",
    kaizenIsHome: true,
    opponentName: "VY Badminton",
    opponentLogoUrl: "/images/partners/vybadminton.png",
    timeLabel: "20:30",
  },
  {
    id: "2",
    round: 5,
    date: "Wed 17 Sept 2025",
    tournamentName: "MBA TOURNAMENT - ULTIMATE CLANS LEAGUE SEASON 2",
    courtLocation: "909 Court",
    kaizenIsHome: true,
    opponentName: "Trung Vo Badminton Club",
    opponentLogoUrl: "/images/partners/vybadminton.png",
    timeLabel: "",
    scores: { home: 3, away: 2 },
  },
];
