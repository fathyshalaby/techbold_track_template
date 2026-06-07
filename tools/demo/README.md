# Sphinx — demo video pipeline

Two steps: **Playwright captures** a clean run of the console → **Remotion polishes** it into a
≤3-minute branded video.

## 1. Capture (Playwright) → a `.webm`

Prereq: the app running (frontend `:5173`, backend `:8000`) against live Phoenix (see repo README).

```bash
cd demo
npm install
npx playwright install chromium
node record.mjs            # opens a browser, drives ticket #7001, records to demo/recording/
```

- Drive a different ticket: `TICKET_TITLE="Document uploads fail with permission denied" node record.mjs`
- Output: `demo/recording/<id>.webm` — note its length in seconds.

> **Why you run this, not the agent:** clicking *Approve* makes the backend SSH a **write** to a
> real VM — that's your action as the technician. The product still gates every write behind a
> human; the script just auto-clicks (after a visible pause) for a clean take.

## 2. Polish (Remotion) → the final `.mp4`

```bash
cd demo && ./build-audio.sh               # VO (macOS say) + ambient bed → public/{vo,music}.mp3 + manifest
# premium voice: VOICE=Daniel ./build-audio.sh   ·   or drop in an ElevenLabs / your own vo.mp3
cd remotion
cp ../recording/<id>.webm public/recording.webm
npm install
npx remotion studio                       # preview live; tweak recordingSeconds + caption cues
npx remotion render SphinxDemo out/sphinx-demo.mp4
```

The composition auto-composites the **voiceover + ducked background music** and time-fits your recording
to the narration (~73s total). `out/test.mp4` (rendered with a placeholder clip) previews the VO + music + branding right now.

**Edit to match your recording** — in `src/DemoVideo.tsx` `DEFAULT_PROPS` (or live in Studio's props panel):

- `recordingSeconds` → the length of your `.webm`.
- `cues[]` → `from`/`to` seconds (relative to the recording start) for each lower-third caption.

Timeline = intro (5s) + recording + outro (5s). Keep the recording ≲ 170s so the total stays under 3:00.

### Quick fallback (no Remotion)
```bash
ffmpeg -i recording/<id>.webm -t 175 -c:v libx264 -pix_fmt yuv420p sphinx-demo.mp4
```
