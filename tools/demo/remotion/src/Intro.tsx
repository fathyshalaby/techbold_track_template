import { loadFont } from "@remotion/google-fonts/IBMPlexSans";
import type React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const { fontFamily } = loadFont();

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 } });
  const y = interpolate(s, [0, 1], [24, 0]);
  const opacity = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });
  const line = interpolate(s, [0, 1], [0, 300]);

  return (
    <AbsoluteFill
      style={{
        fontFamily,
        justifyContent: "center",
        alignItems: "center",
        background:
          "radial-gradient(900px 520px at 18% 8%, #2dd4bf22, transparent 60%)," +
          "radial-gradient(820px 600px at 100% 0%, #5b9dff18, transparent 55%), #080b11",
      }}
    >
      <div style={{ textAlign: "center", opacity, transform: `translateY(${y}px)` }}>
        <div style={{ letterSpacing: 10, color: "#2dd4bf", fontSize: 24, fontWeight: 600 }}>
          TEAM&nbsp;&nbsp;SPHINX
        </div>
        <div
          style={{
            fontSize: 92,
            fontWeight: 700,
            color: "#e8eef6",
            marginTop: 10,
            letterSpacing: -1,
          }}
        >
          AI Service Desk Autopilot
        </div>
        <div
          style={{
            height: 3,
            width: line,
            background: "#2dd4bf",
            margin: "26px auto",
            borderRadius: 2,
          }}
        />
        <div style={{ color: "#93a1b4", fontSize: 28 }}>
          reads tickets · fixes Linux over SSH · documents it back
        </div>
      </div>
    </AbsoluteFill>
  );
};
