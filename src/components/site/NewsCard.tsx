import Image from "next/image";
import Link from "next/link";
import type { NewsItem } from "@/types/home";

export default function NewsCard({ item }: { item: NewsItem }) {
  const content = (
    <>
      <div className="img">
        <Image src={item.imageUrl} alt={item.title || item.labelEn} width={520} height={320} />
      </div>
      <div className="content">
        <p className="label">
          <span className="en">{item.labelEn}</span>
          <span className="jp">{item.labelJp}</span>
        </p>
        {item.title && <p className="title">{item.title}</p>}
      </div>
    </>
  );

  return (
    <li className={`iNews--item${item.featured ? " --large" : ""}`}>
      {item.link ? <Link href={item.link}>{content}</Link> : content}
    </li>
  );
}
