# 🎙️ Artikula

**Your personal articulation coach.** Record your voice while speaking or reading aloud, and let AI analyze your articulation quality — providing a score, strengths, and actionable suggestions for improvement.

> Built with [Google AI Studio](https://ai.studio) • Powered by [Gemini API](https://ai.google.dev/)

## ✨ Features

- **Voice Recording** — Record audio directly in the browser using the Web MediaRecorder API with automatic fallback (WebM → MP4 for Safari).
- **AI-Powered Analysis** — Audio is sent to the Gemini API (`gemini-3.1-flash-lite`) which evaluates articulation, clarity, pacing, and pronunciation.
- **Articulation Score** — Receive a 0–100 score representing your overall articulation quality.
- **Transcript** — See a full transcription of what you said.
- **Strengths & Suggestions** — Get a detailed breakdown of what you did well and how to improve.
- **Sample Text Mode** — Optionally read a provided Indonesian sample text and get comparison feedback on missed or mispronounced words.
- **Save Results** — Download your analysis results as a PNG screenshot.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite](https://vitejs.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (Base Nova style) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Animation** | [Motion](https://motion.dev/) + [tw-animate-css](https://github.com/nicegoodthings/tw-animate-css) |
| **AI** | [Google GenAI SDK](https://www.npmjs.com/package/@google/genai) (Gemini 3.1 Flash Lite) |
| **Screenshot** | [html-to-image](https://github.com/nicegoodthings/html-to-image) |

## 📁 Project Structure

```
artikula-assistant/
├── src/
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # React entry point
│   ├── index.css                # Global styles & Tailwind config
│   └── services/
│       └── geminiService.ts     # Gemini API integration & analysis logic
├── components/
│   └── ui/                      # shadcn/ui components (Card, Progress, etc.)
├── lib/
│   └── utils.ts                 # Utility functions (cn helper)
├── index.html                   # HTML entry point
├── vite.config.ts               # Vite configuration with Tailwind plugin
├── components.json              # shadcn/ui configuration
├── metadata.json                # AI Studio app metadata
└── .env.example                 # Environment variable template
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- A [Gemini API key](https://ai.google.dev/gemini-api/docs/api-key)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/artikula-assistant.git
   cd artikula-assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Set your Gemini API key in `.env.local`:
   ```
   GEMINI_API_KEY="your-api-key-here"
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Type-check with TypeScript |
| `npm run clean` | Remove `dist` folder |

## 🌐 Deployment

This app is designed to be deployed via [Google AI Studio](https://ai.studio/apps/4c1e4824-17e3-40bc-b31c-765eef769281). The `GEMINI_API_KEY` and `APP_URL` environment variables are automatically injected at runtime when hosted on AI Studio.

## 📝 License

This project is private and not licensed for redistribution.
