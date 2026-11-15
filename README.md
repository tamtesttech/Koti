# Koti

**A cozy, closed-loop mental wellness sanctuary for life after depression treatment.**

*Koti* (Finnish for "home") helps individuals stay grounded and prevent relapse once daily hospital or clinical depression care ends. Instead of cold medical charts, streak guilt, or toxic positivity, Koti welcomes users into a calm, tactile miniature clay home built on **Acceptance and Commitment Therapy (ACT)** principles.

---

## Why Koti?

- **Bridging the Post-Treatment Cliff:** Going from daily clinical support to sudden isolation at home leaves patients vulnerable to relapse. Koti acts as a gentle, everyday companion between therapy appointments.
- **Zero Toxic Positivity:** Traditional wellness apps often alienate struggling users with forced cheerfulness. Koti validates heavy days without judgment and adapts its support to the user's actual capacity.
- **Privacy-First by Design:** Onboarding profiles, mood logs, and private reflections are stored locally in the browser (`localStorage`), keeping sensitive emotional data on the user's device.

---

## Core Features

### 1. Guided Onboarding & Cat Tutorial (`Intro` → `Tutorial`)
- **One-Question-at-a-Time Setup:** A minimal, skippable questionnaire captures personal comforts, recovery stage, current challenges, and a primary focus area (*Self-Love*, *Gratitude*, or *Breathing*), with free-text support on every step.
- **Interactive Room Walkthrough:** A clay cat guide introduces each interactive hotspot in the isometric home without overwhelming walls of text.

### 2. My Desk — Adaptive AI Exercises
- Powered by **Gemini 2.5 Flash**, My Desk generates simple, doable, real-world micro-exercises tailored to the user's onboarding profile and emotional themes processed in *The Void*.
- Encourages low-barrier grounded action and screen-free presence, with quick completion tracking.

### 3. The Piano — Anytime Mood Tracker & Monthly Melodies
- **Frictionless Check-Ins:** Log emotions (*Calm, Hopeful, Tired, Heavy, Anxious, Joyful*, or custom text) alongside an intensity slider (`1–10`) anytime.
- **Procedural Music (`Tone.js`):** Rather than assigning rigid sounds to specific emotions, each check-in adds a harmonious phrase to an evolving monthly composition—reminding users that both low and bright notes belong in a complete song.
- **Song Archive:** Replay past and current monthly compositions (*Song of January*, *Song of March*, *Current Month*).

### 4. The Door → "The Void" — Silent Kintsugi Release
- A completely silent, dark sanctuary for days when advice or exercises feel overwhelming.
- **Text or Voice Venting:** Pour out unfiltered thoughts via text or hands-free browser voice input (`SpeechRecognition`).
- **The Kintsugi Sequence:** Upon release, a ceramic vase silently fractures, Gemini offers a brief, grounded acknowledgment of the user's feelings, shimmering gold seams (`#C4863C`) mend the cracks, and a unique affirmation fades in. Emotional context quietly informs future *My Desk* exercises.

### 5. Monthly Wellness Check-In (PHQ-9) & Therapist Export
- Includes the standard 9-question **PHQ-9** depression screening to track long-term recovery trends.
- **One-Click Clinical Summary:** Export or copy a clean report of PHQ-9 scores and mood patterns to share directly with a therapist or doctor.

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS | Isometric sanctuary UI, state flow, and responsive modals |
| **AI Engine** | Google Gemini 2.5 Flash (`@google/genai`) | Adaptive ACT task generation & empathetic Kintsugi responses |
| **Backend Proxy** | Node.js (`server.ts`) | Secure server-side handling of `GEMINI_API_KEY` |
| **Audio & Voice** | Tone.js & Web Speech API | Procedural monthly piano melodies & hands-free voice venting |
| **Storage** | Browser `localStorage` | Private, offline-capable persistence for logs and preferences |
| **Clinical Export** | Client-Side Report Generator | Formatted PHQ-9 & mood summary export for therapists |

---

## Color Palette

Koti uses a warm, low-stimulation Nordic clay palette:

| Swatch | Name | Hex | Role |
| :--- | :--- | :--- | :--- |
| 🟫 | **Warm Sand** | `#DCC3AC` | Main background & soft cards |
| 🟧 | **Terracotta Clay** | `#AC6332` | Primary buttons & warm accents |
| 🟩 | **Deep Moss** | `#655F35` | Nature cues & completed states |
| 🪵 | **Dark Timber** | `#674223` | Primary typography & outlines |
| 🟨 | **Honey Ochre** | `#C4863C` | Kintsugi gold seams & musical highlights |

---

## Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- A **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

### Installation & Local Setup

1. **Clone the repository**
   ```bash
   git clone [https://github.com/tamtesttech/Koti.git](https://github.com/tamtesttech/Koti.git)
   cd Koti
