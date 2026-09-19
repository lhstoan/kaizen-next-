import SectionHeading from "@/components/site/SectionHeading";
import MemberCard from "@/components/site/MemberCard";
import type { Member } from "@/types/home";

export default function Members({ members }: { members: Member[] }) {
  if (members.length === 0) return null;

  // A CSS marquee instead of Swiper: with only a handful of players, Swiper's loop
  // ran out of clones after one pass and left the track blank. The list is rendered
  // twice and the animation shifts it by exactly half, so the seam is invisible and
  // the drift never stops.
  const track = [...members, ...members];

  return (
    <section className="iMember --padding">
      <div className="iMember--wrap --wrap">
        <SectionHeading en="Members" jp="プレイヤー" />
        {/* The shift is computed from the card count, not a percentage: the name badge
            hangs past its card, so the track's own width is a few pixels wider than the
            cards it holds and a -50% shift would drift out of step every cycle. */}
        <div className="iMember--marquee" style={{ ["--member-count" as string]: members.length }}>
          <ul className="iMember--list">
            {track.map((member, i) => (
              <li key={`${member.id}-${i}`} aria-hidden={i >= members.length}>
                <MemberCard member={member} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
