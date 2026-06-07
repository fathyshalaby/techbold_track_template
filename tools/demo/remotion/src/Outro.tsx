import { loadFont } from "@remotion/google-fonts/IBMPlexSans";
import type React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

const { fontFamily } = loadFont();

const FACTS = [
  "Two interchangeable backends · one shared safety core",
  "Deterministic deny-list · secrets scrubbed before they reach the LLM",
  "Every action human-gated, logged, and reversible",
];

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        justifyContent: "center",
        alignItems: "center",
        background: "radial-gradient(900px 520px at 50% 50%, #2dd4bf18, transparent 60%), #080b11",
      }}
    >
      <div style={{ textAlign: "center", opacity }}>
        <div style={{ fontSize: 76, fontWeight: 700, color: "#e8eef6", letterSpacing: -1 }}>
          Sphinx
        </div>
        <div style={{ color: "#2dd4bf", letterSpacing: 6, fontSize: 18, marginTop: 6 }}>
          AI SERVICE DESK AUTOPILOT
        </div>
        <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 10 }}>
          {FACTS.map((f, i) => {
            const op = interpolate(frame, [10 + i * 8, 22 + i * 8], [0, 1], {
              extrapolateRight: "clamp",
            });
            return (
              <div key={i} style={{ color: "#93a1b4", fontSize: 24, opacity: op }}>
                <span style={{ color: "#2dd4bf" }}>›</span> {f}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
