# MamreVoice — Text to Speech Landing

Static website for "MamreVoice" — a simple, clear and human text-to-speech experience.

## Structure

- `index.html` — landing page with bilingual (EN/HE) content and TTS preview
- `styles.css` — responsive, RTL-aware styles
- `script.js` — language toggle and Web Speech API preview
- `assets/` — put audio/video samples here (see below)
- `config.json` — optional API configuration (see below)

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

## API integration (optional)

You can switch the TTS mode to "Mamre API" in the UI and post text to your backend.

1) Create `config.json` in the site root:

```json
{
  "api": {
    "baseUrl": "https://your-backend.example.com",
    "ttsPath": "/v1/tts",
    "authHeader": "Authorization",
    "authToken": "Bearer YOUR_TOKEN"
  }
}
```

2) Your endpoint should respond with either:

- Binary audio with a content-type like `audio/mpeg` (recommended), or
- JSON: `{ "audioUrl": "https://.../file.mp3" }`

The client will auto-detect and play it.

### Important

- Never expose secrets in a public static site. If you need private keys, put a simple proxy on your server that injects credentials server-side and enables CORS for this origin.
- Ensure CORS is enabled on your API for the site origin.

## Notes

- The on-page preview uses the browser's Web Speech API. Voice quality depends on the installed system/browser voices.
- Hebrew content is displayed RTL. Use the language switcher in the header.


