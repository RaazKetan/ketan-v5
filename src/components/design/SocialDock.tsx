import React from "react";
import { useLocation } from "react-router-dom";
import { usePersonalData } from "../../context/PersonalDataContext";

/* Vertical social-link dock pinned to the left edge of every page
   except /contact. Desktop only — hidden below 1024px via CSS so it
   doesn't crowd phones/tablets. */

type Item = { label: string; href: string; icon: React.ReactNode };

const wrap = (path: React.ReactNode) => (
  <svg
    viewBox="0 0 20 20"
    width="14"
    height="14"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    {path}
  </svg>
);

const GitHubIcon = wrap(
  <path d="M10 0C4.477 0 0 4.484 0 10.017c0 4.426 2.865 8.18 6.839 9.504.5.09.682-.218.682-.484 0-.236-.009-.866-.014-1.7-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 10 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.31.678.921.678 1.856 0 1.339-.012 2.42-.012 2.749 0 .268.18.58.688.482A10.02 10.02 0 0 0 20 10.017C20 4.484 15.522 0 10 0Z" />
);

const LinkedInIcon = wrap(
  <path d="M17.04 17.04h-2.96V12.4c0-1.108-.02-2.533-1.544-2.533-1.546 0-1.782 1.207-1.782 2.454v4.72H7.798V7.5h2.84v1.305h.04c.395-.75 1.36-1.54 2.798-1.54 2.992 0 3.544 1.97 3.544 4.532v5.243ZM4.46 6.196a1.715 1.715 0 1 1 0-3.43 1.715 1.715 0 0 1 0 3.43Zm1.482 10.844H2.978V7.5h2.964v9.54ZM18.518 0H1.477C.66 0 0 .645 0 1.44v17.12C0 19.356.66 20 1.477 20h17.041c.816 0 1.482-.644 1.482-1.44V1.44C20 .645 19.334 0 18.518 0Z" />
);

const MediumIcon = wrap(
  <path d="M2.846 6.887c.03-.295-.083-.586-.303-.784L.287 3.355V3H7.39l5.493 12.045L17.71 3H24v.355l-1.847 1.77a.54.54 0 0 0-.205.518v13c-.03.184.04.37.205.495l1.804 1.769v.354h-9.071v-.354l1.868-1.812c.183-.183.183-.236.183-.518V8.282L11.547 21.5h-.703L5.806 8.282v8.857c-.05.373.074.748.336 1.02L8.59 21v.354h-6.9V21l2.448-2.84c.262-.273.378-.652.317-1.02V6.887Z" />
);

const MailIcon = wrap(
  <path d="M3 4h14a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm.7 1.6 6.3 4.4 6.3-4.4-.4-.6H4.1l-.4.6ZM4 6.96V14.4h12V6.96l-6 4.2-6-4.2Z" />
);

const TopmateIcon = wrap(
  <path d="M10 1 1.7 5v4.4C1.7 14.6 5.27 19.5 10 21c4.73-1.5 8.3-6.4 8.3-11.6V5L10 1Zm0 2.2 6.3 3v3.2c0 4.2-2.8 8.2-6.3 9.4-3.5-1.2-6.3-5.2-6.3-9.4V6.2L10 3.2Zm-1.1 4.6v3.4H6.7v1.6h2.2v3.4h2.2v-3.4h2.2v-1.6h-2.2V7.8H8.9Z" />
);

export const SocialDock: React.FC = () => {
  const { pathname } = useLocation();
  const { contactInfo } = usePersonalData();

  if (pathname.startsWith("/contact")) return null;

  const items: Item[] = [
    { label: "GitHub", href: contactInfo.github, icon: GitHubIcon },
    { label: "LinkedIn", href: contactInfo.linkedin, icon: LinkedInIcon },
    { label: "Medium", href: contactInfo.medium, icon: MediumIcon },
    { label: "Topmate", href: contactInfo.topmate, icon: TopmateIcon },
    { label: "Email", href: `mailto:${contactInfo.email}`, icon: MailIcon },
  ];

  return (
    <aside className="social-dock" aria-label="Social links">
      <span className="social-dock-line" />
      <ul>
        {items.map((s) => (
          <li key={s.label}>
            <a
              href={s.href}
              target={s.href.startsWith("mailto") ? undefined : "_blank"}
              rel={s.href.startsWith("mailto") ? undefined : "noreferrer"}
              aria-label={s.label}
              title={s.label}
              data-magnet="0.2"
            >
              {s.icon}
            </a>
          </li>
        ))}
      </ul>
      <span className="social-dock-line" />
      <style>{styles}</style>
    </aside>
  );
};

const styles = `
  .social-dock {
    position: fixed; left: 22px; top: 50%; transform: translateY(-50%);
    z-index: 55;
    display: flex; flex-direction: column; align-items: center; gap: 14px;
    pointer-events: none;
  }
  .social-dock > * { pointer-events: auto; }
  .social-dock-line {
    width: 1px; height: 32px; background: var(--line);
  }
  .social-dock ul {
    list-style: none; margin: 0; padding: 8px 6px;
    display: flex; flex-direction: column; gap: 4px;
    border: 1px solid var(--line); border-radius: 999px;
    background: color-mix(in oklab, var(--bg) 88%, transparent);
    backdrop-filter: blur(6px);
  }
  .social-dock li a {
    display: inline-flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 50%;
    color: var(--ink-2);
    transition: color .25s var(--ease), background .25s var(--ease),
                transform .25s var(--ease);
  }
  .social-dock li a:hover {
    color: var(--accent);
    background: color-mix(in oklab, var(--accent) 10%, transparent);
  }

  /* Hide on tablets + phones — the dock crowds narrow viewports. */
  @media (max-width: 1024px) {
    .social-dock { display: none; }
  }
`;
