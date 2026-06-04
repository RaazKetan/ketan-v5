import React from "react";
import { StatusPage } from "../status/StatusPage";

/* 404 page. Rendered via the catch-all <Route path="*"> in App.tsx,
   so the URL the user typed is preserved while the body shows this
   page. RouteSEO sets noindex so the 404 doesn't pollute search. */
export const NotFound: React.FC = () => {
  return (
    <StatusPage
      code="404"
      eyebrow="Status 404 / Lost in the stack"
      titleHead="This"
      titleEm="page"
      titleTail="got away."
      body="Either the URL was mistyped, the link is stale, or this page never existed. Either way - here are a few places that do."
      strip={[
        "Mistyped URL",
        "Stale link",
        "Old bookmark",
        "Wrong slug",
        "Renamed route",
        "Try the nav above",
      ]}
      actions={[
        { label: "Back to home", to: "/" },
        { label: "See projects", to: "/projects" },
        { label: "Say hi", to: "/contact" },
      ]}
      seoTitle="404 - Page not found | Ketan Raj"
      seoDescription="The page you're looking for doesn't exist on Ketan Raj's portfolio."
    />
  );
};

export default NotFound;
