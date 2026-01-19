/* eslint-disable react-hooks/set-state-in-effect */
import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: ReactNode;
}

export function Portal({ children }: PortalProps) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const portalContainer = document.createElement("div");
    portalContainer.id = "token-selector-portal";
    document.body.appendChild(portalContainer);
    setContainer(portalContainer);

    return () => {
      if (document.body.contains(portalContainer)) {
        document.body.removeChild(portalContainer);
      }
    };
  }, []);

  if (!container) return null;
  return createPortal(children, container);
}