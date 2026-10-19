import { Sparkles, Zap } from "lucide-react";

export default function SplashScreen() {
  return <main className="splash-screen">
    <div className="splash-orb splash-orb-a"/><div className="splash-orb splash-orb-b"/>
    <section className="splash-card">
      <div className="splash-logo"><Zap size={28}/></div>
      <div className="splash-title"><span>Nila</span> Webs</div>
      <p>Visual React + Vite Website Builder</p>
      <div className="splash-loader"><i/><i/><i/><i/></div>
      <div className="splash-caption"><Sparkles size={12}/>Loading your workspace</div>
    </section>
  </main>;
}
