import type { RefObject } from "react";

export interface HeroTitleProps {
  nameRef: RefObject<HTMLSpanElement | null>;
}