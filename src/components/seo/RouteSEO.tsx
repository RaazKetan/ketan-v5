import React, { useEffect } from "react";

type Props = {
  title: string;
  description?: string;
  path?: string;        // e.g. "/projects" - used to build canonical
  noIndex?: boolean;    // for 404 etc.
};

const SITE = "https://ketanraj.vercel.app";

/* Client-side SEO swap. Per-route titles + descriptions only run after
   hydration, but Googlebot executes JS, and the per-page title is still
   what the user sees in the tab. The static index.html keeps the safe
   defaults so any non-JS crawler still gets sensible meta. */
function upsertMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export const RouteSEO: React.FC<Props> = ({ title, description, path, noIndex }) => {
  useEffect(() => {
    document.title = title;
    const url = SITE + (path ?? window.location.pathname);

    if (description) {
      upsertMeta("description", description);
      upsertMeta("og:description", description, "property");
      upsertMeta("twitter:description", description);
    }
    upsertMeta("og:title", title, "property");
    upsertMeta("twitter:title", title);
    upsertMeta("og:url", url, "property");
    upsertCanonical(url);
    upsertMeta(
      "robots",
      noIndex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
    );
  }, [title, description, path, noIndex]);

  return null;
};
