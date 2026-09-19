import Image from "next/image";
import Link from "next/link";
import type { Post } from "@/types/home";

// Same card shape as the hot news block, so /blogs reuses .iNews--item styling.
export default function PostCard({ post }: { post: Post }) {
  return (
    <li className="iNews--item">
      <Link href={`/blogs/${post.slug}`}>
        <div className="img">
          {post.coverUrl && <Image src={post.coverUrl} alt={post.title} width={520} height={320} />}
        </div>
        <div className="content">
          <p className="label">
            <span className="en">{post.title}</span>
            {post.publishedAt && <span className="jp">{post.publishedAt}</span>}
          </p>
          {post.excerpt && <p className="title">{post.excerpt}</p>}
        </div>
      </Link>
    </li>
  );
}
