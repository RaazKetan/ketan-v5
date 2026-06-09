import React from "react";
import { StatusPage } from "@/components/pages/status/StatusPage";

type Props = { children: React.ReactNode };
type State = { error: Error | null };

/* Top-level error boundary. Catches uncaught render errors from anywhere
   in the route tree and renders the same StatusPage surface as 404,
   themed for the crash case. URL is preserved so the user can copy +
   share what they were doing. "Try again" reloads the current URL. */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    /* In dev: surface in the console so the stack is one click away.
       In prod: console.error only (no remote logging yet). */
    if (typeof console !== "undefined") {
      console.error("[ErrorBoundary] uncaught render error", error, info);
    }
  }

  handleRetry = () => {
    /* Don't try to clearState() and re-render — if the bug is in a
       memoized hook the same crash repeats. Hard reload is the simple
       correct fallback. */
    if (typeof window !== "undefined") window.location.reload();
  };

  render() {
    if (this.state.error) {
      const isDev =
        typeof window !== "undefined" &&
        (window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1");

      const body = isDev
        ? `Something snapped while rendering this page. ${this.state.error.message ? `Error: ${this.state.error.message}` : ""}`
        : "Something snapped while rendering this page. The full error went to the console. Try reloading, or head somewhere else.";

      return (
        <StatusPage
          code="500"
          eyebrow="Status 500 / Render error"
          titleHead="Something"
          titleEm="snapped"
          titleTail="here."
          body={body}
          strip={[
            "Unexpected state",
            "Try a reload",
            "Or head home",
            "Tell Ketan if it persists",
          ]}
          actions={[
            { label: "Try again", onClick: this.handleRetry, primary: true },
            { label: "Back to home", href: "/" },
            { label: "Report it", href: "mailto:21ketanraaz@gmail.com?subject=ketanraj.com%20render%20error" },
          ]}
          seoTitle="Error - Ketan Raj"
          noIndex
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
