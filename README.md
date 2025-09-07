# AI Study Buddy

An intelligent partner in learning, powered by Google Gemini. This full-stack application allows users to process study materials from various sources, generate summaries and quizzes, and interact with an AI assistant to deepen their understanding.

![AI Study Buddy Screenshot](https://storage.googleapis.com/aistudio-project-showcase/tutorials/9b59e35b-1678-4537-81a1-949e25b12a52/thumbnail.png)

---

## ✨ Key Features

- **Multi-Modal Content Input:**
  - **File Upload:** Process documents like PDFs and images (PNG, JPG).
  - **Text Input:** Paste or type text directly into the application.
  - **Voice Recording:** Use your microphone to record lectures or thoughts, with real-time transcription via the Web Speech API.
- **AI-Powered Learning Tools:**
  - **Summarization:** Generate detailed and concise summaries of the provided content.
  - **Quiz Generation:** Automatically create multiple-choice quizzes to test comprehension.
  - **Contextual Chat:** Engage in a conversation with an AI assistant that understands the context of your study material.
- **Session Management:**
  - **Save & Load Locally:** All study sessions (source text, summary, quiz, and chat history) are saved directly in your browser's local storage for speed and privacy.
- **User Authentication:**
  - Secure login, sign-up, and password reset functionality powered by Firebase Authentication.
- **Admin Dashboard:**
  - A dedicated interface for administrators to monitor Gemini API usage, track performance metrics (like call duration), and view error logs.
- **User-Friendly Experience:**
  - An interactive, voice-guided tour for new users.
  - Responsive design that works seamlessly on desktop and mobile devices.
  - Toast notifications for clear feedback on application actions.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **AI Model:** Google Gemini API (`@google/genai`)
- **Authentication:** Firebase Authentication
- **Speech Recognition:** Web Speech API (browser built-in)
- **Charts & Visualization:** Chart.js
- **UI Components:** `react-hot-toast` for notifications

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- Node.js and npm (or a similar package manager).
- A Google Gemini API Key.
- A Firebase project for authentication.

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Configure Firebase:**
    The authentication features require a Firebase project.
    - Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
    - In your project, go to **Project Settings** > **General**.
    - Under "Your apps", create a new Web App.
    - Copy the `firebaseConfig` object provided.
    - Paste your configuration into the `firebaseConfig` object in `src/services/firebase.ts`.
    
    *Note: It is safe for this configuration object to be in your client-side code. Firebase security is enforced by server-side Security Rules, not by hiding these keys.*

4.  **Configure your Gemini API Key:**
    This project requires an API key for the Google Gemini service. The application is built to securely access this key from an environment variable named `API_KEY`.

    When deploying to a hosting service like Vercel, you must set this environment variable in the project's settings. For example, in Vercel, you would go to `Settings > Environment Variables` and add:
    - **Name:** `API_KEY`
    - **Value:** `Your-Actual-Gemini-API-Key`

    **Important:** Do not hard-code your Gemini API key in the source code or expose it in the browser.

5.  **Run the development server:**
    ```sh
    npm run dev
    ```
    Open your browser and navigate to the local URL provided.

---

## 📂 Project Structure

```
/
├── public/
├── src/
│   ├── components/      # Reusable React components
│   ├── services/        # Modules for external APIs (Gemini, Firebase, Monitoring)
│   ├── App.tsx          # Main application component and state logic
│   ├── index.tsx        # React application entry point
│   └── types.ts         # TypeScript type definitions
├── index.html           # Main HTML file
├── metadata.json        # Project metadata
└── README.md            # You are here!
```
---
## 📄 License

This project is licensed under the MIT License.