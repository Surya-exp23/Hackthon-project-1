# 🏙️ CivicLens: AI-Powered Civic Intelligence Platform

**CivicLens** is a modern, AI-driven platform designed to bridge the gap between citizens and local government authorities. It transforms the way civic issues (like potholes, broken streetlights, or waste overflow) are reported, managed, and resolved in urban environments.

---

## 🌍 The Vision: Solving a Real-Life Problem

**The Problem:** Traditional civic reporting systems are fundamentally broken. They are often bureaucratic, slow, and lack transparency. Citizens who take the time to report issues rarely receive updates, leading to civic apathy. On the other side, government departments are overwhelmed with duplicate reports, lack proper prioritization, and struggle with inefficient resource allocation.

**The Solution:** CivicLens completely reimagines this workflow. We empower citizens to report issues in under 30 seconds using just their smartphone camera. Behind the scenes, **Generative AI (Google Gemini)** instantly analyzes the image, categorizes the issue, estimates its severity, and generates an actionable summary. 

By automating the triage process, CivicLens removes the noise, eliminates duplicates, and provides city administrators with a real-time, geospatial **Priority Queue**—answering the critical question: *"What needs our attention right now?"*

---

## ⚙️ How It Works

1. **📸 Capture & Report:** A citizen spots a problem, snaps a photo, and submits it with a brief description or location.
2. **🧠 AI Intelligence:** The Gemini Vision AI instantly scans the image to identify the exact category (e.g., *Infrastructure, Waste, Water*), calculates a severity score, and writes a concise technical summary for the authorities.
3. **🗺️ Geospatial Routing:** The issue is mapped using Leaflet.js and automatically clustered to prevent duplicate reports. It is then placed into a priority queue for the relevant department.
4. **✅ Transparent Resolution:** As city workers address the problem, the status updates in real-time. Citizens can track the progress on a live city map and in their personal dashboard, closing the feedback loop and building trust.

---

## ✨ Key Features

- **Unified Authentication:** Seamless, role-based login system supporting Citizens, Admins, and Departments from a single interface.
- **AI-Powered Triage:** Automated categorization and severity scoring using Google's Gemini AI.
- **Live Command Center:** A comprehensive admin dashboard featuring real-time analytics, resolution rates, and a priority queue.
- **Interactive City Map:** A dynamic, Leaflet-powered geospatial map that visualizes all active and resolved issues across the city.
- **Premium User Experience:** Built with a stunning, glassmorphism-inspired UI featuring smooth Framer Motion animations, premium typography (`Playfair Display` + `Outfit`), and a seamless **Dark/Light Mode** toggle.

---

## 🛠️ Technology Stack

CivicLens is built as a robust monorepo utilizing the following modern technologies:

**Frontend (Client)**
- **Framework:** Next.js (App Router)
- **Styling:** Vanilla CSS (Tailwind integration) with dynamic CSS Variables
- **Animations:** Framer Motion
- **Maps:** React Leaflet
- **Icons:** Lucide React
- **Typography:** Next Font (`Outfit` & `Playfair Display`)

**Backend (API)**
- **Runtime:** Node.js with Express.js
- **Database:** MongoDB & Mongoose
- **AI Integration:** Google Generative AI (Gemini)
- **Media Storage:** Cloudinary
- **Authentication:** JWT (JSON Web Tokens)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Environment Setup
Create a `.env` file in the root directory and populate it with your API keys:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
AI_PROVIDER=gemini
AI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CORS_ORIGIN=http://localhost:3000
PORT=5000
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Application
Since this is a full-stack application, you need to run both the API server and the Next.js frontend.

**Start the Backend API (Port 5000):**
```bash
npx tsx api/index.ts
```

**Start the Frontend Next.js Server (Port 3000):**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to explore CivicLens!

---
*Built with ❤️ for Hack Devengers 1.0*
