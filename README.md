# TradeGPT

TradeGPT is an AI-powered assistant focused on Indian export-import, logistics, and compliance queries. It uses a hybrid approach: first searching a database of curated Q&A pairs, then falling back to Mistral AI for context-aware, conversational answers.

---

## Project Structure

```
tradegpt/
  backend/
    models/
      Example.js           # Mongoose schema for Q&A pairs
    routes/
      ask.js               # Main API route for chat
    scripts/
      populate.js          # Script to populate the database with Q&A examples
    services/
      embeddings.js        # Embedding and similarity logic
    server.js              # Express server entry point
    package.json           # Backend dependencies
  frontend/
    src/
      components/
        ChatPage.js        # Main chat UI
        LandingPage.js     # Landing page UI
      styles/              # CSS files
      App.js               # App entry point and routing
    public/                # Static assets
    package.json           # Frontend dependencies
```

---

## Backend API

### `POST /ask`

**Description:**
Handles user chat messages. Returns an answer from the database if a close match is found, otherwise uses Mistral AI for a context-aware response. For follow-up queries (like "elaborate"), always uses Mistral AI.

**Request Body:**
```
{
  "question": "<user's message>"
}
```
- `question`: The current user message.
- `history`: (Optional) Array of previous messages for context.

**Response:**
```
{
  "answer": "<assistant's reply>",
  "source": "database" | "mistral",
  "matchedQuestion": "<matched DB question, if any>",
  "confidence": <similarity score or 0>
}
```

---

## How It Works
- On each user message, the backend:
  1. Checks if the message is a follow-up (e.g., "elaborate"). If so, uses Mistral AI with full chat context.
  2. Otherwise, checks the database for a high-similarity match. If found, returns the stored answer.
  3. If no match, uses Mistral AI for a detailed, context-aware answer.

---

## Running the Project
- **Backend:**
  - Install dependencies: `npm install` in `backend/`
  - Start server: `npm run dev` or `npm start`
- **Frontend:**
  - Install dependencies: `npm install` in `frontend/`
  - Start app: `npm start`

---

## Customization
- Add or edit Q&A pairs in `backend/scripts/populate.js` and run the script to update the database.
- Adjust similarity threshold or follow-up detection logic in `backend/routes/ask.js` as needed.

---