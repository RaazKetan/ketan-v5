import React from "react";

/* Hand-rolled SVG icons matching the mono/serif minimal aesthetic:
   1.5px strokes, 18px viewBox, currentColor so they inherit text color. */

type IconProps = { size?: number; className?: string };

const wrap = (path: React.ReactNode, size = 16, className = "") => (
  <svg
    viewBox="0 0 18 18"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className={className}
  >
    {path}
  </svg>
);

export const ChatIcon: React.FC<IconProps> = ({ size, className }) =>
  wrap(
    <>
      <path d="M3 4.5C3 3.67 3.67 3 4.5 3h9c.83 0 1.5.67 1.5 1.5v6c0 .83-.67 1.5-1.5 1.5H8l-3 3v-3H4.5C3.67 12 3 11.33 3 10.5v-6Z" />
    </>,
    size,
    className
  );

export const CloseIcon: React.FC<IconProps> = ({ size, className }) =>
  wrap(<><path d="M4 4l10 10M14 4L4 14" /></>, size, className);

export const SendIcon: React.FC<IconProps> = ({ size, className }) =>
  wrap(<><path d="M3 9h12M10 4l5 5-5 5" /></>, size, className);

export const MicIcon: React.FC<IconProps> = ({ size, className }) =>
  wrap(
    <>
      <rect x="7" y="2" width="4" height="9" rx="2" />
      <path d="M4 9a5 5 0 0 0 10 0M9 14v2" />
    </>,
    size,
    className
  );

export const StopIcon: React.FC<IconProps> = ({ size, className }) =>
  wrap(<><rect x="5" y="5" width="8" height="8" rx="1" /></>, size, className);

export const SpeakerOn: React.FC<IconProps> = ({ size, className }) =>
  wrap(
    <>
      <path d="M3 7v4h2l3.5 3V4L5 7H3Z" />
      <path d="M11 6c1 .8 1.5 1.8 1.5 3s-.5 2.2-1.5 3" />
      <path d="M13 4c1.6 1.3 2.5 3.1 2.5 5s-.9 3.7-2.5 5" />
    </>,
    size,
    className
  );

export const SpeakerOff: React.FC<IconProps> = ({ size, className }) =>
  wrap(
    <>
      <path d="M3 7v4h2l3.5 3V4L5 7H3Z" />
      <path d="M11 7l4 4M15 7l-4 4" />
    </>,
    size,
    className
  );

export const PlayIcon: React.FC<IconProps> = ({ size, className }) =>
  wrap(<><path d="M6 4l8 5-8 5V4Z" /></>, size, className);

/* Three vertical bars — a small "speaking" indicator. Animation is in CSS. */
export const WaveIcon: React.FC<IconProps> = ({ size, className }) => (
  <svg
    viewBox="0 0 18 18"
    width={size ?? 16}
    height={size ?? 16}
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    className={className}
  >
    <rect className="wave-bar wave-bar-1" x="3" y="6" width="2" height="6" rx="1" />
    <rect className="wave-bar wave-bar-2" x="8" y="4" width="2" height="10" rx="1" />
    <rect className="wave-bar wave-bar-3" x="13" y="7" width="2" height="4" rx="1" />
  </svg>
);
