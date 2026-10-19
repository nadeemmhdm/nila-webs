import { useEffect, useState } from "react";
import type { BuilderProject } from "../types";
import { resolveAssetRef } from "../lib/assets";

export function useAssetSource(project: BuilderProject, src?: string) {
  const [resolved, setResolved] = useState(src || "");
  useEffect(() => {
    let active = true;
    let revoke: (() => void) | undefined;
    if (!src?.startsWith("asset://")) { setResolved(src || ""); return; }
    resolveAssetRef(project, src).then(result => {
      if (!active) { result.revoke?.(); return; }
      revoke = result.revoke;
      setResolved(result.url);
    }).catch(() => active && setResolved(""));
    return () => { active = false; revoke?.(); };
  }, [project.id, project.assets, src]);
  return resolved;
}
