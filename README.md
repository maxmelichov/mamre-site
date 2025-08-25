# MamreVoice — Text to Speech Landing

Static website for "MamreVoice" — a simple, clear and human text-to-speech experience.

## Structure

- `index.html` — landing page with bilingual (EN/HE) content and TTS preview
- `styles.css` — responsive, RTL-aware styles
- `script.js` — language toggle (no inference)
- `assets/` — put audio/video samples here (see below)
- `config.json` — optional API configuration (see below)
 - `recordings/` — place your `i_target.*` and `i_prediction.*` here

## Local preview

You can open `index.html` directly, or serve the folder with any static server. For example:

```bash
python3 -m http.server 8080 -d /home/maxm/mamre.github.io
```

Then open `http://localhost:8080`.

## Adding samples

Place your demo files in the `assets/` folder and keep the file names used by `index.html`, or update the `<audio>`/`<video>` sources accordingly.

- Audio (English): `assets/sample-en-1.mp3`
- Audio (Hebrew): `assets/sample-he-1.mp3`
- Video demo: `assets/demo.mp4`
- Optional poster image: `assets/placeholder.jpg`

## Recordings

Put your files in `recordings/` with these names, any of the listed formats:

- `i_target.(mp3|wav|ogg)` — target reference
- `i_prediction.(mp3|wav|ogg)` — generated prediction

They will be shown side-by-side on the page.

## Notes

- The on-page preview uses the browser's Web Speech API. Voice quality depends on the installed system/browser voices.
- Hebrew content is displayed RTL. Use the language switcher in the header.


