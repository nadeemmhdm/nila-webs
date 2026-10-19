import type { BuilderNode, BuilderPage, BuilderProject, ExportDependencyManifest, ImportedBlock, SavedComponent } from "../types";

const json = (value: unknown) => JSON.stringify(value, null, 2);
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "page";
const pascal = (value: string) => {
  const out = value.replace(/[^a-zA-Z0-9]+/g, " ").trim().split(/\s+/).filter(Boolean).map(part => part.charAt(0).toUpperCase()+part.slice(1)).join("");
  return /^[0-9]/.test(out) ? `Page${out}` : (out || "Page");
};
const tsString = (value: string) => JSON.stringify(value);
const nodeLiteral = (node: BuilderNode) => `${json(node)} as any`;

export function generatedRuntimeSource() { return `import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { runtimeConfig as site } from '../site.config';

type Node = any;
export type Viewport = 'desktop'|'tablet'|'mobile';
export type GeneratedNode = any;

export function useViewport():Viewport {
  const get=():Viewport=>{const d=(site as any).designSystem?.breakpoints||{};return window.innerWidth <= (d.mobileMax??639) ? 'mobile' : window.innerWidth <= (d.tabletMax??1023) ? 'tablet' : 'desktop'};
  const [viewport,setViewport]=useState<Viewport>(get);
  useEffect(()=>{const onResize=()=>setViewport(get());window.addEventListener('resize',onResize);return()=>window.removeEventListener('resize',onResize)},[]);
  return viewport;
}

const css=(s:any)=>({background:s.background,color:s.color,width:s.width,maxWidth:s.maxWidth,height:s.height,minHeight:s.minHeight,padding:s.padding,margin:s.margin,borderWidth:s.borderWidth,borderColor:s.borderColor,borderStyle:s.borderStyle,borderRadius:s.borderRadius,boxShadow:s.boxShadow,fontSize:s.fontSize,fontWeight:s.fontWeight,lineHeight:s.lineHeight,letterSpacing:s.letterSpacing,textAlign:s.textAlign,display:s.display,flexDirection:s.flexDirection,justifyContent:s.justifyContent,alignItems:s.alignItems,gap:s.gap,opacity:s.opacity,overflow:s.overflow,gridTemplateColumns:s.gridColumns});
const resolved=(node:Node,viewport:Viewport)=>viewport==='desktop'?node.style:viewport==='tablet'?({...node.style,...(node.responsive?.tablet||{})}):({...node.style,...(node.responsive?.tablet||{}),...(node.responsive?.mobile||{})});

export function NodeView({node,viewport,timelineOffset=0}:{node:Node;viewport:Viewport;timelineOffset?:number}){
  const nav=useNavigate();
  const [activeTab,setActiveTab]=useState(node.defaultIndex??0);
  const [openAccordion,setOpenAccordion]=useState<number|null>(node.defaultIndex??0);
  const [modalOpen,setModalOpen]=useState(false);
  const [switchOn,setSwitchOn]=useState(!!node.checked);
  const [slide,setSlide]=useState(0);
  const [formStatus,setFormStatus]=useState<'idle'|'sending'|'success'|'error'>('idle');
  const motionEl=useRef<HTMLElement|null>(null);
  const motion=(site as any).motionSystem||{};
  const trigger=node.motionTrigger||motion.defaultTrigger||'scroll';
  const [prefersReduced,setPrefersReduced]=useState(false);
  useEffect(()=>{if(typeof window==='undefined'||!window.matchMedia)return;const query=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setPrefersReduced(query.matches);update();query.addEventListener?.('change',update);return()=>query.removeEventListener?.('change',update)},[]);
  const reduced=motion.reducedMotion==='reduce'||(motion.reducedMotion==='respect'&&prefersReduced);
  const [inView,setInView]=useState(trigger!=='scroll');
  const [parallaxY,setParallaxY]=useState(0);
  const slides=node.slides||[];
  const carouselAutoplay=node.autoplay??node.carouselAutoplay??false;
  const carouselInterval=node.interval??node.carouselInterval??4500;
  const carouselShowDots=node.showDots??node.carouselShowDots??true;
  const carouselShowArrows=node.carouselShowArrows??true;
  const modalCloseOnBackdrop=node.closeOnBackdrop??node.modalCloseOnBackdrop??true;
  useEffect(()=>{if(!motion.enabled||reduced||trigger!=='scroll'||!node.animation||node.animation==='none'){setInView(true);return}const el=motionEl.current;if(!el||typeof IntersectionObserver==='undefined'){setInView(true);return}setInView(false);const observer=new IntersectionObserver(entries=>{const entry=entries[0];if(entry?.isIntersecting){setInView(true);if(!node.motionRepeat)observer.disconnect()}else if(node.motionRepeat)setInView(false)},{threshold:Math.max(0,Math.min(1,node.motionThreshold??motion.scrollThreshold??.18)),rootMargin:'0px 0px -4% 0px'});observer.observe(el);return()=>observer.disconnect()},[motion.enabled,reduced,trigger,node.animation,node.motionRepeat,node.motionThreshold,motion.scrollThreshold]);
  useEffect(()=>{if(!motion.enabled||reduced||!node.parallax){setParallaxY(0);return}const el=motionEl.current;if(!el)return;let raf=0;const update=()=>{raf=0;const rect=el.getBoundingClientRect();const center=rect.top+rect.height/2-window.innerHeight/2;const limit=motion.parallaxMax??.3;const strength=Math.max(-limit,Math.min(limit,node.parallax||0));setParallaxY(Math.round(-center*strength*.18))};const onScroll=()=>{if(!raf)raf=requestAnimationFrame(update)};update();window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);return()=>{window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll);if(raf)cancelAnimationFrame(raf)}},[motion.enabled,reduced,node.parallax,motion.parallaxMax]);
  useEffect(()=>{if(!carouselAutoplay||slides.length<2)return;const timer=window.setInterval(()=>setSlide((v:number)=>(v+1)%slides.length),Math.max(1200,carouselInterval));return()=>window.clearInterval(timer)},[carouselAutoplay,carouselInterval,slides.length]);
  useEffect(()=>{if(!modalOpen)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setModalOpen(false)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[modalOpen]);
  if(node.hiddenOn?.[viewport]) return null;
  const st=css(resolved(node,viewport));
  const motionClass=!motion.enabled||reduced?'motion-disabled':('motion-'+trigger+' '+(inView?'motion-inview':'motion-pending'));
  const animStyle:any={...st,animationDuration:(node.animationDuration??motion.defaultDuration??.7)+'s',animationDelay:((node.animationDelay??0)+timelineOffset)+'s',animationTimingFunction:node.motionEasing||motion.defaultEasing||'ease',transitionDuration:(node.transitionDuration??.25)+'s',transitionTimingFunction:node.transitionEasing||'ease',...(node.parallax&&!reduced?{'--nw-parallax-y':parallaxY+'px'}:{}),...(node.sticky?{position:'sticky',top:node.stickyTop||'0px',zIndex:node.stickyZIndex??10}:{})};
  const cls='nw-node anim-'+(node.animation||'none')+' hover-'+(node.hoverAnimation||'none')+' '+motionClass+(node.parallax?' has-parallax':'')+(node.sticky?' is-sticky':'');
  const common:any={ref:(el:HTMLElement|null)=>{motionEl.current=el},className:cls,style:animStyle,'aria-label':node.ariaLabel||undefined,title:node.titleAttr||undefined,role:node.roleAttr||undefined,tabIndex:node.tabIndex,id:node.anchorId||undefined,'data-nw-anchor':node.anchorId||undefined};
  const handleHref=(e:any,href?:string)=>{if(!href)return;if(/^https?:\\/\\//.test(href)||href.startsWith('mailto:')||href.startsWith('tel:')||href.startsWith('#'))return;e.preventDefault();nav(href)};
  const count=node.children?.length||0;
  const children=node.children?.map((n:Node,i:number)=>{const order=node.timelineOrder==='reverse'?count-1-i:i;return <NodeView key={n.id} node={n} viewport={viewport} timelineOffset={timelineOffset+(node.timelineStagger||0)*order}/>});
  switch(node.type){
    case 'heading':return <h1 {...common}>{node.content}</h1>;
    case 'text':return <p {...common}>{node.content}</p>;
    case 'button':return <a {...common} className={'nw-button '+cls} href={node.href||'#'} target={node.target||'_self'} download={node.download||undefined} rel={node.target==='_blank'?'noreferrer':undefined} onClick={e=>handleHref(e,node.href)}>{node.content}</a>;
    case 'link':return <a {...common} className={'nw-link '+cls} href={node.href||'#'} target={node.target||'_self'} download={node.download||undefined} rel={node.target==='_blank'?'noreferrer':undefined} onClick={e=>handleHref(e,node.href)}>{node.content}</a>;
    case 'badge':return <span {...common} className={'nw-badge '+cls}>{node.content}</span>;
    case 'image':return <img {...common} src={node.src} alt={node.alt||''} style={{...animStyle,objectFit:'cover'}}/>;
    case 'video':return <video {...common} src={node.src} controls muted loop playsInline style={{...animStyle,objectFit:'cover'}}/>;
    case 'avatar':return <div {...common} className={'nw-avatar '+cls}>{node.src?<img src={node.src} alt={node.alt||''}/>:<span>{node.content||'?'}</span>}</div>;
    case 'icon':return <span {...common}>{node.content||'✦'}</span>;
    case 'input':return <input {...common} type={node.inputType||'text'} placeholder={node.placeholder||''} name={node.nameAttr} defaultValue={node.value} required={!!node.required} pattern={node.pattern||undefined} minLength={node.minLength} maxLength={node.maxLength} autoComplete={node.autocomplete}/>;
    case 'textarea':return <textarea {...common} placeholder={node.placeholder||''} name={node.nameAttr} defaultValue={node.value} rows={node.rows||4} required={!!node.required} minLength={node.minLength} maxLength={node.maxLength} autoComplete={node.autocomplete}/>;
    case 'select':return <select {...common} name={node.nameAttr} defaultValue={node.value} required={!!node.required}>{(node.options||[]).map((o:string)=><option key={o}>{o}</option>)}</select>;
    case 'label':return <label {...common}>{node.content}</label>;
    case 'checkbox':return <label {...common} className={'nw-check-control '+cls}><input type='checkbox' defaultChecked={node.checked} required={!!node.required} name={node.nameAttr} value={node.value}/><span>{node.content}</span></label>;
    case 'radio':return <fieldset {...common} className={'nw-radio-group '+cls}><legend>{node.content}</legend>{(node.options||[]).map((o:string)=><label key={o}><input type='radio' name={node.nameAttr||node.id} value={o} defaultChecked={(node.value||node.options?.[0])===o} required={!!node.required}/><span>{o}</span></label>)}</fieldset>;
    case 'switch':return <label {...common} className={'nw-switch-row '+cls}><button type='button' className={'nw-switch '+(switchOn?'on':'')} aria-pressed={switchOn} aria-label={node.ariaLabel||node.content||'Toggle'} onClick={()=>setSwitchOn((v:boolean)=>!v)}><span/></button><span>{node.content}</span></label>;
    case 'range':return <label {...common} className={'nw-range '+cls}><span>{node.content}</span><input type='range' name={node.nameAttr} min={node.min??0} max={node.max??100} step={node.step??1} defaultValue={Number(node.value??50)}/></label>;
    case 'file':return <label {...common} className={'nw-file-input '+cls}><span>{node.content}</span><input type='file' name={node.nameAttr} accept={node.accept} multiple={!!node.multiple} required={!!node.required}/></label>;
    case 'list':{const ordered=node.ordered??node.listStyle==='decimal';const listStyleType=node.listStyle==='none'?'none':(node.listStyle||(ordered?'decimal':'disc'));return ordered?<ol {...common} style={{...animStyle,listStyleType}} className={'nw-list '+cls}>{(node.options||[]).map((item:string,i:number)=><li key={item+i}>{item}</li>)}</ol>:<ul {...common} style={{...animStyle,listStyleType}} className={'nw-list '+cls}>{(node.options||[]).map((item:string,i:number)=><li key={item+i}>{item}</li>)}</ul>}
    case 'embed':case 'map':return <div {...common} className={'nw-embed '+cls}><iframe src={node.src} title={node.alt||node.name} loading='lazy' allowFullScreen referrerPolicy='no-referrer-when-downgrade' style={{width:'100%',height:'100%',border:0}}/></div>;
    case 'html':return <div {...common} className={'nw-html-block '+cls}><iframe title={node.ariaLabel||node.name} srcDoc={node.html??node.content??''} sandbox='' style={{width:'100%',height:'100%',border:0,background:'transparent'}}/></div>;
    case 'code':return <pre {...common} className={'nw-code '+cls}><code>{node.content}</code></pre>;
    case 'alert':return <div {...common} className={'nw-alert nw-alert-'+String(node.meta?.variant||'info')+' '+cls}>{node.content}</div>;
    case 'progress':return <label {...common} className={'nw-progress '+cls}><span>{node.content}</span><progress value={Number(node.value||0)} max={node.max??100}/><b>{node.value||'0'}%</b></label>;
    case 'rating':{const max=Math.max(1,node.max||5);const value=Math.max(0,Math.min(max,Number(node.value||0)));return <div {...common} className={'nw-rating '+cls} aria-label={node.ariaLabel||(value+' out of '+max+' stars')}><span aria-hidden='true'>{'★'.repeat(Math.round(value))}{'☆'.repeat(Math.max(0,max-Math.round(value)))}</span></div>}
    case 'breadcrumb':return <nav {...common} className={'nw-breadcrumb '+cls} aria-label={node.ariaLabel||'Breadcrumb'}>{(node.links||[]).map((link:any,i:number)=><span key={link.label+i}><a href={link.href} onClick={e=>handleHref(e,link.href)}>{link.label}</a>{i<(node.links?.length||0)-1&&<i aria-hidden='true'>/</i>}</span>)}</nav>;
    case 'table':return <div {...common} className={'nw-table-wrap '+cls+(node.tableStriped?' striped':'')+(node.tableCompact?' compact':'')}><table>{node.table?.caption&&<caption>{node.table.caption}</caption>}<thead><tr>{(node.table?.headers||[]).map((h:string,i:number)=><th scope='col' key={h+i}>{h}</th>)}</tr></thead><tbody>{(node.table?.rows||[]).map((row:string[],r:number)=><tr key={r}>{row.map((cell:string,c:number)=><td key={c}>{cell}</td>)}</tr>)}</tbody></table></div>;
    case 'tabs':return <div {...common} className={'nw-tabs '+cls}><div className='nw-tab-list' role='tablist'>{(node.items||[]).map((item:any,i:number)=><button type='button' role='tab' aria-selected={activeTab===i} key={item.title} className={activeTab===i?'active':''} onClick={()=>setActiveTab(i)}>{item.title}</button>)}</div><div className='nw-tab-panel' role='tabpanel'>{node.items?.[activeTab]?.body||''}</div></div>;
    case 'accordion':return <div {...common} className={'nw-accordion '+cls}>{(node.items||[]).map((item:any,i:number)=><div className='nw-accordion-item' key={item.title}><button type='button' aria-expanded={openAccordion===i} onClick={()=>setOpenAccordion((v:number|null)=>v===i?null:i)}><span>{item.title}</span><b>{openAccordion===i?'−':'+'}</b></button>{openAccordion===i&&<div className='nw-accordion-panel'>{item.body}</div>}</div>)}</div>;
    case 'modal':return <div {...common} className={'nw-modal-node '+cls}><button type='button' className='nw-modal-trigger' aria-label={node.ariaLabel||undefined} onClick={()=>setModalOpen(true)}>{node.content||'Open modal'}</button>{modalOpen&&<div className='nw-modal-backdrop' onClick={()=>{if(modalCloseOnBackdrop)setModalOpen(false)}}><div className='nw-modal-dialog' role='dialog' aria-modal='true' aria-label={node.ariaLabel||'Dialog'} style={{maxWidth:node.modalWidth||'560px'}} onClick={e=>e.stopPropagation()}><button className='nw-modal-close' aria-label='Close dialog' onClick={()=>setModalOpen(false)}>×</button>{children}</div></div>}</div>;
    case 'carousel':{const safe=slides.length?Math.min(slide,slides.length-1):0;return <div {...common} className={'nw-carousel '+cls} aria-roledescription='carousel'>{slides.length?<><img className='nw-carousel-image' src={slides[safe].src} alt={slides[safe].alt||''}/>{slides[safe].caption&&<div className='nw-carousel-caption'>{slides[safe].caption}</div>}{carouselShowArrows&&<><button type='button' aria-label='Previous slide' className='nw-carousel-prev' onClick={()=>setSlide((v:number)=>(v-1+slides.length)%slides.length)}>‹</button><button type='button' aria-label='Next slide' className='nw-carousel-next' onClick={()=>setSlide((v:number)=>(v+1)%slides.length)}>›</button></>}{carouselShowDots&&<div className='nw-carousel-dots'>{slides.map((_:any,i:number)=><i key={i} className={i===safe?'active':''}/>)}</div>}</>:null}</div>}
    case 'socials':return <div {...common} className={'nw-socials '+cls}>{(node.links||[]).map((link:any)=><a key={link.label+link.href} href={link.href} target='_blank' rel='noreferrer'>{link.label}</a>)}</div>;
    case 'symbol':return <div {...common} className={'nw-symbol '+cls}>{children}</div>;
    case 'divider':case 'spacer':return <div {...common}/>;
    case 'navbar':return <nav {...common} aria-label={node.ariaLabel||'Main navigation'}>{children}{!!node.links?.length&&<div className='nw-nav-links'>{node.links.map((link:any)=><a key={link.label+link.href} href={link.href} onClick={e=>handleHref(e,link.href)}>{link.label}</a>)}</div>}</nav>;
    case 'footer':return <footer {...common}>{children}</footer>;
    case 'form':return <form {...common} action={node.formAction||undefined} method={node.formMethod||'post'} onSubmit={submitForm}>{node.formHoneypot&&<input className='nw-honeypot' type='text' name={node.formHoneypot} tabIndex={-1} autoComplete='off'/>}{children}{formStatus==='sending'&&<div className='nw-form-status' role='status'>Sending…</div>}{formStatus==='success'&&<div className='nw-form-status success' role='status'>{node.formSuccessMessage||'Thanks! Your form was submitted.'}</div>}{formStatus==='error'&&<div className='nw-form-status error' role='alert'>Submission failed. Please try again.</div>}</form>;
    default:return <div {...common}>{children}</div>;
  }
}

export function themeVars(t:any){return {'--nw-background':t?.colors?.background||'#fff','--nw-surface':t?.colors?.surface||'#f8fafc','--nw-surface-alt':t?.colors?.surfaceAlt||'#eef2ff','--nw-text':t?.colors?.text||'#111827','--nw-muted':t?.colors?.muted||'#64748b','--nw-primary':t?.colors?.primary||'#7c3aed','--nw-primary-text':t?.colors?.primaryText||'#fff','--nw-secondary':t?.colors?.secondary||'#0ea5e9','--nw-border':t?.colors?.border||'#e5e7eb','--nw-success':t?.colors?.success||'#059669','--nw-warning':t?.colors?.warning||'#d97706','--nw-danger':t?.colors?.danger||'#dc2626','--nw-radius':t?.radius||'18px','--nw-shadow':t?.shadow||'0 18px 55px rgba(15,23,42,.1)','--nw-font-body':t?.typography?.body||'Inter,system-ui,sans-serif','--nw-font-heading':t?.typography?.heading||'Inter,system-ui,sans-serif'} as any}
export function designVars(d:any,viewport:Viewport){const pad=d?.contentPadding?.[viewport]||'20px';return {'--nw-container':d?.containerMaxWidth||'1200px','--nw-page-pad':pad,'--nw-space-xs':d?.spacing?.xs||'4px','--nw-space-sm':d?.spacing?.sm||'8px','--nw-space-md':d?.spacing?.md||'16px','--nw-space-lg':d?.spacing?.lg||'24px','--nw-space-xl':d?.spacing?.xl||'40px','--nw-space-2xl':d?.spacing?.xxl||'64px','--nw-type-xs':d?.typography?.xs||'12px','--nw-type-sm':d?.typography?.sm||'14px','--nw-type-base':d?.typography?.base||'16px','--nw-type-lg':d?.typography?.lg||'18px','--nw-type-xl':d?.typography?.xl||'24px','--nw-type-2xl':d?.typography?.xxl||'36px','--nw-type-display':d?.typography?.display||'56px'} as any}
function setMeta(name:string,content:string,property=false){let el=document.head.querySelector(property?('meta[property=\"'+name+'\"]'):('meta[name=\"'+name+'\"]')) as HTMLMetaElement|null;if(!el){el=document.createElement('meta');el.setAttribute(property?'property':'name',name);document.head.appendChild(el)}el.content=content}
`; }

function pageSeoSource() { return `import { useEffect } from 'react';
import { siteConfig } from '../site.config';
function setMeta(name:string,content:string,property=false){let el=document.head.querySelector(property?('meta[property="'+name+'"]'):('meta[name="'+name+'"]')) as HTMLMetaElement|null;if(!el){el=document.createElement('meta');el.setAttribute(property?'property':'name',name);document.head.appendChild(el)}el.content=content}
export default function PageSeo({page}:{page:any}){useEffect(()=>{const s:any=siteConfig;const title=page.seo?.title||page.name||s.seo?.siteTitle||s.name;const template=s.seo?.titleTemplate||'%s';document.title=template.includes('%s')?template.replace('%s',title):title+' | '+template;const description=page.seo?.description||s.seo?.description||s.description||'';setMeta('description',description);setMeta('robots',(page.seo?.noIndex||s.seo?.index===false?'noindex':'index')+','+(s.seo?.follow===false?'nofollow':'follow'));setMeta('og:title',document.title,true);setMeta('og:description',description,true);const image=page.seo?.image||s.seo?.defaultImage||'';if(image)setMeta('og:image',image,true);setMeta('keywords',page.seo?.keywords||'');setMeta('twitter:card','summary_large_image');if(s.seo?.twitterSite)setMeta('twitter:site',s.seo.twitterSite);let canonical=document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement|null;if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.appendChild(canonical)}const base=(s.seo?.siteUrl||'').replace(/\\/+$/,'');canonical.href=page.seo?.canonical||(base?base+(page.path==='/'?'/':page.path):window.location.href);},[page]);return null}
`; }

function themeSource(project: BuilderProject) {
  return `export const theme = ${json(project.theme)} as const;
export const designSystem = ${json(project.designSystem)} as const;
export const motionSystem = ${json(project.motionSystem)} as const;
export const savedThemes = ${json(project.savedThemes || [])} as const;
`;
}

function siteConfigSource(project: BuilderProject) {
  return `import { theme, designSystem, motionSystem } from './theme/siteTheme';
export const siteConfig = ${json({ name: project.name, description: project.description || "", seo: project.seo, security: project.security })} as const;
export const runtimeConfig = { ...siteConfig, theme, designSystem, motionSystem } as const;
export default runtimeConfig;
`;
}

function globalComponentSource(name: string, node: BuilderNode) {
  return `import { NodeView, type Viewport } from '../../runtime/NodeView';
export const node = ${nodeLiteral(node)};
export default function ${name}({viewport}:{viewport:Viewport}){return <NodeView node={node} viewport={viewport}/>}
`;
}

function sectionSource(componentName: string, node: BuilderNode, sourceId?: string) {
  const provenance = sourceId ? `\nexport const sourceId = ${tsString(sourceId)};` : "";
  return `import { NodeView, type Viewport } from '../../runtime/NodeView';
export const node = ${nodeLiteral(node)};${provenance}
export default function ${componentName}({viewport}:{viewport:Viewport}){return <NodeView node={node} viewport={viewport}/>}
`;
}

function savedComponentSource(component: SavedComponent) {
  const name = `${pascal(component.name)}Component`;
  return `import { NodeView, type Viewport } from '../../runtime/NodeView';
export const componentId = ${tsString(component.id)};
export const node = ${nodeLiteral(component.node)};
export default function ${name}({viewport}:{viewport:Viewport}){return <NodeView node={node} viewport={viewport}/>}
`;
}

function importedBlockSource(block: ImportedBlock) {
  const name = `${pascal(block.name)}Imported`;
  const source = block.source || "";
  return `import { NodeView, type Viewport } from '../../runtime/NodeView';
export const sourceId = ${tsString(block.id)};
export const detectedKind = ${tsString(block.detectedKind || block.group || "section")};
export const originalSource = ${tsString(source)};
export const node = ${nodeLiteral(block.node)};
export default function ${name}({viewport}:{viewport:Viewport}){return <NodeView node={node} viewport={viewport}/>}
`;
}

function pageSource(page: BuilderPage, sectionEntries: { name:string; path:string }[]) {
  const pageName = `${pascal(page.name)}Page`;
  const imports = sectionEntries.map((entry,i)=>`import Section${i+1} from '../sections/${slug(page.name)}/${entry.name}';`).join('\n');
  const sections = sectionEntries.map((_,i)=>`<Section${i+1} viewport={viewport}/>`).join('');
  return `import type { Viewport } from '../runtime/NodeView';
import PageSeo from '../runtime/PageSeo';
${page.showNavbar ? "import SiteNavbar from '../components/global/SiteNavbar';\n" : ""}${page.showFooter ? "import SiteFooter from '../components/global/SiteFooter';\n" : ""}${imports}
export const page = ${json({ id:page.id, name:page.name, path:page.path, seo:page.seo || null })} as const;
export default function ${pageName}({viewport}:{viewport:Viewport}){return <><PageSeo page={page}/>${page.showNavbar?'<SiteNavbar viewport={viewport}/>':''}<main data-page=${tsString(page.path)}>${sections}</main>${page.showFooter?'<SiteFooter viewport={viewport}/>':''}</>}
`;
}

function appSource(project: BuilderProject) {
  const pageImports = project.pages.map(p=>`import ${pascal(p.name)}Page from './pages/${pascal(p.name)}Page';`).join('\n');
  const routes = project.pages.map(p=>`<Route path=${tsString(p.path)} element={<${pascal(p.name)}Page viewport={viewport}/>}/>`).join('');
  const first = project.pages[0]?.path || '/';
  return `import { Navigate, Route, Routes } from 'react-router-dom';
import { runtimeConfig as site } from './site.config';
import { designVars, themeVars, useViewport } from './runtime/NodeView';
${pageImports}
export default function App(){const viewport=useViewport();return <div className='nw-site' data-nw-motion={site.motionSystem?.reducedMotion||'respect'} style={{...themeVars(site.theme),...designVars(site.designSystem,viewport)}}><Routes>${routes}<Route path='*' element={<Navigate to=${tsString(first)} replace/>}/></Routes></div>}
`;
}

export function buildReactSourceTextFiles(project: BuilderProject, manifest: ExportDependencyManifest): Record<string,string> {
  const files: Record<string,string> = {};
  files['src/runtime/NodeView.tsx'] = generatedRuntimeSource();
  files['src/runtime/PageSeo.tsx'] = pageSeoSource();
  files['src/theme/siteTheme.ts'] = themeSource(project);
  files['src/site.config.ts'] = siteConfigSource(project);
  files['src/components/global/SiteNavbar.tsx'] = globalComponentSource('SiteNavbar', project.globalNavbar);
  files['src/components/global/SiteFooter.tsx'] = globalComponentSource('SiteFooter', project.globalFooter);

  const usedComponentIds = new Set(manifest.usedComponentIds || []);
  for (const component of project.components || []) {
    if (!usedComponentIds.size || usedComponentIds.has(component.id)) files[`src/components/generated/${pascal(component.name)}Component.tsx`] = savedComponentSource(component);
  }

  const usedSources = new Set(manifest.usedSourceIds || []);
  for (const block of project.importedBlocks || []) {
    if (!usedSources.size || usedSources.has(block.id) || usedSources.has(String(block.node.meta?.sourceId || ''))) {
      const bucket = block.artifactType === 'component' ? 'components' : 'sections';
      files[`src/imported/${bucket}/${pascal(block.name)}Imported.tsx`] = importedBlockSource(block);
    }
  }

  project.pages.forEach(page=>{
    const folder = slug(page.name);
    const sectionEntries: {name:string;path:string}[] = [];
    page.nodes.forEach((node,index)=>{
      const base = pascal(node.name || `${node.type} ${index+1}`);
      const name = `${String(index+1).padStart(2,'0')}${base}`;
      const path = `src/sections/${folder}/${name}.tsx`;
      files[path] = sectionSource(`Section${name}`, node, typeof node.meta?.sourceId === 'string' ? node.meta.sourceId : undefined);
      sectionEntries.push({name,path});
    });
    files[`src/pages/${pascal(page.name)}Page.tsx`] = pageSource(page,sectionEntries);
  });
  files['src/App.tsx'] = appSource(project);
  return files;
}
