import type { BuilderNode, LibraryItem } from "../types";
import { createNode } from "../lib/nodes";

const S = (style: Record<string, unknown>) => style as unknown as BuilderNode["style"];
const sourceMeta = (sourceId: string) => ({ sourceId, sourceType: "user-provided-shadcn-block", exportMode: "native-react-vite" });

const section = (name: string, sourceId: string, children: BuilderNode[], style: Record<string, unknown> = {}): BuilderNode => createNode("section", {
  name, meta: sourceMeta(sourceId), animation: "fade-in",
  style: S({ background: "#ffffff", color: "#0f172a", width: "100%", padding: "84px 48px", minHeight: "300px", display: "flex", flexDirection: "column", gap: "28px", ...style }),
  responsive: { mobile: { padding: "56px 20px", gap: "20px" } }, children
});
const container = (name: string, children: BuilderNode[], style: Record<string, unknown> = {}) => createNode("container", { name, children, style: S({ width: "100%", maxWidth: "1180px", margin: "0 auto", padding: "0px", borderWidth: "0px", borderStyle: "none", display: "flex", flexDirection: "column", gap: "20px", ...style }) });
const grid = (name: string, children: BuilderNode[], columns = "repeat(3,minmax(0,1fr))", style: Record<string, unknown> = {}) => createNode("container", { name, children, style: S({ width: "100%", maxWidth: "1180px", margin: "0 auto", padding: "0px", borderWidth: "0px", borderStyle: "none", display: "grid", gridColumns: columns, gap: "20px", ...style }), responsive: { tablet: { gridColumns: "repeat(2,minmax(0,1fr))" }, mobile: { gridColumns: "1fr" } } });
const h = (content: string, style: Record<string, unknown> = {}) => createNode("heading", { content, animation: "fade-up", style: S({ fontSize: "46px", fontWeight: "650", lineHeight: "1.08", letterSpacing: "-1.5px", ...style }), responsive: { mobile: { fontSize: "34px", letterSpacing: "-1px" } } });
const p = (content: string, style: Record<string, unknown> = {}) => createNode("text", { content, animation: "fade-up", style: S({ color: "#64748b", fontSize: "17px", ...style }) });
const badge = (content: string, style: Record<string, unknown> = {}) => createNode("text", { content, style: S({ width: "fit-content", padding: "6px 12px", borderWidth: "1px", borderColor: "#dbe2ea", borderRadius: "999px", color: "#334155", fontSize: "13px", fontWeight: "600", ...style }) });
const btn = (content: string, href = "#", style: Record<string, unknown> = {}) => createNode("button", { content, href, hoverAnimation: "lift", style: S({ background: "#111827", color: "#fff", padding: "12px 20px", borderRadius: "999px", fontWeight: "650", width: "fit-content", ...style }) });
const img = (src: string, alt: string, style: Record<string, unknown> = {}) => createNode("image", { src, alt, animation: "zoom-in", style: S({ width: "100%", height: "320px", borderRadius: "20px", ...style }) });
const card = (title: string, body: string, style: Record<string, unknown> = {}) => createNode("card", { animation: "fade-up", hoverAnimation: "lift", style: S({ background: "#fff", padding: "26px", borderRadius: "18px", borderWidth: "1px", borderColor: "#e5e7eb", display: "flex", flexDirection: "column", gap: "12px", ...style }), children: [createNode("icon", { content: "✦", style: S({ fontSize: "24px", color: "#7c3aed" }) }), createNode("heading", { content: title, style: S({ fontSize: "21px", fontWeight: "650", letterSpacing: "-.4px" }) }), p(body, { fontSize: "14px" })] });

const hero = (variant: number): BuilderNode => {
  const cfg = [
    ["hero-33", "Find a place that truly feels like home, where every moment matters", "Discover thoughtfully designed homes that blend modern comfort, timeless elegance, and vibrant communities.", "#090b11", "#8b5cf6"],
    ["hero-03", "SHADCN®SPACE", "We create high-performing digital designs that elevate brands and enhance conversions.", "#050505", "#2dd4bf"],
    ["hero-02", "Space Residence", "A refined real-estate hero with property details, tour CTA and calm visual motion.", "#0f766e", "#ffffff"],
    ["hero-01", "Build bold digital experiences", "A flexible animated agency hero ready for your brand, links, imagery and content.", "#fff7ed", "#ea580c"]
  ][variant - 1] as string[];
  const dark = variant < 4;
  return section(`Hero ${variant.toString().padStart(2, "0")}`, cfg[0], [
    container("Hero content", [
      badge(variant === 3 ? "Palm Springs, CA" : "Nila Webs block", { color: dark ? "#f8fafc" : "#9a3412", borderColor: dark ? "#ffffff44" : "#fed7aa" }),
      h(cfg[1], { color: dark ? "#fff" : "#111827", fontSize: variant === 2 ? "76px" : "60px", maxWidth: "900px" }),
      p(cfg[2], { color: dark ? "#d1d5db" : "#475569", maxWidth: "690px", fontSize: "19px" }),
      container("Hero actions", [btn(variant === 3 ? "Schedule a tour" : "Explore portfolio", "/contact", { background: cfg[4], color: variant === 3 ? "#0f172a" : "#fff" }), btn("Learn more", "/about", { background: "transparent", color: dark ? "#fff" : "#111827", borderWidth: "1px", borderColor: dark ? "#ffffff44" : "#11182733" })], { flexDirection: "row", gap: "12px", margin: "8px 0 0" })
    ], { gap: "20px" })
  ], { background: cfg[3], minHeight: "680px", justifyContent: "center" });
};

const pricing1 = () => section("Pricing 01", "pricing-02", [
  container("Pricing heading", [badge("Pricing"), h("Pick the plan that fits your start-up", { maxWidth: "620px" })], { alignItems: "center", textAlign: "center" }),
  grid("Pricing cards", [
    priceCard("Pro", "$2,500", ["Core Shadcn UI blocks", "Ready React code", "Regular updates", "Community support"]),
    priceCard("Pro Plus", "$3,800", ["Everything in Pro", "Premium templates", "Early access", "Priority support"], true),
    priceCard("Enterprise", "$5,000", ["Everything in Pro Plus", "Unlimited seats", "Integration support", "Custom requests"])
  ])
]);
const priceCard = (name: string, price: string, features: string[], featured = false) => createNode("card", { name: `Pricing — ${name}`, animation: "fade-up", hoverAnimation: "lift", style: S({ background: featured ? "#111827" : "#fff", color: featured ? "#fff" : "#111827", padding: "30px", borderRadius: "20px", borderWidth: "1px", borderColor: featured ? "#111827" : "#e5e7eb", display: "flex", flexDirection: "column", gap: "18px" }), children: [
  badge(featured ? `${name} • Recommended` : name, { color: featured ? "#fff" : "#334155", borderColor: featured ? "#ffffff44" : "#dbe2ea" }),
  h(price, { color: featured ? "#fff" : "#111827", fontSize: "42px" }),
  p("per month", { color: featured ? "#cbd5e1" : "#64748b", fontSize: "14px" }),
  ...features.map(f => p(`✓ ${f}`, { color: featured ? "#e2e8f0" : "#475569", fontSize: "14px" })),
  btn("Get started", "/contact", { background: featured ? "#fff" : "#111827", color: featured ? "#111827" : "#fff", width: "100%", textAlign: "center" })
] });

const pricing2 = () => section("Pricing 02", "pricing-01", [
  container("Pricing heading", [badge("Pricing"), h("Simple plans for fast-moving teams")], { alignItems: "center", textAlign: "center" }),
  grid("Pricing cards", [
    priceCard("Starter", "$2,500", ["Design updates", "SEO optimization", "Monthly analytics", "2 calls / month"]),
    priceCard("Pro", "$3,800", ["Developer updates", "Digital marketing", "Weekly analytics", "8 calls / month"], true)
  ], "repeat(2,minmax(0,1fr))", { maxWidth: "900px" })
]);

const portfolio1 = () => section("Portfolio 01", "portfolio-01", [
  container("Portfolio heading", [badge("Portfolio"), h("How we transformed ambitious ideas into polished products", { maxWidth: "760px" })], { alignItems: "center", textAlign: "center" }),
  grid("Portfolio grid", [
    portfolioCard("Flowbank", "UX Research · Interface Design", "https://images.shadcnspace.com/assets/portfolio/flowbank.webp"),
    portfolioCard("Academy.co", "Product Design · Interaction", "https://images.shadcnspace.com/assets/portfolio/academy.webp"),
    portfolioCard("Genome", "Brand Identity · UX Research", "https://images.shadcnspace.com/assets/portfolio/genome.webp"),
    portfolioCard("Hotto", "Visual Storytelling · Web & Mobile", "https://images.shadcnspace.com/assets/portfolio/hotto.webp")
  ], "repeat(2,minmax(0,1fr))")
]);
const portfolioCard = (title: string, tags: string, src: string) => createNode("card", { style: S({ padding: "0px", borderWidth: "0px", boxShadow: "none", display: "flex", flexDirection: "column", gap: "14px" }), children: [img(src, title, { height: "360px" }), createNode("heading", { content: title, style: S({ fontSize: "24px", fontWeight: "650" }) }), p(tags, { fontSize: "14px" })] });

const feature1 = () => section("Feature 28", "feature-28", [
  container("Feature heading", [badge("Why choose us"), h("Features to boost productivity"), p("Powerful tools built to simplify your workflow and help you get more done, faster and smarter.")], { alignItems: "center", textAlign: "center", maxWidth: "720px" }),
  grid("Feature grid", [
    card("Affordability", "High-quality design without traditional agency overhead."), card("Consistency", "Keep brand systems coherent across every page."), card("Scalability", "Grow from one page to complete multi-page products."), card("Speed", "Reusable blocks and live editing reduce build time.", { background: "#111827", color: "#fff" }), card("Flexibility", "Adapt layouts and sections without code lock-in."), card("Support", "Clear project files and exportable React source.")
  ], "repeat(3,minmax(0,1fr))")
], { background: "#f8fafc" });

const feature2 = () => section("Feature 24", "feature-24", [
  container("Feature heading", [badge("Capabilities"), h("Discover flexible visual-builder capabilities"), p("Drag blocks, edit styles, connect pages and export production-friendly React + Vite source.")], { alignItems: "center", textAlign: "center", maxWidth: "760px" }),
  grid("Capability rows", [
    createNode("card", { style: S({ padding: "10px", background: "#f1f5f9", borderWidth: "0px", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "18px" }), children: [img("https://images.shadcnspace.com/assets/feature/feature-14.jpg", "Workflow", { height: "260px" }), h("Automate complex workflows visually", { fontSize: "28px" }), p("Structure pages with reusable blocks and keep global navigation consistent.")] }),
    createNode("card", { style: S({ padding: "10px", background: "#f1f5f9", borderWidth: "0px", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "18px" }), children: [img("https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1000&q=80", "Design", { height: "260px" }), h("Design and preview across devices", { fontSize: "28px" }), p("Desktop, tablet and mobile overrides stay inside one editable node model.")] })
  ], "repeat(2,minmax(0,1fr))")
]);

const about1 = () => section("About 01", "about-01", [grid("About split", [
  container("About copy", [badge("About"), h("Design visually. Own the source."), p("Nila Webs keeps the editor easy to use while generating a real React + Vite project you can host anywhere."), btn("Our approach", "/about")], { justifyContent: "center" }),
  img("https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80", "Creative workspace", { height: "460px" })
], "repeat(2,minmax(0,1fr))")]);

const team1 = () => section("Team 01", "team-01", [container("Team heading", [badge("Team"), h("Meet the people behind the work")], { alignItems: "center", textAlign: "center" }), grid("Team grid", [
  person("Ava", "Product Designer"), person("Liam", "Frontend Engineer"), person("Maya", "Brand Strategist"), person("Noah", "Motion Designer")
], "repeat(4,minmax(0,1fr))")]);
const person = (name: string, role: string) => createNode("card", { style: S({ padding: "14px", borderRadius: "18px" }), children: [img(`https://i.pravatar.cc/600?u=${name}`, name, { height: "250px", borderRadius: "14px" }), createNode("heading", { content: name, style: S({ fontSize: "20px", fontWeight: "650" }) }), p(role, { fontSize: "14px" })] });

const testimonial1 = () => section("Testimonial 01", "testimonial-01", [container("Testimonials heading", [badge("Testimonials"), h("Loved by teams that move fast")], { alignItems: "center", textAlign: "center" }), grid("Testimonials", [
  quote("The builder makes layout work feel immediate and predictable.", "Anika · Founder"), quote("We went from idea to a deployable React project without losing control of the source.", "Rohan · Developer"), quote("Responsive editing and reusable sections save a surprising amount of time.", "Mira · Designer")
])]);
const quote = (text: string, author: string) => createNode("card", { children: [p(`“${text}”`, { color: "#111827", fontSize: "18px" }), p(author, { fontSize: "13px" })] });

const services = (variant: number) => section(`Services 0${variant}`, `services-0${variant}`, [container("Services heading", [badge("Services"), h(variant === 1 ? "Everything you need to launch a polished website" : "From idea to production-ready experience"), p("Combine sections, elements, responsive styles and animations in one visual workflow.")], { maxWidth: "760px" }), grid("Services grid", [card("Web design", "Compose pages from flexible, editable blocks."), card("Responsive systems", "Tune desktop, tablet and mobile styles independently."), card("Interactions", "Add entrance and hover motion without hand-writing CSS."), card("React export", "Download clean Vite source and host it anywhere."), card("Reusable globals", "Keep navigation and footer synchronized across pages."), card("Project portability", "Import and export editable project JSON.")], variant === 1 ? "repeat(3,minmax(0,1fr))" : "repeat(2,minmax(0,1fr))")], variant === 2 ? { background: "#0f172a", color: "#fff" } : {});

const cta = (variant: number) => section(`CTA 0${variant}`, `cta-0${variant}`, [container("CTA", [badge("Ready when you are", { color: variant === 2 ? "#fff" : "#334155", borderColor: variant === 2 ? "#ffffff44" : "#dbe2ea" }), h(variant === 1 ? "Turn your next idea into a real website" : "Build visually, export confidently", { color: variant === 2 ? "#fff" : "#111827", maxWidth: "780px" }), p("Start with a complete section or build from individual elements.", { color: variant === 2 ? "#cbd5e1" : "#64748b" }), btn("Start building", "/contact", { background: variant === 2 ? "#fff" : "#7c3aed", color: variant === 2 ? "#111827" : "#fff" })], { alignItems: "center", textAlign: "center", padding: "56px", borderRadius: "28px", background: variant === 2 ? "#111827" : "#f5f3ff" })], { padding: "70px 48px" });

const contact1 = () => section("Contact 01", "contact-01", [grid("Contact split", [container("Contact copy", [badge("Contact"), h("Tell us what you want to build"), p("Use this form as a visual starting point. Connect your own endpoint after export."), p("hello@example.com · +1 212 456 7890", { color: "#111827" })], { justifyContent: "center" }), createNode("form", { name: "Contact form", style: S({ background: "#f8fafc", padding: "30px", borderRadius: "20px", display: "flex", flexDirection: "column", gap: "14px" }), children: [createNode("label", { content: "Name" }), createNode("input", { placeholder: "Your name" }), createNode("label", { content: "Email" }), createNode("input", { placeholder: "you@example.com" }), createNode("label", { content: "Message" }), createNode("textarea", { placeholder: "Tell us about the project" }), btn("Send message", "#") ] })], "repeat(2,minmax(0,1fr))")]);

const faq1 = () => section("FAQ 01", "faq-01", [container("FAQ heading", [badge("FAQ"), h("Questions, answered")], { alignItems: "center", textAlign: "center" }), container("FAQ list", [faq("Does the export need Nila Webs to run?", "No. Exported websites are standalone React + Vite projects."), faq("Can I create multiple pages?", "Yes. Each page has its own path and can inherit the global navbar and footer."), faq("Can I customize sections after dropping them?", "Yes. Sections are normal editable node trees, not static screenshots."), faq("Can I host the result anywhere?", "Yes. Build the exported project and deploy its dist folder to a static host.")], { maxWidth: "820px" })]);
const faq = (q: string, a: string) => createNode("card", { style: S({ padding: "20px 22px", boxShadow: "none" }), children: [createNode("heading", { content: q, style: S({ fontSize: "18px", fontWeight: "650" }) }), p(a, { fontSize: "15px" })] });

const blog = (variant: number) => section(`Blog 0${variant}`, `blog-0${variant}`, [container("Blog heading", [badge("Journal"), h(variant === 1 ? "Ideas for better digital products" : "Latest notes from the studio")]), grid("Blog cards", [blogCard("Design systems that stay editable"), blogCard("Responsive layout without guesswork"), blogCard("From visual prototype to React source")], variant === 2 ? "repeat(3,minmax(0,1fr))" : "repeat(3,minmax(0,1fr))")]);
const blogCard = (title: string) => createNode("card", { children: [img(`https://picsum.photos/900/600?random=${encodeURIComponent(title)}`, title, { height: "220px" }), p("Design · 6 min read", { fontSize: "12px" }), createNode("heading", { content: title, style: S({ fontSize: "22px", fontWeight: "650" }) }), btn("Read article", "#", { background: "transparent", color: "#111827", padding: "4px 0" })] });

const newsletter1 = () => section("Newsletter 01", "newsletter-01", [container("Newsletter", [badge("Newsletter"), h("Useful product notes, occasionally"), p("Get concise design and development ideas in your inbox."), container("Subscribe row", [createNode("input", { placeholder: "you@example.com", style: S({ maxWidth: "380px" }) }), btn("Subscribe", "#")], { flexDirection: "row", justifyContent: "center", maxWidth: "560px" })], { alignItems: "center", textAlign: "center", background: "#f8fafc", padding: "54px", borderRadius: "26px" })]);

const logoCloud1 = () => section("Logo Cloud 01", "logo-cloud-01", [container("Logo heading", [p("Trusted by teams building the next thing", { textAlign: "center" })]), grid("Logo cloud", ["ACME", "ORBIT", "NORTH", "PIXEL", "NOVA", "FRAME"].map(name => createNode("card", { style: S({ minHeight: "90px", display: "flex", justifyContent: "center", alignItems: "center", padding: "16px", boxShadow: "none" }), children: [createNode("heading", { content: name, style: S({ fontSize: "18px", fontWeight: "800", color: "#64748b", textAlign: "center" }) })] })), "repeat(6,minmax(0,1fr))")], { padding: "54px 48px" });

const gallery1 = () => section("Gallery 01", "gallery-01", [container("Gallery heading", [badge("Gallery"), h("Selected visual moments")]), grid("Gallery", [1,2,3,4,5,6].map(i => img(`https://picsum.photos/900/700?random=gallery${i}`, `Gallery ${i}`, { height: i % 3 === 0 ? "360px" : "280px" })), "repeat(3,minmax(0,1fr))")]);

const bento = (variant: number) => section(`Bento Grid 0${variant}`, `bento-grid-0${variant}`, [container("Bento heading", [badge("Highlights"), h("A flexible grid for product stories")]), grid("Bento", [card("Fast editing", "Select any nested element and change it instantly.", { minHeight: "220px", background: "#f5f3ff" }), card("Live preview", "Test interactions without leaving the editor.", { minHeight: "220px" }), card("Real source", "Export a normal React + Vite project.", { minHeight: "220px", background: "#ecfeff" }), card("Reusable blocks", "Store sections as composable editable node trees.", { minHeight: "220px" })], "repeat(2,minmax(0,1fr))")]);

const authBlock = (kind: "login" | "register" | "mfa" | "verify") => {
  const names = { login: "Welcome back", register: "Create your account", mfa: "Verify your sign-in", verify: "Check your email" };
  const children: BuilderNode[] = [h(names[kind], { fontSize: "34px", textAlign: "center" }), p(kind === "verify" ? "We sent a verification link to your email address." : "Secure authentication layout ready to connect to your backend.", { textAlign: "center" })];
  if (kind !== "verify") children.push(createNode("input", { placeholder: kind === "mfa" ? "6-digit code" : "Email address" }));
  if (kind === "register") children.push(createNode("input", { placeholder: "Password" }));
  children.push(btn(kind === "verify" ? "Resend email" : kind === "mfa" ? "Verify" : kind === "register" ? "Create account" : "Sign in", "#", { width: "100%" }));
  return section(`Auth — ${kind}`, `${kind}-01`, [container("Auth card", children, { maxWidth: "440px", background: "#fff", padding: "34px", borderRadius: "22px", borderWidth: "1px", borderColor: "#e5e7eb", boxShadow: "0 20px 60px rgba(15,23,42,.08)" })], { background: "#f8fafc", minHeight: "640px", justifyContent: "center", alignItems: "center" });
};

const timeline = (variant: number) => section(`Timeline 0${variant}`, `timeline-0${variant}`, [container("Timeline heading", [badge("Timeline"), h("A clear path from idea to launch")]), container("Timeline items", [
  timelineItem("01", "Plan", "Define pages, navigation and reusable global elements."), timelineItem("02", "Compose", "Drag sections and elements into the canvas."), timelineItem("03", "Refine", "Tune responsive properties and motion."), timelineItem("04", "Export", "Generate the React + Vite project and deploy it.")
], { maxWidth: "860px" })]);
const timelineItem = (number: string, title: string, body: string) => createNode("card", { style: S({ flexDirection: "row", display: "flex", alignItems: "flex-start", gap: "20px", padding: "22px", boxShadow: "none" }), children: [badge(number, { background: "#111827", color: "#fff", borderColor: "#111827" }), container(title, [createNode("heading", { content: title, style: S({ fontSize: "20px", fontWeight: "650" }) }), p(body, { fontSize: "14px" })], { gap: "6px" })] });

const cookie1 = () => section("Cookie Consent 01", "cookie-consent-01", [container("Cookie card", [h("We use cookies", { fontSize: "24px" }), p("Use this reusable consent block as a starting point and connect your preference logic after export.", { fontSize: "14px" }), container("Cookie actions", [btn("Accept all", "#"), btn("Preferences", "#", { background: "#f1f5f9", color: "#111827" })], { flexDirection: "row" })], { maxWidth: "520px", background: "#fff", padding: "24px", borderRadius: "18px", borderWidth: "1px", borderColor: "#e5e7eb", boxShadow: "0 18px 50px rgba(15,23,42,.12)" })], { background: "#f8fafc", alignItems: "center", minHeight: "360px" });

const navbar = (): BuilderNode => createNode("navbar", {
  name: "Global Navbar", meta: sourceMeta("navbar-global"), style: S({ background: "#ffffffee", color: "#111827", padding: "14px 28px", width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: "16px", borderWidth: "0px", borderBottomWidth: "1px", borderStyle: "solid", borderColor: "#e5e7eb" }),
  children: [createNode("heading", { content: "Nila Webs", style: S({ fontSize: "21px", fontWeight: "800" }) }), container("Nav links", [btn("Home", "/", { background: "transparent", color: "#111827", padding: "8px" }), btn("About", "/about", { background: "transparent", color: "#111827", padding: "8px" }), btn("Contact", "/contact", { background: "#111827", color: "#fff" })], { width: "auto", flexDirection: "row", gap: "8px" })]
});

const footer = (): BuilderNode => createNode("footer", {
  name: "Global Footer", meta: sourceMeta("footer-global"), style: S({ background: "#0b1020", color: "#ffffff", padding: "54px 34px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }),
  children: [createNode("heading", { content: "Nila Webs", style: S({ color: "#ffffff", fontSize: "24px", fontWeight: "800" }) }), p("Built visually. Exported as real React + Vite source code.", { color: "#aab2c3", textAlign: "center" })]
});

export const createDefaultNavbar = navbar;
export const createDefaultFooter = footer;

const elementDefs: Array<[string, string, string]> = [
  ["heading", "Heading", "Typography"], ["text", "Text", "Typography"], ["button", "Button", "Actions"], ["image", "Image", "Media"], ["video", "Video", "Media"], ["icon", "Icon", "Media"],
  ["input", "Input", "Forms"], ["textarea", "Textarea", "Forms"], ["select", "Select", "Forms"], ["label", "Label", "Forms"], ["form", "Form", "Forms"],
  ["card", "Card", "Layout"], ["container", "Container", "Layout"], ["section", "Blank Section", "Layout"], ["spacer", "Spacer", "Layout"], ["divider", "Divider", "Layout"]
];
export const elementLibrary: LibraryItem[] = elementDefs.map(([id, name, group]) => ({ id, name, group, category: "elements", create: () => createNode(id as Parameters<typeof createNode>[0]) }));

export const sectionLibrary: LibraryItem[] = [
  { id: "navbar-global", name: "Navbar — Global", group: "Navigation", category: "sections", description: "Applied automatically to every page", sourceId: "navbar-01", create: navbar },
  { id: "hero-33", name: "Hero 01 — Video style", group: "Hero", category: "sections", description: "Editable adaptation of Hero 33", sourceId: "hero-33", create: () => hero(1) },
  { id: "hero-03", name: "Hero 02 — Agency", group: "Hero", category: "sections", description: "Editable adaptation of Hero 03", sourceId: "hero-03", create: () => hero(2) },
  { id: "hero-02", name: "Hero 03 — Residence", group: "Hero", category: "sections", description: "Editable adaptation of Hero 02", sourceId: "hero-02", create: () => hero(3) },
  { id: "hero-01", name: "Hero 04 — Creative", group: "Hero", category: "sections", description: "Editable adaptation of pasted hero block", sourceId: "hero-01", create: () => hero(4) },
  { id: "pricing-02", name: "Pricing 01", group: "Pricing", category: "sections", description: "Three animated plan cards", sourceId: "pricing-02", create: pricing1 },
  { id: "pricing-01", name: "Pricing 02", group: "Pricing", category: "sections", description: "Two-plan collaboration layout", sourceId: "pricing-01", create: pricing2 },
  { id: "portfolio-01", name: "Portfolio 01", group: "Portfolio", category: "sections", description: "Responsive project grid", sourceId: "portfolio-01", create: portfolio1 },
  { id: "feature-28", name: "Feature 01", group: "Features", category: "sections", description: "Productivity card grid", sourceId: "feature-28", create: feature1 },
  { id: "feature-24", name: "Feature 02", group: "Features", category: "sections", description: "Large media capability rows", sourceId: "feature-24", create: feature2 },
  { id: "about-01", name: "About 01", group: "Content", category: "sections", description: "Split about layout", sourceId: "about-01", create: about1 },
  { id: "team-01", name: "Team 01", group: "Content", category: "sections", description: "Four-person team grid", sourceId: "team-01", create: team1 },
  { id: "testimonial-01", name: "Testimonial 01", group: "Social proof", category: "sections", description: "Three testimonial cards", sourceId: "testimonial-01", create: testimonial1 },
  { id: "services-01", name: "Services 01", group: "Services", category: "sections", description: "Six service cards", sourceId: "services-01", create: () => services(1) },
  { id: "services-02", name: "Services 02", group: "Services", category: "sections", description: "Dark service section", sourceId: "services-02", create: () => services(2) },
  { id: "cta-01", name: "CTA 01", group: "CTA", category: "sections", description: "Centered soft CTA", sourceId: "cta-01", create: () => cta(1) },
  { id: "cta-02", name: "CTA 02", group: "CTA", category: "sections", description: "Dark CTA", sourceId: "cta-02", create: () => cta(2) },
  { id: "contact-01", name: "Contact 01", group: "Forms", category: "sections", description: "Contact copy + form", sourceId: "contact-01", create: contact1 },
  { id: "faq-01", name: "FAQ 01", group: "Content", category: "sections", description: "Editable FAQ cards", sourceId: "faq-01", create: faq1 },
  { id: "blog-01", name: "Blog 01", group: "Blog", category: "sections", description: "Article cards", sourceId: "blog-01", create: () => blog(1) },
  { id: "blog-02", name: "Blog 02", group: "Blog", category: "sections", description: "Alternative article grid", sourceId: "blog-02", create: () => blog(2) },
  { id: "newsletter-01", name: "Newsletter 01", group: "Forms", category: "sections", description: "Inline subscription form", sourceId: "newsletter-01", create: newsletter1 },
  { id: "logo-cloud-01", name: "Logo Cloud 01", group: "Social proof", category: "sections", description: "Responsive logo row", sourceId: "logo-cloud-01", create: logoCloud1 },
  { id: "gallery-01", name: "Gallery 01", group: "Media", category: "sections", description: "Responsive image gallery", sourceId: "gallery-01", create: gallery1 },
  { id: "bento-01", name: "Bento Grid 01", group: "Features", category: "sections", description: "Product bento grid", sourceId: "bento-grid-01", create: () => bento(1) },
  { id: "bento-02", name: "Bento Grid 02", group: "Features", category: "sections", description: "Alternative bento grid", sourceId: "bento-grid-02", create: () => bento(2) },
  { id: "login-01", name: "Login 01", group: "Auth", category: "sections", description: "Login card", sourceId: "login-01", create: () => authBlock("login") },
  { id: "register-01", name: "Register 01", group: "Auth", category: "sections", description: "Registration card", sourceId: "register-01", create: () => authBlock("register") },
  { id: "mfa-01", name: "MFA 01", group: "Auth", category: "sections", description: "Multi-factor verification", sourceId: "mfa-01", create: () => authBlock("mfa") },
  { id: "verify-email-01", name: "Verify Email 01", group: "Auth", category: "sections", description: "Email verification state", sourceId: "verify-email-01", create: () => authBlock("verify") },
  { id: "timeline-01", name: "Timeline 01", group: "Timeline", category: "sections", description: "Four-step timeline", sourceId: "timeline-01", create: () => timeline(1) },
  { id: "timeline-02", name: "Timeline 02", group: "Timeline", category: "sections", description: "Alternative timeline", sourceId: "timeline-02", create: () => timeline(2) },
  { id: "timeline-03", name: "Timeline 03", group: "Timeline", category: "sections", description: "Alternative timeline", sourceId: "timeline-03", create: () => timeline(3) },
  { id: "cookie-consent-01", name: "Cookie Consent 01", group: "Utility", category: "sections", description: "Cookie consent card", sourceId: "cookie-consent-01", create: cookie1 },
  { id: "footer-global", name: "Footer — Global", group: "Navigation", category: "sections", description: "Applied automatically to every page", sourceId: "footer-01", create: footer }
];

const typefolioTemplate = () => [hero(4), about1(), portfolio1(), testimonial1(), cta(1)];
const resumeTemplate = () => [hero(1), about1(), timeline(1), portfolio1(), contact1()];
const crypgoTemplate = () => [hero(2), feature1(), bento(1), pricing1(), faq1(), cta(2)];

export const siteTemplateLibrary: LibraryItem[] = [
  { id: "typefolio-starter", name: "Typefolio Starter", group: "Portfolio", category: "templates", description: "Portfolio starter adapted from the MIT-licensed uploaded Typefolio template.", createPageNodes: typefolioTemplate },
  { id: "resume-starter", name: "Resume Starter", group: "Portfolio", category: "templates", description: "Resume/portfolio starter adapted from the MIT-licensed uploaded Resume template.", createPageNodes: resumeTemplate },
  { id: "crypgo-starter", name: "Crypgo Starter", group: "Landing", category: "templates", description: "Crypto landing-page starter adapted for the visual builder.", createPageNodes: crypgoTemplate }
];
