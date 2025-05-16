import type { RefObject } from "react";

export interface MainNavbarProps {
  collapsableDivRef: RefObject<HTMLDivElement | null>;
  backgroundDivRef: RefObject<HTMLDivElement | null>;
  mainNavbarRef: RefObject<HTMLDivElement | null>;
}
