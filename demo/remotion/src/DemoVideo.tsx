import React from "react";
import { Video } from "@remotion/media";
import { AbsoluteFill, type CalculateMetadataFunction, Series, staticFile } from "remotion";
import { z } from "zod";
import { Captions } from "./Captions";
import { Intro } from "./Intro";
import { Outro } from "./Outro";

export const FPS = 30;
export const INTRO_S = 5;
export const OUTRO_S = 5;

export const demoSchema = z.object({
  // Put your Playwright recording at demo/remotion/public/recording.webm (or change this name).
  recordingSrc: z.string(),
  // The length of YOUR recording in seconds — edit to match (so the timeline fits exactly).
  recordingSeconds: z.number(),
  // Lower-third captions, timed in seconds RELATIVE TO THE START OF THE RECORDING. Tweak to match.
  cues: z.array(z.object({ from: z.number(), to: z.number(), label: z.string(), sub: z.string() })),
});
export type DemoProps = z.infer<typeof demoSchema>;

export const DEFAULT_PROPS: DemoProps = {
  recordingSrc: "recording.webm",
  recordingSeconds: 150,
  cues: [
    { from: 0, to: 9, label: "Load ticket", sub: "Sphinx pulls the assigned ticket from the Phoenix ERP" },
    { from: 9, to: 42, label: "Diagnose", sub: "Read-only diagnostics stream automatically — fully traced" },
    { from: 42, to: 78, label: "Human approves the fix", sub: "Every write is gated: approve · edit · reject" },
    { from: 78, to: 104, label: "Validate", sub: "Service active · the fix persists across reboot" },
    { from: 104, to: 150, label: "Document → ERP", sub: "Clean activity written back, full audit trail" },
  ],
};

export const calculateDemoMetadata: CalculateMetadataFunction<DemoProps> = async ({ props }) => ({
  durationInFrames: Math.ceil((INTRO_S + props.recordingSeconds + OUTRO_S) * FPS),
});

export const DemoVideo: React.FC<DemoProps> = ({ recordingSrc, recordingSeconds, cues }) => (
  <AbsoluteFill style={{ backgroundColor: "#080b11" }}>
    <Series>
      <Series.Sequence durationInFrames={INTRO_S * FPS}>
        <Intro />
      </Series.Sequence>
      <Series.Sequence durationInFrames={Math.max(1, Math.ceil(recordingSeconds * FPS))}>
        <AbsoluteFill>
          <Video src={staticFile(recordingSrc)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <Captions cues={cues} />
        </AbsoluteFill>
      </Series.Sequence>
      <Series.Sequence durationInFrames={OUTRO_S * FPS}>
        <Outro />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);
