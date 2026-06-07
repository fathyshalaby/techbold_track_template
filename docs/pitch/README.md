# Pitch deck - Sphinx

The jury pitch for the techbold START Hack Vienna '26 service-desk track.

## Files

| File                             | What it is                                                                                                                                         |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`PITCH_DECK.md`](PITCH_DECK.md) | **Source of truth.** A [Marp](https://marp.app/) markdown deck (~16 slides) with a custom theme and **presenter notes / timing** in HTML comments. |
| `PITCH_DECK.html`                | Rendered, self-contained HTML (open in any browser; press <kbd>F</kbd> for fullscreen). Regenerate with the command below.                         |

## The two formats

This deck exists in two forms, both built from the same narrative:

| Format                                         | Use it for                                                           | Where       |
| ---------------------------------------------- | -------------------------------------------------------------------- | ----------- |
| **Marp** (`PITCH_DECK.md` → `PITCH_DECK.html`) | the in-repo, version-controlled source of truth; renders to PDF/PPTX | this folder |
| **Canva** (designed, 13 slides)                | the polished on-screen deck for the live pitch                       | links below |

### Canva - designed visual deck

-  **View:** https://www.canva.com/d/Usjrba32cYQHRvW
-  **Edit:** https://www.canva.com/d/-2va1E71SUMYWqq
-  **Export a PDF/PPTX:** open the edit link → **Share → Download → PDF Standard / PPTX**.

> The Canva export's direct download URL is short-lived and the build environment can't host the
> binary, so the PDF is not committed here - export it from Canva when you need a fresh copy.
> Two alternate generated layouts are also available if you prefer a different look:
> [Option 2](https://www.canva.com/d/qDuWZvjulf1KpdC) · [Option 3](https://www.canva.com/d/AjBC8Alt1qgrke5).

## Render it yourself

The deck is plain Marp markdown, so it renders to HTML, PDF, PPTX, or PNG with the Marp CLI - no project dependency:

```bash
cd docs/pitch

# HTML (no browser needed)
npx -y @marp-team/marp-cli@latest PITCH_DECK.md -o PITCH_DECK.html --html

# PDF (needs a headless Chromium; Marp downloads one on first run)
npx -y @marp-team/marp-cli@latest PITCH_DECK.md -o PITCH_DECK.pdf --pdf --allow-local-files

# PowerPoint
npx -y @marp-team/marp-cli@latest PITCH_DECK.md -o PITCH_DECK.pptx --pptx

# Live preview while editing
npx -y @marp-team/marp-cli@latest -p -w PITCH_DECK.md
```

Or use the **Marp for VS Code** extension for live preview + one-click export.

## Structure & timing

The deck is sequenced for a ~4-5 minute pitch with a demo handoff. The speaker notes embedded in each slide (`<!-- ... -->`) give the talk track and per-slide timing. The arc:

1. Title & the one-sentence promise
2. The problem (vague tickets, risky manual SSH, missing docs, no audit trail)
3. The stakes (one `rm -rf` = lost data; undocumented fixes; non-persistent fixes)
   4-6. The solution: the human-in-the-loop loop, and _the crux_ - the model can't touch the VM
   7-10. The four differentiators: diagnosis-first · safety-by-design · audit-as-source-of-truth · generalisation
4. Architecture
5. The human-control surface
6. How we win the rubric (55/100 = B + C)
7. What's real today (honest status)
8. What we'll show live
9. Why it wins / close

See [`../REPORT.md`](../../REPORT.md) for the long-form engineering write-up the deck summarises.
