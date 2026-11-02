# Scratch narration for the Podman + Eddy3D + OpenFOAM tutorial, from narration/narration.json.
# Windows SAPI voice = a timing track for the animation, NOT the final voice-over: replace the
# wavs (same file names, same start times) with a recorded or studio-TTS read before publishing.
# Picks the slowest SAPI rate whose clip still fits its scene window, then mixes narration.wav
# (90 s, 44.1 kHz mono) and writes narration/timeline.json with the measured durations.
param([string]$Dir = (Join-Path $PSScriptRoot '..\narration'), [string]$Out = $Dir)
Add-Type -AssemblyName System.Speech
$cfg = Get-Content (Join-Path $Dir 'narration.json') -Raw | ConvertFrom-Json
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice($cfg.voice)
New-Item -ItemType Directory -Force $Out | Out-Null
function Dur($f) { [double](& ffprobe -v error -show_entries format=duration -of csv=p=0 $f) }
$timeline = @()
foreach ($s in $cfg.segments) {
  $wav = Join-Path $Out ($s.id + '.wav')
  $chosen = $null
  foreach ($rate in -1, 0, 1, 2, 3, 4, 5) {
    $synth.Rate = $rate
    $synth.SetOutputToWaveFile($wav)
    $synth.Speak($s.text)
    $synth.SetOutputToNull()
    $d = Dur $wav
    $chosen = @{ rate = $rate; dur = $d }
    if ($d -le $s.window) { break }
  }
  $timeline += [pscustomobject]@{ id = $s.id; start = $s.start; dur = [math]::Round($chosen.dur, 3); rate = $chosen.rate; window = $s.window; text = $s.text }
}
$timeline | ConvertTo-Json | Set-Content (Join-Path $Out 'timeline.json') -Encoding UTF8
# mix: each clip delayed to its start, padded to 90 s
$inputs = @(); $filters = @(); $i = 0
foreach ($t in $timeline) {
  $inputs += '-i'; $inputs += (Join-Path $Out ($t.id + '.wav'))
  $ms = [int]($t.start * 1000)
  $filters += ('[{0}:a]aresample=44100,aformat=channel_layouts=mono,adelay={1}[a{0}]' -f $i, $ms)
  $i++
}
$mix = ($filters -join ';') + ';' + (((0..($i-1)) | % { '[a' + $_ + ']' }) -join '') + 'amix=inputs=' + $i + ':normalize=0,apad=whole_dur=90[out]'
& ffmpeg -y -v error @inputs -filter_complex $mix -map '[out]' -t 90 (Join-Path $Out 'narration.wav')
$timeline | Format-Table id, start, dur, window, rate -AutoSize | Out-String | Write-Host
