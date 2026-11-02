# Voice-over: the script to record

Seven lines, about 45 seconds of speech spread over a 90-second film. Read them in your own voice at a normal, friendly
explaining pace. Everything else (silence at the ends, volume, matching the loudness of the seven lines, timing
against the pictures, the subtitles) is done afterwards by `tools/dub.cjs`.

## How to record

- A quiet room with some soft furnishings (a wardrobe, a sofa, a duvet over a chair) beats any microphone.
  Switch off fans and anything that hums.
- A phone voice memo is good enough. Hold it, or prop it, 15-20 cm from your mouth and slightly to the side,
  and keep the same distance for all seven lines. Do not apply noise reduction or effects; I clean it up.
- Leave about a second of quiet before and after every line. Pauses inside a line are fine and natural.
- If you stumble, stop and read the line again from its start. With seven files, just re-record that file. In one
  file the failed attempt becomes an eighth stretch; the tool then lists the stretches it found with their times and
  I drop the bad one.

## Where to put it

Either of these, in `docs/tutorials/podman-openfoam-setup/narration/recorded/` (or tell me where else the files are):

1. **Seven files**, named `s1` to `s7`, any format (`s1.m4a`, `s2.m4a`, ...).
2. **One file** called `all` (`all.m4a`, `all.wav`, ...) with the seven lines in order and **at least 2 seconds
   of silence between them**. I split it at those pauses; if it does not find exactly seven lines it tells me
   where it found the gaps, so a cough or a retake in the middle is easy to spot.

## The lines

| # | Plays while the film shows | Read | Keep it under |
|---|---|---|---|
| s1 | The Podman, Eddy3D and OpenFOAM logos | Set up your OpenFOAM simulation environment with Podman and Eddy3D in just a few steps. | **6.1 s** (tight) |
| s2 | Downloading and installing Podman Desktop | First, download and install Podman Desktop, a free and open-source tool for managing containers. | 11.5 s |
| s3 | Podman Desktop setup and the running Podman machine | Complete the Podman setup and make sure the Podman machine is running. This provides the environment needed to execute OpenFOAM containers. | 16.5 s |
| s4 | Rhino and Grasshopper, the Eddy3D Setup component | Now open Rhino and Grasshopper. In Eddy3D, launch the engine setup interface. | 11.7 s |
| s5 | The Eddy3D Setup window and the image pull | Eddy3D already provides the OpenFOAM container image through its installation interface. Simply pull the image, and Eddy3D handles the setup through Podman. | 23.2 s |
| s6 | The verification: Eddy3D and Podman Desktop's image list | Once the image has been downloaded and verified, your OpenFOAM environment is ready for simulations through Eddy3D. | 8.1 s |
| s7 | The closing logos and streamlines | You're all set. Start exploring computational fluid dynamics with Eddy3D. | **4.1 s** (tight) |

At a relaxed 150 words per minute the lines take roughly 6.0, 5.6, 8.4, 4.8, 8.8, 6.8 and 4.0 seconds, so only
**s1 and s7** have little room: read those two crisply, without slowing down for emphasis. If a take runs up to 6%
over, the tool speeds it up by that much, which is not audible; beyond that it refuses and tells me how far over
it is, and we either re-record the line or I move the scene.

## How to say the names

- **Eddy3D**: "Eddy three-D"
- **OpenFOAM**: "Open-Foam" (one beat on each half)
- **Podman**: "POD-man"
- **Rhino** and **Grasshopper**: as normal

Say them the same way every time they appear; the subtitles will spell them the way they are written above.

## What happens next

```bash
node tools/dub.cjs            # cleans, levels and fits the takes, writes narration.wav and the subtitle timing
NODE_PATH=node_modules node tools/render.cjs --video dist/podman-openfoam-setup.mp4
```

The first command prints, for every line, how much silence it removed, the final length against the room the scene
leaves, any speed-up, and the signal-to-noise of your room. The subtitles follow your actual pauses.
