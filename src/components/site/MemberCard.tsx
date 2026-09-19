import Image from "next/image";
import type { Member } from "@/types/home";

// Card body shared by the homepage carousel and the team member grid — the parent
// owns the <li> so the carousel can hand it to a SwiperSlide.
export default function MemberCard({ member }: { member: Member }) {
  return (
    <>
      <div className="img">
        <Image src={member.photoUrl} alt={member.fullName} width={200} height={200} />
      </div>
      <div className="info">
        <div className="city">
          {/* Legacy CSS renders this badge at ~72px wide and crops it, so the 24px
              intrinsic size it used to declare made next/image serve a 32px file. */}
          <Image src={`/images/${member.nationality}.png`} alt={member.nationality} width={150} height={100} />
        </div>
        <div className="title">
          <span className="name">{member.fullName}</span>
          <span className="role">{member.event.join("/")}</span>
        </div>
      </div>
    </>
  );
}
