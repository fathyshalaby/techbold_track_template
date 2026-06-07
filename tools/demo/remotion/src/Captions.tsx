import { loadFont } from "@remotion/google-fonts/IBMPlexSans";
import type React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

const { fontFamily } = loadFont();

export type Cue = { from: number; to: number; label: string; sub: string };

// Lower-third captions over the recording. `from`/`to` are seconds within the recording sequence.
export const Captions: React.FC<{ cues: Cue[] }> = ({ cues }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const active = cues.find((c) => t >= c.from && t < c.to);
  if (!active) return null;

  const local = frame - active.from * fps;
  const span = (active.to - active.from) * fps;
  const opacity = interpolate(local, [0, 8, span - 8, span], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const x = interpolate(local, [0, 10], [-18, 0], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        left: 44,
        bottom: 44,
        opacity,
        transform: `translateX(${x}px)`,
        fontFamily,
      }}
    >
      <div
        style={{
          display: "inline-block",
          background: "#2dd4bf",
          color: "#04130f",
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: 0.3,
          padding: "8px 16px",
          borderRadius: 10,
          boxShadow: "0 10px 40px -12px #2dd4bf",
        }}
      >
        {active.label}
      </div>
      <div
        style={{
          marginTop: 10,
          maxWidth: 760,
          color: "#e8eef6",
          fontSize: 24,
          lineHeight: 1.35,
          background: "#0a0e16cc",
          backdropFilter: "blur(6px)",
          border: "1px solid #1b2433",
          padding: "10px 14px",
          borderRadius: 10,
        }}
      >
        {active.sub}
      </div>
    </div>
  );
};
