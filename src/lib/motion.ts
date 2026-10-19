import type { BuilderNode, BuilderProject, MotionSystem } from "../types";

export const defaultMotionSystem: MotionSystem = {
  enabled: true,
  defaultTrigger: "scroll",
  defaultDuration: 0.7,
  defaultEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
  scrollThreshold: 0.18,
  defaultStagger: 0.08,
  parallaxMax: 0.3,
  reducedMotion: "respect"
};

export function normalizeMotionNode(node: BuilderNode, system: MotionSystem = defaultMotionSystem): BuilderNode {
  const hasEntrance = !!node.animation && node.animation !== "none";
  return {
    ...node,
    motionTrigger: node.motionTrigger || (hasEntrance ? system.defaultTrigger : "load"),
    motionRepeat: node.motionRepeat ?? false,
    motionThreshold: node.motionThreshold ?? system.scrollThreshold,
    motionEasing: node.motionEasing || system.defaultEasing,
    transitionDuration: node.transitionDuration ?? 0.25,
    transitionEasing: node.transitionEasing || "ease",
    parallax: Math.max(-system.parallaxMax, Math.min(system.parallaxMax, node.parallax ?? 0)),
    stickyTop: node.stickyTop || "0px",
    stickyZIndex: node.stickyZIndex ?? 10,
    timelineStagger: Math.max(0, node.timelineStagger ?? 0),
    timelineOrder: node.timelineOrder || "forward",
    children: node.children?.map(child => normalizeMotionNode(child, system))
  };
}

export function normalizeMotionProject(project: BuilderProject): BuilderProject {
  const system = { ...defaultMotionSystem, ...(project.motionSystem || {}) };
  return {
    ...project,
    motionSystem: system,
    globalNavbar: normalizeMotionNode(project.globalNavbar, system),
    globalFooter: normalizeMotionNode(project.globalFooter, system),
    pages: project.pages.map(page => ({ ...page, nodes: page.nodes.map(node => normalizeMotionNode(node, system)) })),
    components: project.components.map(component => ({ ...component, node: normalizeMotionNode(component.node, system) })),
    importedBlocks: project.importedBlocks.map(block => ({ ...block, node: normalizeMotionNode(block.node, system) }))
  };
}

export interface MotionAudit {
  total: number;
  animated: number;
  scrollReveal: number;
  hover: number;
  parallax: number;
  sticky: number;
  timelines: number;
  reducedMotionReady: boolean;
  score: number;
}

export function auditMotionProject(project: BuilderProject): MotionAudit {
  let total=0, animated=0, scrollReveal=0, hover=0, parallax=0, sticky=0, timelines=0;
  const visit=(node:BuilderNode)=>{
    total++;
    if (node.animation && node.animation !== "none") animated++;
    if (node.motionTrigger === "scroll" && node.animation && node.animation !== "none") scrollReveal++;
    if (node.hoverAnimation && node.hoverAnimation !== "none") hover++;
    if (Math.abs(node.parallax || 0) > 0.001) parallax++;
    if (node.sticky) sticky++;
    if ((node.timelineStagger || 0) > 0 && (node.children?.length || 0) > 1) timelines++;
    node.children?.forEach(visit);
  };
  visit(project.globalNavbar); visit(project.globalFooter); project.pages.forEach(page=>page.nodes.forEach(visit));
  const configured = animated + hover + parallax + sticky + timelines;
  const score = total ? Math.min(100, Math.round(70 + Math.min(30, (configured / total) * 60))) : 100;
  return { total, animated, scrollReveal, hover, parallax, sticky, timelines, reducedMotionReady: project.motionSystem.reducedMotion !== "disable", score };
}
