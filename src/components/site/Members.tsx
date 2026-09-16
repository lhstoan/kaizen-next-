"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import SectionHeading from "@/components/site/SectionHeading";
import type { Member } from "@/types/home";

export default function Members({ members }: { members: Member[] }) {
  return (
    <section className="iMember --padding">
      <div className="iMember--wrap --wrap">
        <SectionHeading en="Players" jp="プレイヤー" />
        <Swiper
          className="iMember--list"
          modules={[Autoplay]}
          slidesPerView={4}
          spaceBetween={0}
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
              <div className="img">
                <Image src={member.photoUrl} alt={member.fullName} width={200} height={200} />
              </div>
              <div className="info">
                <div className="city">
                  <Image src={`/images/${member.nationality}.png`} alt={member.nationality} width={24} height={16} />
                </div>
                <div className="title">
                  <span className="name">{member.fullName}</span>
                  <span className="role">{member.event.join("/")}</span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
