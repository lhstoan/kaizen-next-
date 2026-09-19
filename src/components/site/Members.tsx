"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import SectionHeading from "@/components/site/SectionHeading";
import MemberCard from "@/components/site/MemberCard";
import type { Member } from "@/types/home";

export default function Members({ members }: { members: Member[] }) {
  return (
    <section className="iMember --padding">
      <div className="iMember--wrap --wrap">
        <SectionHeading en="Members" jp="プレイヤー" />
        <Swiper
          className="iMember--list"
          modules={[Autoplay]}
          slidesPerView={4}
          spaceBetween={30}
          loop
          autoplay={{ delay: 2000 }}
          speed={700}
          breakpoints={{
            0: { slidesPerView: 1 },
            751: { slidesPerView: 4 },
          }}
        >
          {members.map((member) => (
            <SwiperSlide key={member.id} tag="li">
              <MemberCard member={member} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
