import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const source = fs.readFileSync("src/lib/react-source-codegen.ts", "utf8");
const transpiled = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  reportDiagnostics: true,
  fileName: "react-source-codegen.ts"
});
if ((transpiled.diagnostics || []).some(d => d.category === ts.DiagnosticCategory.Error)) {
  for (const d of transpiled.diagnostics || []) console.error(ts.flattenDiagnosticMessageText(d.messageText, "\n"));
  process.exit(1);
}
const temp = path.join(os.tmpdir(), `nila-codegen-${Date.now()}.mjs`);
fs.writeFileSync(temp, transpiled.outputText);
const { buildReactSourceTextFiles } = await import(pathToFileURL(temp).href);

const style = { background:"",color:"",width:"100%",maxWidth:"",height:"",minHeight:"",padding:"20px",margin:"",borderWidth:"0px",borderColor:"",borderStyle:"solid",borderRadius:"0px",boxShadow:"none",fontSize:"16px",fontWeight:"400",lineHeight:"1.5",letterSpacing:"0px",textAlign:"left",display:"flex",flexDirection:"column",justifyContent:"flex-start",alignItems:"stretch",gridColumns:"1fr",gap:"12px",opacity:1,overflow:"visible" };
const node = (id,name,content,sourceId) => ({ id,type:"section",name,content,style,animation:"fade-up",hoverAnimation:"lift",motionTrigger:"scroll",children:[{id:id+"-h",type:"heading",name:name+" heading",content,style:{...style,fontSize:"48px"},animation:"fade-up"}],meta:sourceId?{sourceId}:{} });
const project = {
  id:"fixture",name:"Real React Fixture",description:"Generated fixture",schemaVersion:10,createdAt:"",updatedAt:"",activePageId:"home",templateId:"blank",
  pages:[
    {id:"home",name:"Home",path:"/",showNavbar:true,showFooter:true,seo:{title:"Home",description:"Home page",image:"",canonical:"",noIndex:false,keywords:"",schemaType:"WebPage",answerSummary:"",entityName:"",author:"",dateModified:"",citations:""},nodes:[node("hero","Hero","Animated hero","prompt-hero")]},
    {id:"about",name:"About",path:"/about",showNavbar:true,showFooter:true,seo:{title:"About",description:"About page",image:"",canonical:"",noIndex:false,keywords:"",schemaType:"WebPage",answerSummary:"",entityName:"",author:"",dateModified:"",citations:""},nodes:[node("about-section","About Section","About us","")]}
  ],
  globalNavbar:{id:"nav",type:"navbar",name:"Navbar",style,children:[]},globalFooter:{id:"footer",type:"footer",name:"Footer",style,children:[]},assets:[],
  components:[{id:"component-1",name:"Feature Card",node:node("feature","Feature Card","Feature",""),createdAt:"",updatedAt:""}],
  importedBlocks:[{id:"prompt-hero",name:"Prompt Hero",group:"Hero",node:node("imported","Prompt Hero","Prompt source","prompt-hero"),createdAt:"",updatedAt:"",sourceKind:"prompt-code",source:"export default function Hero(){ return <section>Prompt source</section> }",dependencies:["motion/react"],detectedKind:"hero",artifactType:"section",animated:true,revision:1}],
  theme:{id:"theme",name:"Theme",colors:{background:"#fff",surface:"#fff",surfaceAlt:"#f8fafc",text:"#111",muted:"#64748b",primary:"#7c3aed",primaryText:"#fff",secondary:"#0ea5e9",border:"#e5e7eb",success:"#059669",warning:"#d97706",danger:"#dc2626"},typography:{body:"Inter",heading:"Inter"},radius:"18px",shadow:"none"},savedThemes:[],favoriteLibraryIds:[],
  designSystem:{breakpoints:{mobileMax:639,tabletMax:1023,previewDesktop:1440,previewTablet:768,previewMobile:390},containerMaxWidth:"1200px",contentPadding:{desktop:"32px",tablet:"24px",mobile:"16px"},spacing:{xs:"4px",sm:"8px",md:"16px",lg:"24px",xl:"40px",xxl:"64px"},typography:{xs:"12px",sm:"14px",base:"16px",lg:"18px",xl:"24px",xxl:"36px",display:"56px"},autoResponsive:true,reducedMotion:true},
  motionSystem:{enabled:true,defaultTrigger:"scroll",defaultDuration:.7,defaultEasing:"ease",scrollThreshold:.18,defaultStagger:.08,parallaxMax:.3,reducedMotion:"respect"},
  seo:{siteTitle:"Fixture",titleTemplate:"%s | Fixture",description:"Fixture",siteUrl:"https://example.com",language:"en",defaultImage:"",favicon:"",index:true,follow:true,generateSitemap:true,generateRobots:true,organizationName:"Fixture",organizationLogo:"",defaultAuthor:"",twitterSite:"",keyTopics:"",robotsMode:"auto",robotsContent:"",generateLlms:true,llmsMode:"auto",llmsContent:""},
  security:{enableHeaders:true,headersPreset:"balanced",contentSecurityPolicy:"",referrerPolicy:"strict-origin-when-cross-origin",frameOptions:"SAMEORIGIN",permissionsPolicy:"",strictTransportSecurity:"",crossOriginOpenerPolicy:"same-origin",generateSecurityTxt:false,securityContact:"",securityPolicyUrl:"",securityExpires:"",securityAcknowledgments:""}
};
const manifest = {generatedBy:"Nila Webs",schemaVersion:1,projectId:"fixture",usedSourceIds:["prompt-hero"],sourceDependencies:["motion/react"],runtimeDependencies:["react","react-dom","react-router-dom"],usedComponentIds:["component-1"],usedAssetIds:[]};
const files = buildReactSourceTextFiles(project, manifest, {builderVersion:"1.4.0",buildId:"fixture-build",projectId:"fixture",generatedAt:"2026-10-19T00:00:00.000Z"});
const checks = [
  ["App.tsx generated", !!files["src/App.tsx"]],
  ["multi-page modules", !!files["src/pages/HomePage.tsx"] && !!files["src/pages/AboutPage.tsx"]],
  ["sections in src", Object.keys(files).some(k=>k.startsWith("src/sections/home/"))],
  ["global React components", !!files["src/components/global/SiteNavbar.tsx"] && !!files["src/components/global/SiteFooter.tsx"]],
  ["saved component module", !!files["src/components/generated/FeatureCardComponent.tsx"]],
  ["prompt adapter module", !!files["src/imported/sections/PromptHeroImported.tsx"]],
  ["prompt source provenance", files["src/imported/sections/PromptHeroImported.tsx"]?.includes("originalSource")],
  ["theme source module", !!files["src/theme/siteTheme.ts"]],
  ["runtime animation renderer", files["src/runtime/NodeView.tsx"]?.includes("IntersectionObserver") && files["src/runtime/NodeView.tsx"]?.includes("animationDuration")],
  ["BrowserRouter route source", files["src/App.tsx"]?.includes("<Route") && files["src/App.tsx"]?.includes("/about")],
  ["no site.json runtime", !Object.keys(files).some(k=>k.endsWith("site.json")) && !source.includes("src/site.json")],
  ["visible watermark component", !!files["src/components/global/NilaWatermark.tsx"] && files["src/App.tsx"]?.includes("<NilaWatermark/>")],
  ["generated build metadata", files["src/site.config.ts"]?.includes("fixture-build") && files["src/components/global/NilaWatermark.tsx"]?.includes("fixture-build")]
];
let failed = 0;
for (const [name, ok] of checks) { console.log(`${ok?"✓":"✗"} ${name}`); if(!ok) failed++; }
for (const [file, content] of Object.entries(files)) {
  if (!/\.(ts|tsx)$/.test(file)) continue;
  const out = ts.transpileModule(content, { compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022,jsx:ts.JsxEmit.ReactJSX},reportDiagnostics:true,fileName:file });
  const errors=(out.diagnostics||[]).filter(d=>d.category===ts.DiagnosticCategory.Error);
  if(errors.length){failed++;console.error(`✗ syntax ${file}`);for(const d of errors)console.error(ts.flattenDiagnosticMessageText(d.messageText,"\n"));}
}
const exporter=fs.readFileSync("src/lib/exporter.ts","utf8");
const publisher=fs.readFileSync("src/lib/github-publisher.ts","utf8");
if(exporter.includes('zip.file("src/site.json"')){console.error("✗ exporter still writes site.json");failed++;} else console.log("✓ exporter writes source modules instead of site.json");
if(!publisher.includes("git/trees")||!publisher.includes("git/commits")||!publisher.includes("git/refs")){console.error("✗ GitHub publisher Git Data flow incomplete");failed++;} else console.log("✓ GitHub publisher creates blobs/tree/commit/ref");
fs.rmSync(temp,{force:true});
if(failed){console.error(`React export verification failed: ${failed} issue(s).`);process.exit(1);}console.log(`React export verification passed: ${checks.length}/${checks.length} architecture checks + generated TS/TSX syntax.`);
