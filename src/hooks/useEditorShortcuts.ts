import { useEffect } from "react";
import { useBuilder } from "../store/builder";

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName?.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
}

export function useEditorShortcuts(enabled = true) {
  const { selectedId, undo, redo, copyNode, pasteNode, duplicateNode, deleteNode, setSelected } = useBuilder();

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      const mod = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (mod && key === "z") {
        event.preventDefault();
        event.shiftKey ? redo() : undo();
        return;
      }
      if (mod && key === "y") {
        event.preventDefault();
        redo();
        return;
      }
      if (mod && key === "c" && selectedId) {
        event.preventDefault();
        copyNode(selectedId);
        return;
      }
      if (mod && key === "x" && selectedId) {
        event.preventDefault();
        copyNode(selectedId);
        deleteNode(selectedId);
        return;
      }
      if (mod && key === "v") {
        event.preventDefault();
        pasteNode(null);
        return;
      }
      if (mod && key === "d" && selectedId) {
        event.preventDefault();
        duplicateNode(selectedId);
        return;
      }
      if ((event.key === "Delete" || event.key === "Backspace") && selectedId) {
        event.preventDefault();
        deleteNode(selectedId);
        return;
      }
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, selectedId, undo, redo, copyNode, pasteNode, duplicateNode, deleteNode, setSelected]);
}
