import { useState, useEffect, useRef, type CSSProperties } from "react";
import { a as aWeb, useSpring as useWebSpring } from "@react-spring/web";
import ProjectProfile from "./components/ProjectProfile";
import ProjectPilgrim from "./components/ProjectPilgrim";
import ProjectFishMarket from "./components/ProjectFishMarket";
import ProjectPTF from "./components/ProjectPTF";
import ProjectOmah from "./components/ProjectOmah";
import ProjectCover, { getNextMiscGallery } from "./components/ProjectCover";
import { asset } from "./lib/asset";
import { BG_COLOR } from "./lib/theme";
import { usePhone } from "./lib/usePhone";
import VoronoiPortrait from "./components/VoronoiPortrait";
import { PROJECTS, type Project } from "./data/projects";

const LINE_COLOR = "#888888";

// --- small wireframe cube that tumbles (matches the dotted cube aesthetic) ---
// `size` is in em so the cube tracks the surrounding text height.
function RotatingCube({ size = 1 }: { size?: number }) {
  const half = size / 2;
  const face: CSSProperties = {
    position: "absolute",
    width: `${size}em`,
    height: `${size}em`,
    border: `1px dashed ${LINE_COLOR}`,
    boxSizing: "border-box",
  };
  return (
    <span
      style={{
        display: "inline-block",
        width: `${size}em`,
        height: `${size}em`,
        perspective: `${size * 3}em`,
        verticalAlign: "middle",
      }}
    >
      <span
        style={{
          position: "relative",
          display: "block",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          animation: "spin-cube 4s linear infinite",
        }}
      >
        <span style={{ ...face, transform: `translateZ(${half}em)` }} />
        <span style={{ ...face, transform: `rotateY(180deg) translateZ(${half}em)` }} />
        <span style={{ ...face, transform: `rotateY(90deg) translateZ(${half}em)` }} />
        <span style={{ ...face, transform: `rotateY(-90deg) translateZ(${half}em)` }} />
        <span style={{ ...face, transform: `rotateX(90deg) translateZ(${half}em)` }} />
        <span style={{ ...face, transform: `rotateX(-90deg) translateZ(${half}em)` }} />
      </span>
    </span>
  );
}

// The two project-navigation buttons at the foot of the screen.
const navButton: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  fontSize: "0.8rem",
  fontWeight: 300,
  color: "#333",
  border: "none",
  padding: 0,
  background: "transparent",
  cursor: "crosshair",
  pointerEvents: "auto",
};

export default function App() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [openMiscGallery, setOpenMiscGallery] = useState<string | null>(null);
  const projects = PROJECTS;
  const [showCV, setShowCV] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const phone = usePhone();
  // the project page is its own scroll container, so resetting scroll means scrolling this node
  const projectPageRef = useRef<HTMLDivElement | null>(null);

  // Step through projects, or through galleries while miscellaneous is open.
  const goToProject = (step: 1 | -1) => {
    if (selectedProject?.title === "miscellaneous" && openMiscGallery) {
      setOpenMiscGallery(step === -1 ? null : getNextMiscGallery(openMiscGallery));
      projectPageRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }
    if (!selectedProject || projects.length === 0) return;
    const idx = projects.findIndex((p) => p.title === selectedProject.title);
    const next = projects[(idx + step + projects.length) % projects.length];
    setSelectedProject(next);
    setOpenMiscGallery(null);
    // jump back to the top of the new project page
    projectPageRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProject(null);
        setOpenMiscGallery(null);
        setShowCV(false);
        setShowContact(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const popupSpring = useWebSpring({
    opacity: selectedProject ? 1 : 0,
    transform: selectedProject ? "translateY(0%)" : "translateY(5%)",
    config: { tension: 200, friction: 20 },
  });

  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {/* Fonts + Styles */}
      <link
        href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        html, body, #root { height: 100%; }
        body { margin: 0; font-family: 'Open Sans', sans-serif; cursor: crosshair; background: ${BG_COLOR}; }
        a, button { cursor: crosshair; }
        @keyframes spin-cube {
          from { transform: rotateX(-25deg) rotateY(0deg); }
          to   { transform: rotateX(-25deg) rotateY(360deg); }
        }
      `}</style>

      {/* Header. On phones the logo grows, the name and the portfolio label sit
          on one line pushed to opposite edges, and navigation drops to a bar at
          the bottom of the screen. */}
      <h1
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          right: "20px",
          margin: 0,
          fontSize: phone ? "0.95rem" : "1.05rem",
          fontWeight: 300,
          color: "#333",
          zIndex: 10,
          pointerEvents: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: phone ? "10px" : 0 }}>
          <img
            src={asset("/joelle.png")}
            alt=""
            style={{
              // Sized in `em` so it always tracks the header text height —
              // keep it em-based whenever the opening-page text/font changes.
              // px on phones so the logo size is independent of the type size
              // (em elsewhere, so it tracks the header text height)
              height: phone ? "58px" : "1em",
              width: "auto",
              verticalAlign: "middle",
              marginRight: phone ? 0 : "8px",
              flexShrink: 0,
            }}
          />
          <span style={{ color: "#000", fontWeight: 600, whiteSpace: "nowrap" }}>
            joelle warsono
          </span>
          {!phone && <>&nbsp;architectural portfolio</>}
        </span>
        {phone ? (
          // one line: the label is pushed to the opposite edge by the h1's
          // space-between
          <span style={{ whiteSpace: "nowrap" }}>architectural portfolio</span>
        ) : (
          <span style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span
              onClick={() => setShowContact(true)}
              style={{
                pointerEvents: "auto",
                cursor: "crosshair",
                textDecoration: "underline",
              }}
            >
              contact
            </span>
            <button
              onClick={() => setSelectedProject(projects[0] ?? null)}
              style={{
                ...navButton,
                font: "inherit",
                textDecoration: "underline",
              }}
            >
              projects
            </button>
            <span
              onClick={() => setShowCV(true)}
              style={{
                pointerEvents: "auto",
                cursor: "crosshair",
                textDecoration: "underline",
              }}
            >
              cv
            </span>
          </span>
        )}
      </h1>

      {/* On phones the front-page navigation lives at the bottom of the screen. */}
      {phone && (
        <div
          style={{
            position: "absolute",
            left: "20px",
            right: "20px",
            bottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "1.05rem",
            fontWeight: 300,
            color: "#333",
            zIndex: 10,
          }}
        >
          <span
            onClick={() => setShowContact(true)}
            style={{ cursor: "crosshair", textDecoration: "underline" }}
          >
            contact
          </span>
          <button
            onClick={() => setSelectedProject(projects[0] ?? null)}
            style={{
              ...navButton,
              font: "inherit",
              textDecoration: "underline",
            }}
          >
            projects
          </button>
          <span
            onClick={() => setShowCV(true)}
            style={{ cursor: "crosshair", textDecoration: "underline" }}
          >
            cv
          </span>
        </div>
      )}

      <VoronoiPortrait phone={phone} active={!selectedProject && !showCV && !showContact} />

      {/* Project Page */}
      {selectedProject && (
        <>
          <aWeb.div
            ref={projectPageRef}
          style={{
            ...popupSpring,
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: BG_COLOR,
            zIndex: 20,
            overflowY: "auto",
            overflowX: "hidden",
            // leave room for the nav bar fixed at the foot of the screen
            paddingBottom: phone
              ? "calc(68px + env(safe-area-inset-bottom, 0px))"
              : "72px",
          }}
        >
          {/* Title + description (Omah / Pilgrim / Fish Market / PTF render their own title inside their component) */}
          {selectedProject.title !== "Omah Mimpi" && selectedProject.title !== "Ode to the Modern Pilgrim" && selectedProject.title !== "Røyk — A Bergen Fish Market" && selectedProject.title !== "Peter Tatchell Foundation" && selectedProject.title !== "Waters of Unfinished Maps: Reinscribing the Malacca Strait" && selectedProject.title !== "miscellaneous" && (
            <div
              style={{
                display: "flex",
                padding: "40px 20px 0 20px",
                boxSizing: "border-box",
                width: "100%",
              }}
            >
              <div
                style={{
                  width: "33.3%",
                  padding: "0 40px",
                  boxSizing: "border-box",
                }}
              >
                <h1 style={{ fontSize: "0.9rem", fontWeight: 300, margin: 0 }}>
                  {selectedProject.title}
                </h1>
              </div>
            </div>
          )}

          {selectedProject.title === "Waters of Unfinished Maps: Reinscribing the Malacca Strait" ? (
            <ProjectProfile title={selectedProject.title} />
          ) : selectedProject.title === "Ode to the Modern Pilgrim" ? (
            <ProjectPilgrim title={selectedProject.title} description={selectedProject.description} images={selectedProject.images} />
          ) : selectedProject.title === "Røyk — A Bergen Fish Market" ? (
            <ProjectFishMarket title={selectedProject.title} description={selectedProject.description} images={selectedProject.images} />
          ) : selectedProject.title === "Peter Tatchell Foundation" ? (
            <ProjectPTF title={selectedProject.title} description={selectedProject.description} images={selectedProject.images} />
          ) : selectedProject.title === "Omah Mimpi" ? (
            <ProjectOmah title={selectedProject.title} description={selectedProject.description} images={selectedProject.images} />
          ) : selectedProject.title === "miscellaneous" ? (
            <ProjectCover
              openId={openMiscGallery}
              onOpenGallery={(id) => {
                setOpenMiscGallery(id);
                projectPageRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
              }}
            />
          ) : null}

        </aWeb.div>

        {/* The ✕ and the nav bar sit OUTSIDE the page above. That element
            carries react-spring's transform, which makes it the containing
            block for any `position: fixed` descendant — so pinned controls
            inside it scroll away with the content instead of staying put. */}
          {/* Close button */}
        <button
          onClick={() => {
            setSelectedProject(null);
            setOpenMiscGallery(null);
          }}
          style={{
            position: "fixed",
            top: "20px",
            // on phones it lines up with the 20px page margin; `padding: 0`
            // keeps the glyph itself flush rather than the button box
            right: phone ? "20px" : "30px",
            padding: 0,
            fontSize: "1.2rem",
            lineHeight: 1,
            border: "none",
            background: "transparent",
            // buttons inherit the UA default colour otherwise, which is
            // system blue on iOS
            color: "#000",
            cursor: "crosshair",
            zIndex: 1000,
          }}
        >
          ✕
        </button>

        {/* Project navigation, fixed to the foot of the screen. The bar itself
            ignores pointer events so the page still scrolls under it; only the
            two buttons are clickable. */}
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            backgroundColor: BG_COLOR,
            // on phones, clear the home indicator / browser chrome
            padding: phone
              ? "12px 20px calc(16px + env(safe-area-inset-bottom, 0px)) 20px"
              : "14px 30px 20px 30px",
            boxSizing: "border-box",
            zIndex: 900,
            pointerEvents: "none",
          }}
        >
          <button onClick={() => goToProject(-1)} style={{ ...navButton, justifySelf: "start" }}>
            <span style={{ textDecoration: "underline" }}>← back</span>
          </button>
          <span aria-hidden="true" style={{ display: "flex", fontSize: "0.8rem" }}>
            <RotatingCube />
          </span>
          <button onClick={() => goToProject(1)} style={{ ...navButton, justifySelf: "end" }}>
            <span style={{ textDecoration: "underline" }}>next →</span>
          </button>
        </div>
        </>
      )}

      {/* CV Page */}
      {showCV && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: BG_COLOR,
            zIndex: 30,
            overflowY: "auto",
            padding: "60px 60px 60px 60px",
            boxSizing: "border-box",
          }}
        >
          <h1 style={{ fontSize: "0.9rem", fontWeight: 300, margin: "0 0 24px 0" }}>
            cv
          </h1>
          <p style={{ fontSize: "0.7rem", fontWeight: 300, margin: 0 }}>
            CV content goes here.
          </p>

          <button
            onClick={() => setShowCV(false)}
            style={{
              position: "fixed",
              top: "20px",
              // on phones it lines up with the 20px page margin; `padding: 0`
              // keeps the glyph itself flush rather than the button box
              right: phone ? "20px" : "30px",
              padding: 0,
              fontSize: "1.2rem",
              lineHeight: 1,
              border: "none",
              background: "transparent",
              // buttons inherit the UA default colour otherwise, which is
              // system blue on iOS
              color: "#000",
              cursor: "crosshair",
              zIndex: 1000,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Contact Page */}
      {showContact && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: BG_COLOR,
            zIndex: 30,
            overflowY: "auto",
            padding: "60px 60px 60px 60px",
            boxSizing: "border-box",
          }}
        >
          <h1 style={{ fontSize: "0.9rem", fontWeight: 300, margin: "0 0 24px 0" }}>
            contact
          </h1>
          <p style={{ fontSize: "0.7rem", fontWeight: 300, margin: "0 0 8px 0" }}>
            email:{" "}
            <a href="mailto:joellewarsono15@gmail.com" style={{ color: "inherit" }}>
              joellewarsono15@gmail.com
            </a>
          </p>
          <p style={{ fontSize: "0.7rem", fontWeight: 300, margin: "0 0 8px 0" }}>
            <a
              href="https://www.linkedin.com/in/joellewarsono"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "inherit" }}
            >
              linkedin
            </a>
          </p>

          <button
            onClick={() => setShowContact(false)}
            style={{
              position: "fixed",
              top: "20px",
              // on phones it lines up with the 20px page margin; `padding: 0`
              // keeps the glyph itself flush rather than the button box
              right: phone ? "20px" : "30px",
              padding: 0,
              fontSize: "1.2rem",
              lineHeight: 1,
              border: "none",
              background: "transparent",
              // buttons inherit the UA default colour otherwise, which is
              // system blue on iOS
              color: "#000",
              cursor: "crosshair",
              zIndex: 1000,
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
