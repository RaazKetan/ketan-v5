import React from "react";
import { DesignNav } from "@/components/design/DesignNav";
import { DesignFooter } from "@/components/design/DesignFooter";
import { SocialDock } from "@/components/design/SocialDock";

/* Page chrome shared by every route.

   Previously also mounted the floating chat widget on an idle callback —
   that, its lazy chunk and the showChat state all went with the agent. */

export const DesignLayout: React.FC<{
  children: React.ReactNode;
  hideFrame?: boolean;
  hideFooter?: boolean;
}> = ({ children, hideFrame, hideFooter }) => (
  <>
    <div className="progress" />
    {!hideFrame && <div className="frame" />}
    <DesignNav />
    <SocialDock />
    {children}
    {!hideFooter && <DesignFooter />}
  </>
);
