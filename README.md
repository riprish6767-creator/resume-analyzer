# CareerCanvas

CareerCanvas is a student-focused resume analyzer for placement cells. Students can paste resume content or upload a plain-text `.txt` file and receive a resume summary, suggested job directions, skills to explore, learning suggestions, and resume improvement ideas.

## Requirements

- Node.js 18 or newer
- A modern browser
- Optional: an OpenAI-compatible chat-completions API key for AI-powered analysis

## Run locally

```powershell
npm start
```

Open [http://localhost:3000](http://localhost:3000). Without an API key the app uses a built-in local analyzer, so it works without paid services or additional dependencies.

To enable AI-powered analysis, set the API key in the server environment before starting the app. The key stays on the server and is never sent to the browser.

```powershell
$env:AI_API_KEY = "your-key"
$env:AI_MODEL = "gpt-4o-mini"
npm start
```

For an OpenAI-compatible provider, optionally set `AI_API_URL` to its chat-completions endpoint. The app does not silently switch to local analysis when a configured AI provider fails; it displays an error so the failure is clear.

## Architecture

- `public/index.html`, `public/styles.css`, and `public/app.js` implement the responsive, accessible browser experience without a frontend build step.
- `server.js` serves the static app and validates resume submissions at `POST /api/analyze`.
- `server.js` selects the local analyzer by default or calls a configured AI chat-completions endpoint. Provider credentials remain server-side.
- `test/server.test.js` exercises analysis output, request validation, and static server headers.

Resume content is processed in memory by CareerCanvas and is not written to disk. When AI mode is configured, the resume is sent to the selected AI provider and is subject to that provider's data-handling policy. Students should avoid submitting sensitive personal information.

## Product and AI-assisted development brief

### User needs

Students need a clear, encouraging way to understand which roles connect to their experience, discover relevant skills to build, and make their resumes more effective. The placement cell needs an approachable tool that supports exploration rather than presenting automated recommendations as hiring decisions.

### Functional requirements

1. Accept resume text directly and support plain-text file upload.
2. Provide a concise resume summary.
3. Recommend relevant job directions and explain the match.
4. Identify skills to develop and suggest next learning steps.
5. Give practical resume-writing improvements.
6. Clearly report analysis errors and distinguish local analysis from AI-powered analysis.
7. Avoid persisting resume content.

### Quality requirements

- Responsive layout, keyboard-friendly controls, and readable contrast.
- Server-side input limits and validation; no AI credentials in client code.
- Render generated text as text rather than executable markup.
- Make role matches advisory, not a guarantee of employment or suitability.

### Participant SDLC activities

Participants can use an AI coding assistant to refine requirements, discuss architecture, generate and review code, request refactoring, generate tests, debug failures, produce documentation, and get help with Git/GitHub workflows. Participants should guide and review each step with prompts rather than manually writing application code.
