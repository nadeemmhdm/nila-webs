import type { BuilderNode, BuilderPage, ProjectTheme, SiteTemplateDefinition, SiteTemplatePayload } from "../types";
import { uid } from "../lib/nodes";
import { createDefaultFooter, createDefaultNavbar, sectionLibrary } from "./library";
import { defaultTheme, themePresets } from "./themes";

function section(id: string): BuilderNode {
  const item = sectionLibrary.find(entry => entry.id === id);
  if (!item?.create) throw new Error(`Missing section factory: ${id}`);
  return item.create();
}
function page(name: string, path: string, sectionIds: string[], showNavbar = true, showFooter = true): BuilderPage {
  return { id: uid("page"), name, path, nodes: sectionIds.map(section), showNavbar, showFooter };
}
function theme(id: string): ProjectTheme { return structuredClone(themePresets.find(item => item.id === id) || defaultTheme); }
function payload(pages: BuilderPage[], themeId: string): SiteTemplatePayload {
  return { pages, globalNavbar: createDefaultNavbar(), globalFooter: createDefaultFooter(), theme: theme(themeId) };
}

export const siteTemplateRegistry: SiteTemplateDefinition[] = [
  {
    id: "typefolio-multipage", name: "Typefolio Portfolio", group: "Portfolio", pageCount: 4,
    description: "Four-page creative portfolio with work, about and contact pages.",
    thumbnail: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=900&q=80",
    tags: ["portfolio","creative","agency","multi-page"],
    build: () => payload([
      page("Home","/",["hero-01","portfolio-01","testimonial-01","cta-01"]),
      page("Work","/work",["portfolio-01","services-01","cta-02"]),
      page("About","/about",["about-01","team-01","timeline-01"]),
      page("Contact","/contact",["contact-01","faq-01"])
    ],"mono-pro")
  },
  {
    id: "resume-multipage", name: "Resume Pro", group: "Portfolio", pageCount: 4,
    description: "Professional resume and personal site with experience, projects and contact.",
    thumbnail: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
    tags: ["resume","personal","career","multi-page"],
    build: () => payload([
      page("Home","/",["hero-33","about-01","logo-cloud-01","cta-01"]),
      page("Experience","/experience",["timeline-01","services-01"]),
      page("Projects","/projects",["portfolio-01","testimonial-01"]),
      page("Contact","/contact",["contact-01"])
    ],"nila-light")
  },
  {
    id: "crypgo-multipage", name: "Crypgo Launch", group: "Landing", pageCount: 3,
    description: "Dark product/crypto launch site with features, pricing and FAQ pages.",
    thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=900&q=80",
    tags: ["crypto","product","dark","launch"],
    build: () => payload([
      page("Home","/",["hero-03","feature-28","bento-01","logo-cloud-01","cta-02"]),
      page("Pricing","/pricing",["pricing-02","testimonial-01","cta-02"]),
      page("FAQ","/faq",["faq-01","newsletter-01"])
    ],"midnight-neon")
  },
  {
    id: "agency-multipage", name: "Creative Agency", group: "Business", pageCount: 4,
    description: "Agency website with services, work, team and lead-generation contact flow.",
    thumbnail: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
    tags: ["agency","business","services","portfolio"],
    build: () => payload([
      page("Home","/",["hero-01","services-02","portfolio-01","testimonial-01","cta-01"]),
      page("Services","/services",["services-01","feature-24","pricing-01","faq-01"]),
      page("Studio","/studio",["about-01","team-01","gallery-01"]),
      page("Contact","/contact",["contact-01","newsletter-01"])
    ],"coral-studio")
  },
  {
    id: "saas-multipage", name: "SaaS Product", group: "Product", pageCount: 4,
    description: "Modern SaaS site with feature, pricing, resources and contact pages.",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80",
    tags: ["saas","startup","product","pricing"],
    build: () => payload([
      page("Home","/",["hero-03","feature-28","bento-02","logo-cloud-01","testimonial-01","cta-01"]),
      page("Features","/features",["feature-24","services-01","faq-01"]),
      page("Pricing","/pricing",["pricing-02","faq-01","cta-02"]),
      page("Contact","/contact",["contact-01","newsletter-01"])
    ],"ocean-blue")
  }
];

export function buildSiteTemplate(id: string): SiteTemplatePayload | undefined {
  const template = siteTemplateRegistry.find(item => item.id === id);
  return template ? template.build() : undefined;
}
