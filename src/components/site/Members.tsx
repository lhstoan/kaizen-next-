"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";
import SectionHeading from "@/components/site/SectionHeading";
import MemberCard from "@/components/site/MemberCard";
import type { Member } from "@/types/home";

export default function Members({ members }: { members: Member[] }) {
  return (
    <section className="iMember --padding">
      <div className="iMember--wrap --wrap">
        <SectionHeading en="Members" jp="プレイヤー" />
        {/* Marquee rather than a slide-and-pause carousel: stepping one card every
            two seconds stuttered at the loop seam, because the list is only twice
            slidesPerView long. loopAdditionalSlides keeps enough clones in the DOM
            for the track to stay full while it drifts. */}
        <Swiper
          className="iMember--list"
          modules={[Autoplay, FreeMode]}
          slidesPerView="auto"
          spaceBetween={30}
          loop
          loopAdditionalSlides={members.length}
          speed={7000}
          autoplay={{ delay: 0, disableOnInteraction: false, pauseOnMouseEnter: true }}
          freeMode={{ enabled: true, momentum: false }}
          allowTouchMove
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
