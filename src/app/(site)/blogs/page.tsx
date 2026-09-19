import MainVisual from "@/components/site/MainVisual";
import Partners from "@/components/site/Partners";
import SectionHeading from "@/components/site/SectionHeading";
import PostCard from "@/components/site/PostCard";
import { getPosts } from "@/lib/posts";
import { getPartnerGroups } from "@/lib/partners";

export const metadata = {
  title: "BLOGS | KAIZEN BADMINTON",
};

export default async function BlogsPage() {
  const [posts, { mainPartners, internationalPartners, otherPartners }] = await Promise.all([
    getPosts(),
    getPartnerGroups(),
  ]);

  return (
    <main>
      <MainVisual />
      <section className="iNews">
        <div className="iNews--wrap">
          <SectionHeading en="Blogs" jp="ブログ" />
          <ul className="iNews--list">
            {posts.map((post) => (
              <PostCard post={post} key={post.id} />
            ))}
          </ul>
        </div>
      </section>
      <Partners
        mainPartners={mainPartners}
        internationalPartners={internationalPartners}
        otherPartners={otherPartners}
      />
    </main>
  );
}
