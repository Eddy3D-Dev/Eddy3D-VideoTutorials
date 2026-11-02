# Storyboard: "Set Up OpenFOAM with Podman and Eddy3D"

16:9, 1920x1080, 30 fps, 90 s. Subtitles follow the narration clips; every cursor move below ends on a control that
exists in the shown interface. Visual source: **R** real capture, **S** real Eddy3D code with staged data,
**D** drawn from Podman Desktop's docs (replace with a recording, see README).

| # | Time | Scene | Visuals (source) | On-screen text | Voice-over |
|---|---|---|---|---|---|
| 1 | 0-7 | Introduction | Podman, Eddy3D, OpenFOAM logo cards with roles (container engine, Grasshopper plugin, CFD software inside the image) joined by animated arrows (R) | "OpenFOAM Setup Made Easy" / "Podman → Eddy3D → OpenFOAM" | "Set up your OpenFOAM simulation environment with Podman and Eddy3D in just a few steps." (0.4 s) |
| 2 | 7-20 | Download Podman Desktop | Windows desktop (D). Browser on podman-desktop.io (R): cursor to nav **Download**, then the Windows **Download** button; download flyout; **Open file**. Installer "Podman Desktop Setup" (D): **Only for me**, **Install**, progress, **Finish** | "Step 1 — Install Podman Desktop" | "First, download and install Podman Desktop, a free and open-source tool for managing containers." (7.6 s) |
| 3 | 20-38 | Start the Podman engine | Podman Desktop (D): **Start Onboarding**; Podman Setup with **WSLv2** selected, **Install**, toast "Installation Successfully Completed", **Close**; "set up correctly" page, **Next**; Create Podman machine form, **Create**; Settings > Resources: `podman-machine-default` **RUNNING**. A card "No WSL 2 yet? Enable the Windows Subsystem for Linux, then restart your computer before you continue." appears during Podman Setup | "Step 2 — Start the Podman Engine"; callout "Podman machine: Running" | "Complete the Podman setup and make sure the Podman machine is running. This provides the environment needed to execute OpenFOAM containers." (20.6 s) |
| 4 | 38-51 | Open Eddy3D | Rhino 8 + Grasshopper (D): command **Grasshopper**, ribbon tab **Eddy3D**, panel `00 \| Setup`, drag the **Eddy3D Setup** component (real icon) to the canvas, flip **Open**; the real setup window opens (S) | "Step 3 — Open Eddy3D Engine Setup" | "Now open Rhino and Grasshopper. In Eddy3D, launch the engine setup interface." (38.5 s) |
| 5 | 51-76 | Pull the OpenFOAM image | Real setup window zoomed (S): container row chips **podman · 8 of 16 cores** ("Podman detected"); **Outdoor** tab; row "(U)RANS CFD (OpenFOAM)" with option "Pull the OpenFOAM wind image · ~4 min · 1.5 GB" highlighted; **Pull**; 50 frames of the real bar ("768.0 MB of 1.5 GB · 1m 52s · ~1m 52s left"), badge "Time-lapse ×19"; final **Installed · containerized** | "Step 4 — Pull the OpenFOAM Image" / "Preconfigured. No manual OpenFOAM installation." | "Eddy3D already provides the OpenFOAM container image through its installation interface. Simply pull the image, and Eddy3D handles the setup through Podman." (51.5 s) |
| 6 | 76-85 | Verify | Setup window diagnostics: `wind image  docker.io/dicehub/openfoam:12@sha256:d7bbd9e71057… (present)` (S); **Re-check**; taskbar to Podman Desktop, **Images**, the image listed (D); green checks connect Podman Desktop, Eddy3D, OpenFOAM | "OpenFOAM Environment Ready" | "Once the image has been downloaded and verified, your OpenFOAM environment is ready for simulations through Eddy3D." (76.3 s) |
| 7 | 85-90 | Closing | Logo row over animated streamlines around a building block (illustrative potential flow, labelled as such) | "Podman + Eddy3D + OpenFOAM" / "Ready to Simulate." | "You're all set. Start exploring computational fluid dynamics with Eddy3D." (85.3 s) |

## Subtitle cues (as rendered)

| Time | Cue |
|---|---|
| 0.4-6.0 | Set up your OpenFOAM simulation environment with Podman and Eddy3D in just a few steps. |
| 7.6-11.1 | First, download and install Podman Desktop, |
| 11.1-15.4 | a free and open-source tool for managing containers. |
| 20.6-25.6 | Complete the Podman setup and make sure the Podman machine is running. |
| 25.6-30.5 | This provides the environment needed to execute OpenFOAM containers. |
| 38.5-41.7 | Now open Rhino and Grasshopper. |
| 41.7-46.4 | In Eddy3D, launch the engine setup interface. |
| 51.5-58.7 | Eddy3D already provides the OpenFOAM container image through its installation interface. |
| 58.7-64.2 | Simply pull the image, and Eddy3D handles the setup through Podman. |
| 76.3-79.7 | Once the image has been downloaded and verified, |
| 79.7-84.3 | your OpenFOAM environment is ready for simulations through Eddy3D. |
| 85.3-86.2 | You're all set. |
| 86.2-89.5 | Start exploring computational fluid dynamics with Eddy3D. |

Timings are measured from the scratch SAPI clips. A recorded voice changes them: `tools/dub.cjs` measures the
takes, writes `narration/timeline.json` and rebuilds `animation/data.js`, with each cue boundary moved to the speaker's
nearest real pause. The lines to record, with the room each scene leaves, are in `narration/recording-script.md`.

## Cursor script (global seconds)

- Scene 2: nav Download 9.0 (click 9.3) · Windows Download 10.7 (click 10.85) · Open file 12.7 (click 12.9) · Only for me 14.1 (click 14.35) · Install 15.4 (click 15.6) · Finish 19.0 (click 19.3)
- Scene 3: Start Onboarding 22.2 (click 22.5) · WSLv2 24.2 · Install 26.2 (click 26.4) · toast Close 29.0 (click 29.2) · Next 30.4 (click 30.5) · Create 32.6 (click 32.8) · rests on the RUNNING row 35-38
- Scene 4: Eddy3D tab 40.1 (click 40.3) · drag the Setup icon 41.5 → canvas 43.0 · Open toggle 44.0 (click 44.3)
- Scene 5: Outdoor tab 55.9 (click 56.15) · Pull 59.35 (click 59.6) · parks away from the bar until 76
- Scene 6: Re-check 77.3 (click 77.5) · taskbar Podman Desktop 78.0 (click 78.3) · Images 79.6 (click 79.8) · image row 81.7
