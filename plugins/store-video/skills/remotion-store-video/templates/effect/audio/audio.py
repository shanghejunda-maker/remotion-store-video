"""Original synthesized BGM + SFX for the __APP__ store video (30 fps, 120 BPM). numpy only.
Structure: airy intro on the cover -> dark hook (storage turns red) -> riser -> drop into a bright
four-on-the-floor groove under the demos -> 2-beat breakdown -> impact on the end card -> airy outro.
Run from the project root:
    python3 effects/__NAME__/audio/audio.py
All event times are FRAMES and must match T in Promo.tsx, HOOK / FEAT in scenes.tsx and the TimeCtx rates.
"""
import pathlib
import time
import wave

import numpy as np

SR = 48000
FPS = 30
TOTAL = 732                       # Promo.tsx T.total
DUR = TOTAL / FPS
N = int(SR * DUR) + SR
rng = np.random.default_rng(11)
fr = lambda f: f / FPS            # frames -> seconds
BEAT = 0.5                        # 120 BPM -> 15 frames
BAR = 4 * BEAT

# ---------------- timeline (frames) — mirror Promo.tsx T ----------------
HOOK = 30; P1 = 120; T2 = 270; P2 = 292; T3 = 480; P3 = 502; END = 690
DROP = P1
RATES = {P1: 0.85, P2: 0.85, P3: 0.85}       # Promo.tsx P*_TIME
H_RED = 45; H_SHAKE = (52, 60)                # scenes.tsx HOOK
F_TAP = 20; F_DONE = 90                       # scenes.tsx FEAT
def scene(start, off, rate): return lambda t: start + (t + off) / rate   # scene frame -> global frame
BREAK = END - 30

# ---------------- DSP helpers ----------------
def _filt(x, mag):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X * mag(np.maximum(f, 1e-6)), len(x))
def lp(x, c, o=2): return _filt(x, lambda f: 1 / np.sqrt(1 + (f / c) ** (2 * o)))
def hp(x, c, o=2): return _filt(x, lambda f: 1 / np.sqrt(1 + (c / f) ** (2 * o)))
def bp(x, lo, hi): return hp(lp(x, hi), lo)
def env(n, a, d):
    t = np.arange(n) / SR; e = np.exp(-t / d)
    na = max(1, int(a * SR)); e[:na] *= np.linspace(0, 1, na); return e
def add(buf, x, t, g=1.0):
    i = int(t * SR)
    if i < 0: x = x[-i:]; i = 0
    if i >= len(buf): return
    j = min(len(buf), i + len(x)); buf[i:j] += g * x[: j - i]
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def saw(f, n, det=0.0):
    t = np.arange(n) / SR; ph = (f * (1 + det) * t + rng.random()) % 1.0
    return 2 * ph - 1
def sine(f, n): return np.sin(2 * np.pi * f * np.arange(n) / SR)
def noise(n): return rng.standard_normal(n)

music = np.zeros(N); drums = np.zeros(N); sfx = np.zeros(N); hits = np.zeros(N)

# ---------------- instruments ----------------
def pad(notes, n, cut, a=0.3, d=3.0, voices=(-0.006, 0.0, 0.006)):
    x = np.zeros(n)
    for m in notes:
        for dv in voices: x += saw(mtof(m), n, dv)
    return lp(x, cut) * env(n, a, d)
def glass(m, d=0.9):
    n = int(d * SR); t = np.arange(n) / SR; f = mtof(m)
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 2.01 * f * t)) * env(n, 0.002, 0.28)
def boom(d=1.2, f0=95, f1=34):
    n = int(d * SR); t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / 0.08)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.45) + 0.25 * lp(noise(n), 900) * env(n, 0.003, 0.35)
def stab(notes, d=0.32, cut=3000):
    n = int(d * SR); x = np.zeros(n)
    for m in notes:
        for dv in (-0.008, 0.0, 0.008): x += saw(mtof(m), n, dv)
    return lp(x, cut) * env(n, 0.002, 0.1)
def kick():
    n = int(0.32 * SR); t = np.arange(n) / SR
    f = 48 + 110 * np.exp(-t / 0.035)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.14)
def clap():
    n = int(0.22 * SR); return bp(noise(n), 1000, 4000) * env(n, 0.001, 0.07)
def hat(open_=False):
    n = int((0.16 if open_ else 0.04) * SR)
    return hp(noise(n), 8000, 4) * env(n, 0.0005, 0.05 if open_ else 0.01)
# UI SFX
def tap():
    n = int(0.045 * SR)
    return sine(2300, n) * env(n, 0.0005, 0.01) + 0.5 * sine(380, n) * env(n, 0.001, 0.012)
def pop(f0=900):
    n = int(0.08 * SR); t = np.arange(n) / SR
    f = f0 * (1 + 0.6 * np.exp(-t / 0.015))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.022)
def blip(f=1500): n = int(0.09 * SR); return (sine(f, n) + 0.5 * sine(f * 1.5, n)) * env(n, 0.002, 0.03)
def sparkle(): n = int(0.3 * SR); return sum(sine(f, n) for f in (2637, 3520, 4186)) / 3 * env(n, 0.001, 0.07)
def whoosh():
    n = int(0.45 * SR); return lp(hp(noise(n), 600), 5000) * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
def success():
    """'task complete' cue: two-note mallet ding up a fourth + airy shimmer"""
    n = int(1.0 * SR); out = np.zeros(n); t = np.arange(n) / SR
    for m, at, g in ((84, 0.0, 0.8), (89, 0.09, 1.0)):
        k = int(at * SR); tt = t[: n - k]
        out[k:] += g * np.sin(2 * np.pi * mtof(m) * tt) * np.exp(-tt / 0.22)
    return out + np.roll(hp(noise(n), 6000) * env(n, 0.12, 0.18) * 0.12, int(0.08 * SR))

# ---------------- cover: airy pad + glass plucks ----------------
p = pad([63, 67, 70, 74], int(fr(HOOK + 6) * SR), 1800, 0.4, 2.5)
add(music, p, 0, 0.022)
for i, m in enumerate([75, 79, 82, 86, 87, 86, 82, 79]): add(music, glass(m), fr(4 + i * 7.5), 0.05)
add(sfx, sparkle(), fr(8), 0.05)

# ---------------- hook: dark hits, alarm, riser ----------------
add(hits, boom(1.0, 80, 36), fr(HOOK), 0.30)
add(music, pad([48, 55, 60, 63], int(fr(DROP - HOOK) * SR), 700, 0.3, 4.0), fr(HOOK), 0.028)
add(hits, boom(1.3, 120, 38), fr(HOOK + H_RED), 0.55)
add(music, stab([48, 51, 55, 60], 0.5, 1800), fr(HOOK + H_RED), 0.06)
for t in H_SHAKE: add(hits, boom(0.5, 100, 45), fr(HOOK + t), 0.25)
n = int(1.0 * SR); add(sfx, hp(noise(n), 5000) * np.linspace(0, 1, n) ** 3, fr(DROP) - 1.0, 0.07)

# ---------------- groove: DROP -> BREAK (Cm - Ab - Eb - Bb) ----------------
CHORDS = [[60, 63, 67, 70], [56, 60, 63, 67], [58, 63, 67, 70], [58, 62, 65, 70]]
ROOTS = [36, 32, 39, 34]
side = np.ones(N); K, C = kick(), clap()
for b in range(int((fr(BREAK) - fr(DROP)) / BEAT + 0.5)):
    tb = fr(DROP) + b * BEAT
    add(drums, K, tb, 0.42)
    i = int(tb * SR); L = int(0.3 * SR); seg = 1 - 0.6 * np.exp(-np.arange(L) / SR / 0.08)
    j = min(N, i + L); side[i:j] = np.minimum(side[i:j], seg[: j - i])   # sidechain duck
    if b % 2 == 1: add(drums, C, tb, 0.20)
    add(drums, hat(True), tb + BEAT / 2, 0.05)
for bi in range(int((fr(BREAK) - fr(DROP)) / BAR) + 1):
    tb = fr(DROP) + bi * BAR; ch = CHORDS[bi % 4]; root = ROOTS[bi % 4]
    add(music, pad([m + 12 for m in ch], int(BAR * SR), 2600, 0.03, 4.0), tb, 0.016)
    for q in range(4): add(music, stab([m + 12 for m in ch], 0.18, 3800), tb + q * BEAT + BEAT / 2, 0.035)
    for e8 in range(8):
        te = tb + e8 * BEAT / 2
        if te >= fr(BREAK): break
        n = int(BEAT / 2 * SR * 0.85); m = root + (12 if e8 % 2 else 0)
        add(music, lp(saw(mtof(m), n) + 0.8 * sine(mtof(m), n), 420) * env(n, 0.003, 0.16), te, 0.17)

# ---------------- breakdown + end card ----------------
n = int((fr(END) - fr(BREAK)) * SR); tt = np.arange(n) / n
add(music, pad([63, 67, 70, 75], n, 1200, 0.05, 3.0) * (0.4 + 0.6 * tt), fr(BREAK), 0.03)
add(hits, boom(1.6, 100, 36), fr(END), 0.5)
add(music, pad([51, 58, 63, 67, 70, 74], int((DUR - fr(END) + 0.3) * SR), 2400, 0.01, 2.6), fr(END), 0.03)
for i, m in enumerate([87, 86, 82, 79, 75]): add(music, glass(m, 1.2), fr(END + 4 + i * 7.5), 0.045)
for i in range(5): add(sfx, sparkle(), fr(END + 16 + i * 2.5), 0.035)

# ---------------- UI SFX per feature (follow the action frame, not the segment start) ----------------
for t in (DROP, T2, P2, T3, P3, END): add(sfx, whoosh(), fr(t) - 0.15, 0.05)
def done(t):
    add(sfx, success(), fr(t), 0.09)
    for i in range(5): add(sfx, pop(700 + i * 150), fr(t + 2) + i * 0.035, 0.05)
for start in (P1, P2, P3):
    S = scene(start, 0, RATES[start])
    add(sfx, tap(), fr(S(F_TAP)), 0.22)
    for k in range(4): add(sfx, blip(990 - k * 60), fr(S(F_TAP + 15 + k * 12)), 0.06)
    done(S(F_DONE))

# ---------------- mix ----------------
music *= side
mix = (music + 0.9 * drums + sfx + hits)[: int(DUR * SR)]
fi = int(0.03 * SR); mix[:fi] *= np.linspace(0, 1, fi)
fo = int(1.2 * SR); mix[-fo:] *= np.linspace(1, 0, fo) ** 1.5
mus = music[: len(mix)]
st = np.stack([mix + 0.12 * np.roll(mus, int(0.011 * SR)), mix + 0.12 * np.roll(mus, int(0.017 * SR))], 1)
st = np.tanh(st * 1.5) / np.tanh(1.5)
st *= 0.89 / np.max(np.abs(st))
out = pathlib.Path("public/__NAME__/bgm.wav"); out.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(out), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype("<i2").tobytes())
# cache-buster so Remotion Studio reloads the new wav
(pathlib.Path(__file__).parent / "version.ts").write_text(f'export const BGM_V: string = "{int(time.time())}";\n')
print("wrote", out, "· rms dBFS", round(20 * np.log10(np.sqrt(np.mean(st ** 2))), 1))
