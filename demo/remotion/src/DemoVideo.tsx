import React from "react";
import { Video } from "@remotion/media";
import { AbsoluteFill, Audio, type CalculateMetadataFunction, Series, staticFile } from "remotion";
import { z } from "zod";
import { audio } from "./audio-manifest";
import { Captions } from "./Captions";
import { Intro } from "./Intro";
import { Outro } from "./Outro";

export const FPS = 30;

export const demoSchema = z.object({
  // Put your Playwright recording at demo/remotion/public/recording.webm (or change this name).
  recordingSrc: z.string(),
  // The length of YOUR recording in seconds — it is time-fit to the narration body automatically.
  recordingSeconds: z.number(),
  // Lower-third captions, in seconds RELATIVE TO THE START OF THE RECORDING body (~53s). Tweak to taste.
  cues: z.array(z.object({ from: z.number(), to: z.number(), label: z.string(), sub: z.string() })),
});
export type DemoProps = z.infer<typeof demoSchema>;

export const DEFAULT_PROPS: DemoProps = {
  recordingSrc: "recording.webm",
  recordingSeconds: 90,
  cues: [
    { from: 0, to: 8, label: "Load ticket", sub: "Pulled from the Phoenix ERP · SSH target loaded" },
    { from: 8, to: 23, label: "Diagnose", sub: "Read-only diagnostics stream into a live trace" },
    { from: 23, to: 37, label: "Human approves the fix", sub: "Every write is gated: approve · edit · reject" },
    { from: 37, to: 45, label: "Validate", sub: "Service healthy · persists across reboot" },
    { from: 45, to: 54, label: "Document → ERP", sub: "Root cause + commands + proof, written back" },
  ],
};

export const calculateDemoMetadata: CalculateMetadataFunction<DemoProps> = async () => ({
  durationInFrames: Math.ceil(audio.totalSeconds * FPS),
});

export const DemoVideo: React.FC<DemoProps> = ({ recordingSrc, recordingSeconds, cues }) => {
  const bodyFrames = Math.max(1, Math.round(audio.bodySeconds * FPS));
  // Fit the recording to the narration body (speed up a long run, slow a short one).
  const playbackRate = Math.min(4, Math.max(0.5, recordingSeconds / audio.bodySeconds));

  return (
    <AbsoluteFill style={{ backgroundColor: "#080b11" }}>
      <Audio src={staticFile(audio.vo)} />
      <Audio src={staticFile(audio.music)} volume={0.7} />
      <Series>
        <Series.Sequence durationInFrames={Math.round(audio.introSeconds * FPS)}>
          <Intro />
        </Series.Sequence>
        <Series.Sequence durationInFrames={bodyFrames}>
          <AbsoluteFill>
            <Video
              src={staticFile(recordingSrc)}
              muted
              playbackRate={playbackRate}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <Captions cues={cues} />
          </AbsoluteFill>
        </Series.Sequence>
        <Series.Sequence durationInFrames={Math.round(audio.outroSeconds * FPS)}>
          <Outro />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
