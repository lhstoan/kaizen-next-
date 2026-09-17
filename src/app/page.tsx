import MainVisual from "@/components/site/MainVisual";
import Members from "@/components/site/Members";
import Partners from "@/components/site/Partners";
import { placeholderMembers, placeholderPartners } from "@/lib/placeholder-data";

export default function Home() {
  return (
    <main>
      <MainVisual />
      <Members members={placeholderMembers} />
      <Partners mainPartners={placeholderPartners} internationalPartners={[]} otherPartners={[]} />
    </main>
  );
}
