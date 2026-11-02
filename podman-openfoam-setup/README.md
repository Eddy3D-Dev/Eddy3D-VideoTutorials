# Tutorial animation: "Set Up OpenFOAM with Podman and Eddy3D"

A 90 s, 1920x1080, 30 fps tutorial for architects, engineers and Grasshopper users with no container
background: install Podman Desktop, start the Podman machine, open **Eddy3D Setup** in Grasshopper, pull the
prebuilt OpenFOAM image, verify it. No terminal commands, no Docker, no manual OpenFOAM install, and no
simulation is shown until the environment is ready.

- `storyboard.md` is the scene-by-scene script: timing, on-screen text, voice-over, subtitles, cursor actions.
- `animation/index.html` is the animation. Open it through any static server (`?t=45` seeks, the bar scrubs).
  It is one deterministic `render(t)`, so the video is reproducible frame for frame.
- `narration/` holds the script (`narration.json`) and the scratch voice built from it.
- `tools/` regenerates every input (below).

## What is real, what is staged, what is recreated

The brief asks for genuine, version-matched interface material and no fictional interface elements. This box
had the Eddy3D build, Rhino 8 and Docker, but **not** Podman Desktop, so the three kinds of picture are:

| Kind | Where it appears | How it was made |
|---|---|---|
| **Real** | podman-desktop.io Downloads page (v1.30.5, captured 2026-10-31) and the logos (Podman, OpenFOAM Foundation, Podman Desktop, Eddy3D) | Headless Chrome screenshots of the live pages and images: `tools/capture-web.cjs` |
| **Real code, staged data** | The whole **Eddy3D Setup** window in scenes 4-6: 55 frames, including all 50 pull-progress frames and the final "Installed" state | The shipping view (`Setup.UI/*.cs`, WPF backend) hosted outside Rhino against a staged `ISetupCatalog`: `tools/capture-setup/`. Strings, layout, progress bar, ETA text, the `Pull` verb, the digest shortening and the diagnostics sheet are the product's own |
| **Recreated** | Podman Desktop installer, onboarding, machine form, Resources and Images pages; browser and Rhino/Grasshopper chrome; the `Open` toggle and component box; Windows taskbar | Drawn in HTML from Podman Desktop's own documentation and screenshots (v1.22-1.30) and from the Grasshopper component source. **Replace these with screen recordings before publishing** |

Staged values in the real Eddy3D window (say so if asked): host line (Windows 11, 16 cores, RTX 4070, 64 GB,
412 GB free) is this dev machine; the Podman chip reads `8 of 16 cores`; the capability list is 8 rows
(header "7 of 8 need setup"); the pull is paced at a constant 7 MB/s so that the elapsed and ETA text is what
the product prints for a 1.5 GB pull (`1m 52s · ~1m 52s left` at 50 %). The video plays that 220 s pull in
11.6 s and says so in an on-screen badge ("Time-lapse x19").

No completion message is invented: every status string in scenes 4-6 comes from the product. Recreated screens
use only wording the Podman Desktop docs attest (Get started with Podman Desktop, Start Onboarding, Podman Setup,
WSLv2, Install, Installation Successfully Completed, Close, Next, Create, Resources, RUNNING).

### Open items (things only a real run can settle)

1. **Podman Desktop scenes** (installer, onboarding, machine, Resources, Images): record on a clean Windows 11
   machine with Podman Desktop 1.30.5. The recreated pages match the docs, not the pixels.
2. **Images page row.** `docker.io/dicehub/openfoam`, ID `d7bbd9e71057`, tag `<none>`, 3.05 GB come from the
   same image in Docker on the dev box (the pin is digest-only, so no tag). Podman's own ID, size and tag
   column must be read off a real Podman Desktop.
3. **Eddy3D row on a fresh Podman machine.** The reason line ("No OpenFOAM engine is usable: ...") and the Pull
   option are the real strings for a Windows box with Podman and no blueCFD/WSL; the real row may offer more
   options (blueCFD, WSL) that this staged catalog omits.
4. **Grasshopper.** Only the `Eddy3D Setup` icon and the ribbon panel names (`00 | Setup` ... `06 | MRT`) are
   real; the `Open` toggle's on-canvas look is approximate.
5. **Voice-over.** `narration.wav` is a Windows SAPI voice used as a timing track. The real read is a human
   one: `narration/recording-script.md` is the script to record, `tools/dub.cjs` dubs it in (below).
6. **WSL 2 note** (scene 2): shown as a card, no command. The Podman Desktop docs give the steps if a
   longer segment is wanted.

## Regenerating

Needs Node 20+, Chrome, ffmpeg, PowerShell (Windows, for SAPI) and, for the capture, the .NET 8 SDK.

```bash
# 1. real Eddy3D Setup frames (PNG + control bounds JSON), ~5 min because the pull is paced in real time
#    (tools/capture-setup/*.txt are a throwaway WPF project; rename to Shots.csproj / Program.cs outside the repo)
dotnet build Shots.csproj -p:Repo=<Eddy3D checkout> && Shots.exe <out dir>   # SHOTS_FAST=1 for a 6 s pull while iterating
# 2. site screenshots and logos
npm i puppeteer-core && NODE_PATH=node_modules node tools/capture-web.cjs animation/assets
# 3a. narration, scratch voice (SAPI) and timings
powershell -File tools/narration.ps1
# 3b. or the recorded voice: put s1..s7 (or one all.*) in narration/recorded/, then clean, level, fit to the
#     scenes, write narration.wav + timeline.json and rebuild data.js (add --drop 3 to discard stretch 3 of an all.*)
node tools/dub.cjs
# 4. data.js (control bounds, narration cues) and the video
node tools/build-data.cjs        # not needed after dub.cjs, which runs it
NODE_PATH=node_modules node tools/render.cjs --video dist/podman-openfoam-setup.mp4
NODE_PATH=node_modules node tools/render.cjs --t 12,57,66 --dir dist/stills        # spot checks
```

The capture harness is kept as `.txt` on purpose: a `.csproj` in the repo would be picked up by the repo-level
guards and is not meant to join `Eddy3D.sln` (`.claude/rules/eto-library-ui.md`, "an Eto layout can be looked at
without Rhino"). The WPF render lights the window slightly lighter than Rhino does (`SystemColors.ControlBackground`
is white in a bare WPF app and `#F0F0F0` in Rhino): layout is exact, background tone is not.

## Credits and marks

Podman, Podman Desktop and the OpenFOAM Foundation mark belong to their projects; they appear to name the tools
being installed. OpenFOAM is the OpenFOAM Foundation's (openfoam.org). Eddy3D owns none of the solver physics
(`THIRD-PARTY-NOTICES.md`).
