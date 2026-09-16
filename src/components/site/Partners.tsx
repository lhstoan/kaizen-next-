import Image from "next/image";
import SectionHeading from "@/components/site/SectionHeading";
import type { Partner } from "@/types/home";

function PartnerGroup({ title, partners, main }: { title: string; partners: Partner[]; main?: boolean }) {
  if (partners.length === 0) return null;
  return (
    <>
      <p className="iPartner--title">{title}</p>
      <ul className={`iPartner--list${main ? " --main" : ""}`}>
        {partners.map((partner) => (
          <li key={partner.id}>
            <div className="img">
              <Image src={partner.logoUrl} alt={partner.name} width={160} height={80} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function Partners({
  mainPartners,
  internationalPartners,
  otherPartners,
}: {
  mainPartners: Partner[];
  internationalPartners: Partner[];
  otherPartners: Partner[];
}) {
  return (
    <section className="iPartner --padding">
      <div className="iPartner--wrap --wrap">
        <SectionHeading en="Partners" jp="協力企業" />
        <div className="iPartner--group">
          <div className="iPartner--group-item">
            <PartnerGroup title="Official Court Sponsors" partners={mainPartners} main />
          </div>
          <div className="iPartner--group-item">
            <PartnerGroup title="International Partners" partners={internationalPartners} main />
          </div>
        </div>
        <PartnerGroup title="Official Partners" partners={otherPartners} />
      </div>
    </section>
  );
}
