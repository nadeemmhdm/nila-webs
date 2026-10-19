import type { BuilderNode, LibraryItem, NodeType } from "../types";
import { createNode, defaultStyle, uid } from "../lib/nodes";

const node = (type: NodeType, name: string, extra: Partial<BuilderNode> = {}): BuilderNode => ({
  id: uid(type), type, name, style: { ...defaultStyle(), ...(extra.style || {}) }, animation: "none", hoverAnimation: "none",
  animationDuration: .7, animationDelay: 0, responsive: {}, hiddenOn: {}, ...extra,
  style: { ...defaultStyle(), ...(extra.style || {}) }
});

export function createPhase3Element(type: NodeType): BuilderNode {
  switch (type) {
    case "link": return node(type,"Text Link",{content:"Learn more",href:"#",target:"_self",hoverAnimation:"lift",style:{...defaultStyle(),width:"fit-content",color:"#6d28d9",fontWeight:"600"}});
    case "badge": return node(type,"Badge",{content:"New",style:{...defaultStyle(),width:"fit-content",padding:"6px 11px",background:"#ede9fe",color:"#6d28d9",borderRadius:"999px",fontSize:"13px",fontWeight:"700"}});
    case "list": return node(type,"List",{options:["First item","Second item","Third item"],style:{...defaultStyle(),width:"100%",padding:"0 0 0 22px",display:"flex",flexDirection:"column",gap:"8px"}});
    case "checkbox": return node(type,"Checkbox",{content:"I agree to the terms",checked:false,value:"yes",nameAttr:"agreement",style:{...defaultStyle(),width:"fit-content",display:"flex",flexDirection:"row",alignItems:"center",gap:"9px"}});
    case "radio": return node(type,"Radio Group",{content:"Choose an option",options:["Option one","Option two","Option three"],value:"Option one",nameAttr:"choice",style:{...defaultStyle(),width:"100%",display:"flex",flexDirection:"column",gap:"8px"}});
    case "switch": return node(type,"Switch",{content:"Enable notifications",checked:true,style:{...defaultStyle(),width:"fit-content",display:"flex",flexDirection:"row",alignItems:"center",gap:"10px"}});
    case "range": return node(type,"Range",{content:"Range",value:"50",min:0,max:100,step:1,style:{...defaultStyle(),width:"100%"}});
    case "file": return node(type,"File Input",{content:"Upload file",style:{...defaultStyle(),width:"100%",padding:"10px",borderWidth:"1px",borderColor:"#d1d5db",borderRadius:"10px"}});
    case "embed": return node(type,"Embed",{src:"https://www.youtube.com/embed/dQw4w9WgXcQ",alt:"Embedded content",style:{...defaultStyle(),width:"100%",height:"420px",borderWidth:"0px",borderRadius:"16px",overflow:"hidden"}});
    case "map": return node(type,"Map",{src:"https://www.openstreetmap.org/export/embed.html?bbox=76.70%2C9.85%2C76.78%2C9.93&layer=mapnik",alt:"Map",style:{...defaultStyle(),width:"100%",height:"360px",borderWidth:"0px",borderRadius:"16px",overflow:"hidden"}});
    case "table": return node(type,"Table",{table:{headers:["Name","Role","Status"],rows:[["Ava","Designer","Active"],["Liam","Developer","Active"]]},style:{...defaultStyle(),width:"100%",overflow:"auto"}});
    case "tabs": return node(type,"Tabs",{items:[{title:"Overview",body:"Add your overview content here."},{title:"Details",body:"Add supporting details here."},{title:"Notes",body:"Add notes here."}],style:{...defaultStyle(),width:"100%",padding:"8px",borderWidth:"1px",borderColor:"#e5e7eb",borderRadius:"14px"}});
    case "accordion": return node(type,"Accordion",{items:[{title:"What is Nila Webs?",body:"A visual React + Vite website builder."},{title:"Can I export the code?",body:"Yes. Export produces a standalone project."}],style:{...defaultStyle(),width:"100%",borderWidth:"1px",borderColor:"#e5e7eb",borderRadius:"14px",overflow:"hidden"}});
    case "modal": return node(type,"Modal",{content:"Open modal",children:[createNode("heading",{content:"Modal title",style:{...defaultStyle(),fontSize:"28px",fontWeight:"700"}}),createNode("text",{content:"Drop more elements here or customize this modal content."})],style:{...defaultStyle(),width:"fit-content"}});
    case "carousel": return node(type,"Carousel",{slides:[{src:"https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",alt:"Workspace",caption:"Workspace"},{src:"https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",alt:"Studio",caption:"Studio"},{src:"https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",alt:"Office",caption:"Office"}],style:{...defaultStyle(),width:"100%",height:"420px",borderRadius:"18px",overflow:"hidden"}});
    case "socials": return node(type,"Social Links",{links:[{label:"Instagram",href:"https://instagram.com"},{label:"GitHub",href:"https://github.com"},{label:"LinkedIn",href:"https://linkedin.com"}],style:{...defaultStyle(),width:"fit-content",display:"flex",flexDirection:"row",gap:"10px"}});
    case "symbol": return node(type,"Component Symbol",{componentName:"My Component",children:[createNode("heading",{content:"Reusable component",style:{...defaultStyle(),fontSize:"26px",fontWeight:"700"}}),createNode("text",{content:"Group elements into a reusable component container."})],style:{...defaultStyle(),width:"100%",padding:"24px",borderWidth:"1px",borderStyle:"dashed",borderColor:"#a78bfa",borderRadius:"16px",display:"flex",flexDirection:"column",gap:"10px"}});
    default: return createNode("container");
  }
}

const defs: Array<[NodeType,string,string,string]> = [
  ["link","Text Link","Typography","Editable internal or external link"],["badge","Badge","Typography","Compact status or category badge"],["list","List","Typography","Editable bullet list"],
  ["socials","Social Links","Actions","Multiple external social links"],
  ["carousel","Carousel","Media","Stateful image carousel with uploaded asset support"],["embed","Embed / iFrame","Media","Embed videos or compatible external content"],["map","Map Embed","Media","OpenStreetMap or compatible map iframe"],
  ["checkbox","Checkbox","Forms","Checkbox with editable label/name/value"],["radio","Radio Group","Forms","Editable radio options"],["switch","Switch","Forms","Interactive toggle switch"],["range","Range","Forms","Min/max/step range input"],["file","File Input","Forms","Browser file field"],
  ["table","Table","Data","Editable headers and rows"],["tabs","Tabs","Interactive","Stateful tab panels"],["accordion","Accordion","Interactive","Expandable content items"],["modal","Modal","Interactive","Trigger and editable modal content"],
  ["symbol","Component Symbol","Components","Reusable component container"]
];

export const phase3ElementLibrary: LibraryItem[] = defs.map(([id,name,group,description]) => ({id:`phase3-${id}`,name,group,description,category:"elements",create:()=>createPhase3Element(id)}));
