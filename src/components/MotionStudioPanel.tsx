import { Activity, Gauge, Layers3, MousePointer2, MoveVertical, Sparkles } from "lucide-react";
import { auditMotionProject } from "../lib/motion";
import { useBuilder } from "../store/builder";
import type { MotionTrigger, ReducedMotionMode } from "../types";

export default function MotionStudioPanel() {
  const { project, setMotionSystem, applyMotionDefaults } = useBuilder();
  const m = project.motionSystem;
  const audit = auditMotionProject(project);
  return <div className="panel-body motion-panel">
    <div className="panel-heading"><div><span className="panel-kicker">Phase 6</span><h2>Motion Studio</h2></div><Sparkles size={17}/></div>
    <p className="panel-copy">Set project motion defaults. Individual elements can override reveal, easing, parallax, sticky behavior and child timelines in Properties.</p>
    <div className="motion-health-card"><div className="motion-score"><Gauge size={18}/><strong>{audit.score}%</strong><span>motion ready</span></div><div className="motion-metrics"><span><Activity size={12}/>{audit.animated} animated</span><span><MoveVertical size={12}/>{audit.parallax} parallax</span><span><Layers3 size={12}/>{audit.timelines} timelines</span><span><MousePointer2 size={12}/>{audit.hover} hover</span></div></div>
    <label className="motion-field"><span>Motion system</span><label className="toggle-line"><input type="checkbox" checked={m.enabled} onChange={e=>setMotionSystem({enabled:e.target.checked})}/><b>{m.enabled?"Enabled":"Disabled"}</b></label></label>
    <label className="motion-field"><span>Default trigger</span><select value={m.defaultTrigger} onChange={e=>setMotionSystem({defaultTrigger:e.target.value as MotionTrigger})}><option value="scroll">Scroll reveal</option><option value="load">Page load</option><option value="always">Always / loop</option></select></label>
    <label className="motion-field"><span>Default duration</span><input type="number" min="0" step="0.05" value={m.defaultDuration} onChange={e=>setMotionSystem({defaultDuration:Math.max(0,Number(e.target.value))})}/></label>
    <label className="motion-field"><span>Default easing</span><input value={m.defaultEasing} onChange={e=>setMotionSystem({defaultEasing:e.target.value})}/></label>
    <label className="motion-field"><span>Scroll threshold</span><input type="number" min="0" max="1" step="0.05" value={m.scrollThreshold} onChange={e=>setMotionSystem({scrollThreshold:Math.max(0,Math.min(1,Number(e.target.value)))})}/></label>
    <label className="motion-field"><span>Timeline stagger</span><input type="number" min="0" step="0.02" value={m.defaultStagger} onChange={e=>setMotionSystem({defaultStagger:Math.max(0,Number(e.target.value))})}/></label>
    <label className="motion-field"><span>Parallax limit</span><input type="number" min="0" max="1" step="0.05" value={m.parallaxMax} onChange={e=>setMotionSystem({parallaxMax:Math.max(0,Math.min(1,Number(e.target.value)))})}/></label>
    <label className="motion-field"><span>Reduced motion</span><select value={m.reducedMotion} onChange={e=>setMotionSystem({reducedMotion:e.target.value as ReducedMotionMode})}><option value="respect">Respect OS preference</option><option value="reduce">Always reduce</option><option value="disable">Do not reduce</option></select></label>
    <button className="phase4-primary" onClick={applyMotionDefaults}><Sparkles size={13}/>Normalize all motion</button>
    <div className="prompt-safe-note">Scroll reveal uses IntersectionObserver, parallax is clamped, and reduced-motion support disables non-essential movement when requested.</div>
  </div>;
}
