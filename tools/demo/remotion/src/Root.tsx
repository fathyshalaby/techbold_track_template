import type React from "react";
import { Composition } from "remotion";
import { DEFAULT_PROPS, DemoVideo, FPS, calculateDemoMetadata, demoSchema } from "./DemoVideo";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="SphinxDemo"
    component={DemoVideo}
    schema={demoSchema}
    defaultProps={DEFAULT_PROPS}
    fps={FPS}
    width={1440}
    height={900}
    durationInFrames={160 * FPS}
    calculateMetadata={calculateDemoMetadata}
  />
);
