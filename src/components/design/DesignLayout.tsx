import React from "react";
import { DesignNav } from "./DesignNav";
import { DesignFooter } from "./DesignFooter";
import { SocialDock } from "./SocialDock";
import { ChatWidget } from "../Chat/ChatWidget";

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
    <ChatWidget />
  </>
);
