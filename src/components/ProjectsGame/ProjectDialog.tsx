import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { GitHubProject } from "../../Hooks/useGitHubRepos";

interface ProjectDialogProps {
  project: GitHubProject | null;
  onClose: () => void;
}

export const ProjectDialog: React.FC<ProjectDialogProps> = ({
  project,
  onClose,
}) => {
  // Close on Escape
  useEffect(() => {
    if (!project) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="dialog-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          <motion.div
            key="dialog-card"
            initial={{ scale: 0.82, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.82, y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
              border: "3px solid #374151",
              borderRadius: "16px",
              maxWidth: "560px",
              width: "100%",
              overflow: "hidden",
              boxShadow: "0 0 0 4px rgba(0,0,0,0.4), 0 24px 60px rgba(0,0,0,0.6)",
              fontFamily: "'Courier New', Courier, monospace",
              position: "relative",
            }}
          >
            {/* Color accent strip */}
            <div
              style={{
                height: "4px",
                background: `linear-gradient(90deg, ${project.color}, ${project.color}88)`,
              }}
            />

            {/* Header */}
            <div
              style={{
                padding: "1.5rem 1.5rem 1rem",
                borderBottom: "2px solid #374151",
                background: `${project.color}12`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2
                    style={{
                      margin: "0 0 0.5rem",
                      fontSize: "1.6rem",
                      fontWeight: 700,
                      color: "#f9fafb",
                      letterSpacing: "0.03em",
                      wordBreak: "break-word",
                    }}
                  >
                    {project.name}
                  </h2>

                  {/* Language badge */}
                  {project.language && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        background: "#111827",
                        border: `2px solid ${project.color}55`,
                        borderRadius: "6px",
                        padding: "2px 10px",
                        fontSize: "0.72rem",
                        color: project.color,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: project.color,
                          display: "inline-block",
                        }}
                      />
                      {project.language}
                    </span>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={onClose}
                  style={{
                    background: "#374151",
                    border: "2px solid #4b5563",
                    borderRadius: "8px",
                    color: "#9ca3af",
                    cursor: "pointer",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.2rem",
                    flexShrink: 0,
                    fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#4b5563";
                    (e.currentTarget as HTMLButtonElement).style.color = "#f9fafb";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#374151";
                    (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af";
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "1.25rem 1.5rem" }}>
              {/* Description */}
              <p
                style={{
                  margin: "0 0 1.25rem",
                  color: "#d1d5db",
                  lineHeight: 1.7,
                  fontSize: "0.95rem",
                }}
              >
                {project.description}
              </p>

              {/* Topics */}
              {project.topics.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.4rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  {project.topics.slice(0, 8).map((t) => (
                    <span
                      key={t}
                      style={{
                        background: "#1f2937",
                        border: "2px solid #374151",
                        borderRadius: "6px",
                        padding: "2px 10px",
                        fontSize: "0.68rem",
                        color: "#9ca3af",
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Stars */}
              {project.stargazers_count > 0 && (
                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "#6b7280",
                    marginBottom: "1.25rem",
                  }}
                >
                  ⭐ {project.stargazers_count} star
                  {project.stargazers_count !== 1 ? "s" : ""}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <a
                  href={project.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                    background: "linear-gradient(135deg, #374151, #4b5563)",
                    border: "2px solid #4b5563",
                    borderRadius: "10px",
                    color: "#f9fafb",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    padding: "0.65rem 1rem",
                    textDecoration: "none",
                    letterSpacing: "0.04em",
                    transition: "all 0.15s",
                    fontFamily: "inherit",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "linear-gradient(135deg, #4b5563, #6b7280)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "#6b7280";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "linear-gradient(135deg, #374151, #4b5563)";
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "#4b5563";
                  }}
                >
                  💻 GitHub
                </a>

                {project.homepage && (
                  <a
                    href={project.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.4rem",
                      background: `linear-gradient(135deg, ${project.color}cc, ${project.color}88)`,
                      border: `2px solid ${project.color}`,
                      borderRadius: "10px",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      padding: "0.65rem 1rem",
                      textDecoration: "none",
                      letterSpacing: "0.04em",
                      transition: "all 0.15s",
                      fontFamily: "inherit",
                    }}
                  >
                    🚀 Live Demo
                  </a>
                )}
              </div>
            </div>

            {/* Hint */}
            <div
              style={{
                padding: "0.5rem 1.5rem 0.75rem",
                fontSize: "0.68rem",
                color: "#4b5563",
                textAlign: "center",
                letterSpacing: "0.06em",
              }}
            >
              [ ESC ] or click outside to close
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
