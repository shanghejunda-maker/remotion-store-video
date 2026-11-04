import { continueRender, delayRender, staticFile } from "remotion";

// Bundled font files (Inter, SIL Open Font License) so the video renders the same on any machine.
const FONTS: { family: string; file: string; weight: string }[] = [
  { family: "Inter", file: "Inter-Regular.otf", weight: "400" },
  { family: "Inter", file: "Inter-Medium.otf", weight: "500" },
  { family: "Inter", file: "Inter-SemiBold.otf", weight: "600" },
  { family: "Inter", file: "Inter-Bold.otf", weight: "700" },
];

const handle = delayRender("Loading fonts");
Promise.all(
  FONTS.map(async (f) => {
    const face = new FontFace(f.family, `url(${staticFile(`fonts/${f.file}`)}) format("opentype")`, { weight: f.weight });
    await face.load();
    document.fonts.add(face);
  })
)
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error("Font loading failed", err);
    continueRender(handle);
  });
