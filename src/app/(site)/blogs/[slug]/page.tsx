import { notFound } from "next/navigation";
import Partners from "@/components/site/Partners";
import PostBody from "@/components/site/PostBody";
import { getPost } from "@/lib/posts";
import { getPartnerGroups } from "@/lib/partners";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  return { title: post ? `${post.title} | KAIZEN BADMINTON` : "BLOGS | KAIZEN BADMINTON" };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, { mainPartners, internationalPartners, otherPartners }] = await Promise.all([
    getPost(slug),
    getPartnerGroups(),
  ]);

  if (!post) notFound();

  // Body is stored as plain text; blank lines separate paragraphs, matching the
  // <p> stack the legacy blog-detail.html shipped.
  const paragraphs = post.body.split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <main>
      <div className="iBlog">
        <div className="iBlog--thumbnail">
          {post.coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverUrl} alt={post.title} />
          )}
        </div>
        <div className="iBlog--content">
          <h2>{post.title}</h2>
          {post.publishedAt && <p className="iBlog--date">{post.publishedAt}</p>}
          <PostBody body={post.body} />
        </div>
      </div>
      <Partners
        mainPartners={mainPartners}
        internationalPartners={internationalPartners}
        otherPartners={otherPartners}
      />
    </main>
  );
}
