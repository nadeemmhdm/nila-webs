import type { BuilderNode, InputKind, LibraryItem, NodeStyle, NodeType } from "../types";
import { createNode, defaultStyle, uid } from "../lib/nodes";

type NodeExtra = Omit<Partial<BuilderNode>, "style"> & { style?: Partial<NodeStyle> };

const node = (type: NodeType, name: string, extra: NodeExtra = {}): BuilderNode => ({
  id: uid(type), type, name, animation: "none", hoverAnimation: "none", animationDuration: .7, animationDelay: 0,
  responsive: {}, hiddenOn: {}, ...extra, style: { ...defaultStyle(), ...(extra.style || {}) }
});

export function createPhase3Element(type: NodeType): BuilderNode {
  switch (type) {
    case "link": return node(type,"Text Link",{content:"Learn more",href:"#",target:"_self",hoverAnimation:"lift",style:{width:"fit-content",color:"#6d28d9",fontWeight:"600"}});
    case "badge": return node(type,"Badge",{content:"New",style:{width:"fit-content",padding:"6px 11px",background:"#ede9fe",color:"#6d28d9",borderRadius:"999px",fontSize:"13px",fontWeight:"700"}});
    case "list": return node(type,"List",{options:["First item","Second item","Third item"],ordered:false,style:{width:"100%",padding:"0 0 0 22px",display:"flex",flexDirection:"column",gap:"8px"}});
    case "checkbox": return node(type,"Checkbox",{content:"I agree to the terms",checked:false,value:"yes",nameAttr:"agreement",required:false,style:{width:"fit-content",display:"flex",flexDirection:"row",alignItems:"center",gap:"9px"}});
    case "radio": return node(type,"Radio Group",{content:"Choose an option",options:["Option one","Option two","Option three"],value:"Option one",nameAttr:"choice",required:false,style:{width:"100%",display:"flex",flexDirection:"column",gap:"8px"}});
    case "switch": return node(type,"Switch",{content:"Enable notifications",checked:true,ariaLabel:"Enable notifications",style:{width:"fit-content",display:"flex",flexDirection:"row",alignItems:"center",gap:"10px"}});
    case "range": return node(type,"Range",{content:"Range",value:"50",min:0,max:100,step:1,nameAttr:"range",style:{width:"100%"}});
    case "file": return node(type,"File Input",{content:"Upload file",nameAttr:"file",accept:"image/*,.pdf",required:false,style:{width:"100%",padding:"10px",borderWidth:"1px",borderColor:"#d1d5db",borderRadius:"10px"}});
    case "embed": return node(type,"Embed",{src:"https://www.youtube.com/embed/dQw4w9WgXcQ",alt:"Embedded content",style:{width:"100%",height:"420px",borderWidth:"0px",borderRadius:"16px",overflow:"hidden"}});
    case "map": return node(type,"Map",{src:"https://www.openstreetmap.org/export/embed.html?bbox=76.70%2C9.85%2C76.78%2C9.93&layer=mapnik",alt:"Map",style:{width:"100%",height:"360px",borderWidth:"0px",borderRadius:"16px",overflow:"hidden"}});
    case "table": return node(type,"Table",{table:{caption:"Team members",headers:["Name","Role","Status"],rows:[["Ava","Designer","Active"],["Liam","Developer","Active"]]},style:{width:"100%",overflow:"auto"}});
    case "tabs": return node(type,"Tabs",{defaultIndex:0,items:[{title:"Overview",body:"Add your overview content here."},{title:"Details",body:"Add supporting details here."},{title:"Notes",body:"Add notes here."}],style:{width:"100%",padding:"8px",borderWidth:"1px",borderColor:"#e5e7eb",borderRadius:"14px"}});
    case "accordion": return node(type,"Accordion",{defaultIndex:0,items:[{title:"What is Nila Webs?",body:"A visual React + Vite website builder."},{title:"Can I export the code?",body:"Yes. Export produces a standalone project."}],style:{width:"100%",borderWidth:"1px",borderColor:"#e5e7eb",borderRadius:"14px",overflow:"hidden"}});
    case "modal": return node(type,"Modal",{content:"Open modal",closeOnBackdrop:true,ariaLabel:"Open dialog",children:[createNode("heading",{content:"Modal title",style:{...defaultStyle(),fontSize:"28px",fontWeight:"700"}}),createNode("text",{content:"Drop more elements here or customize this modal content."})],style:{width:"fit-content"}});
    case "carousel": return node(type,"Carousel",{autoplay:false,interval:4500,showDots:true,slides:[{src:"https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",alt:"Workspace",caption:"Workspace"},{src:"https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",alt:"Studio",caption:"Studio"},{src:"https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",alt:"Office",caption:"Office"}],style:{width:"100%",height:"420px",borderRadius:"18px",overflow:"hidden"}});
    case "socials": return node(type,"Social Links",{links:[{label:"Instagram",href:"https://instagram.com"},{label:"GitHub",href:"https://github.com"},{label:"LinkedIn",href:"https://linkedin.com"}],style:{width:"fit-content",display:"flex",flexDirection:"row",gap:"10px"}});
    case "symbol": return node(type,"Component Group",{componentName:"My Component",children:[createNode("heading",{content:"Reusable component",style:{...defaultStyle(),fontSize:"26px",fontWeight:"700"}}),createNode("text",{content:"Save this group as a linked project component from Properties."})],style:{width:"100%",padding:"24px",borderWidth:"1px",borderStyle:"dashed",borderColor:"#a78bfa",borderRadius:"16px",display:"flex",flexDirection:"column",gap:"10px"}});
    case "html": return node(type,"Custom HTML",{content:"<div><strong>Custom HTML</strong><p>Edit this markup in Properties.</p></div>",style:{width:"100%"}});
    case "code": return node(type,"Code Block",{content:"const hello = 'Nila Webs';\nconsole.log(hello);",style:{width:"100%",padding:"18px",background:"#0f172a",color:"#e2e8f0",borderRadius:"12px",fontSize:"14px",overflow:"auto"}});
    case "alert": return node(type,"Alert",{content:"This is an important message.",roleAttr:"status",meta:{variant:"info"},style:{width:"100%",padding:"14px 16px",background:"#eff6ff",color:"#1e3a8a",borderWidth:"1px",borderColor:"#bfdbfe",borderRadius:"12px"}});
    case "avatar": return node(type,"Avatar",{src:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",alt:"Profile avatar",content:"A",style:{width:"64px",height:"64px",borderRadius:"999px",overflow:"hidden",background:"#e2e8f0"}});
    case "progress": return node(type,"Progress",{content:"Progress",value:"65",min:0,max:100,ariaLabel:"Progress",style:{width:"100%"}});
    case "breadcrumb": return node(type,"Breadcrumb",{links:[{label:"Home",href:"/"},{label:"Products",href:"/products"},{label:"Current",href:"#"}],ariaLabel:"Breadcrumb",style:{width:"100%",display:"flex",flexDirection:"row",gap:"8px"}});
    case "rating": return node(type,"Rating",{content:"Rating",value:"4",max:5,ariaLabel:"4 out of 5 stars",style:{width:"fit-content",fontSize:"24px",color:"#f59e0b"}});
    default: return createNode("container");
  }
}

function inputVariant(id:string,name:string,inputType:InputKind,placeholder:string):LibraryItem {
  return { id, name, group:"Forms", description:`${name} with validation semantics`, category:"elements", create:()=>createNode("input",{name,inputType,placeholder,nameAttr:id.replace("phase3-","").replace(/-input$/,"") ,style:{...defaultStyle(),width:"100%",padding:"12px 14px",borderWidth:"1px",borderColor:"#d1d5db",borderRadius:"10px"}}) };
}

const defs: Array<[NodeType,string,string,string]> = [
  ["link","Text Link","Typography","Editable internal or external link"],["badge","Badge","Typography","Compact status or category badge"],["list","List","Typography","Ordered or unordered editable list"],["code","Code Block","Typography","Display source code or snippets"],
  ["socials","Social Links","Actions","Multiple external social links"],["breadcrumb","Breadcrumb","Navigation","Editable navigation trail"],
  ["carousel","Carousel","Media","Stateful image carousel with uploaded asset support"],["embed","Embed / iFrame","Media","Embed videos or compatible external content"],["map","Map Embed","Media","OpenStreetMap or compatible map iframe"],["avatar","Avatar","Media","Image avatar with accessible fallback"],
  ["checkbox","Checkbox","Forms","Checkbox with editable label/name/value"],["radio","Radio Group","Forms","Editable radio options"],["switch","Switch","Forms","Interactive accessible toggle switch"],["range","Range","Forms","Min/max/step range input"],["file","File Input","Forms","Accept/multiple/required file field"],
  ["table","Table","Data","Editable caption, headers and rows"],["progress","Progress","Data","Accessible progress indicator"],["rating","Rating","Data","Configurable star rating display"],
  ["tabs","Tabs","Interactive","Stateful tab panels"],["accordion","Accordion","Interactive","Expandable content items"],["modal","Modal","Interactive","Trigger and editable modal content"],["alert","Alert","Interactive","Accessible status/alert callout"],
  ["symbol","Component Group","Components","Save and sync as a reusable project component"],["html","Custom HTML","Advanced","Render custom HTML markup"]
];

export const phase3ElementLibrary: LibraryItem[] = [
  ...defs.map(([id,name,group,description]) => ({id:`phase3-${id}`,name,group,description,category:"elements" as const,create:()=>createPhase3Element(id)})),
  inputVariant("phase3-email-input","Email Input","email","you@example.com"),
  inputVariant("phase3-password-input","Password Input","password","Password"),
  inputVariant("phase3-number-input","Number Input","number","0"),
  inputVariant("phase3-date-input","Date Input","date",""),
  inputVariant("phase3-time-input","Time Input","time",""),
  inputVariant("phase3-url-input","URL Input","url","https://example.com"),
  inputVariant("phase3-search-input","Search Input","search","Search…")
];
