# TradeGPT Documentation

## Overview

**TradeGPT** is an AI-powered assistant for export-import, logistics, and compliance, with advanced document retrieval and chat capabilities. It supports:
- Natural language Q&A
- Semantic search over Q&A and document chunks (including rate sheets, compliance docs, etc.)
- PDF ingestion with OCR and robust chunking/overlap
- Modern React frontend with streaming/typewriter UI

---

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Backend](#backend)
   - [API Endpoints](#api-endpoints)
   - [PDF Ingestion & Chunking](#pdf-ingestion--chunking)
   - [Embeddings & Vector Search](#embeddings--vector-search)
   - [Performance & Token Usage](#performance--token-usage)
   - [Environment Variables](#environment-variables)
4. [Frontend](#frontend)
   - [UI/UX](#uiux)
   - [Streaming Responses](#streaming-responses)
5. [Deployment](#deployment)
6. [Customization](#customization)
7. [FAQ](#faq)

---

## Features

- **Chatbot for trade, export, import, logistics, and compliance**
- **Semantic search over Q&A and document chunks**
- **PDF upload with OCR (Mistral OCR) and robust chunking/overlap**
- **Streaming/typewriter chat UI**
- **Context line and single-chunk support for special documents**
- **MongoDB Atlas vector search for fast retrieval**
- **OpenAI GPT-4 integration for fallback and generative answers**

---

## Architecture

```mermaid
flowchart TD
    User-->|Chat/Upload|Frontend
    Frontend-->|API|Backend
    Backend-->|Vector Search|MongoDB Atlas
    Backend-->|Embeddings|TensorFlow.js (USE)
    Backend-->|OCR|Mistral OCR API
    Backend-->|AI|OpenAI GPT-4 API
```

---

## Backend

### Tech Stack

- **Node.js** (Express)
- **MongoDB Atlas** (vector search)
- **TensorFlow.js** (Universal Sentence Encoder for embeddings)
- **Mistral OCR API** (PDF text extraction)
- **OpenAI GPT-4 API** (AI answers)

---

### API Endpoints

#### **Chat**
- `POST /ask`
  - Handles user queries.
  - Checks Q&A DB, then DocChunk DB, then falls back to OpenAI.
  - Returns: `{ answer, source, confidence }`

#### **PDF Ingestion**
- `POST /parsepdf`
  - Uploads a PDF, extracts text with Mistral OCR, chunks with overlap, stores in DocChunk DB.
  - Optional params:
    - `singleChunk` (boolean): Store as one chunk.
    - `contextLine` (string): Prepended to each chunk.
  - Returns: `{ message, extractedText, originalMarkdown }`

#### **Health**
- `GET /parsepdf/health`
  - Returns service status and OCR provider.

---

### PDF Ingestion & Chunking

- **OCR:** Uses Mistral OCR API for robust text extraction from PDFs (supports scanned docs and tables).
- **Chunking:** 
  - Default: 700 words per chunk, 200 words overlap (sliding window).
  - `singleChunk=true`: Store entire doc as one chunk.
  - `contextLine`: Prepended to each chunk if provided.
- **Storage:** Each chunk is stored in MongoDB with its embedding and metadata.

---

### Embeddings & Vector Search

- **Embeddings:** Universal Sentence Encoder (TensorFlow.js, Node.js backend)
- **Vector Search:** MongoDB Atlas vector index (cosine similarity)
- **Chunk Retrieval:** Top-N (default 3) most similar chunks are concatenated for context.

---

### Performance & Token Usage

#### **Response Time**
- **Q&A/DocChunk retrieval:** ~100–300ms (vector search + embedding)
- **OpenAI GPT-4 API call:** 2–8s (depends on prompt size and OpenAI load)
- **PDF ingestion:** 5–30s (depends on OCR and document size)

#### **Token Usage**
- **Prompt tokens:** 
  - System prompt + context (chunks): up to 3000 characters (~750–800 tokens)
  - User question: ~10–50 tokens
- **Response tokens:** 
  - Up to 512 tokens (configurable)
- **Total per request:** Typically 1000–1500 tokens (well within GPT-4 8k/32k limits, but large docs are truncated)

#### **Chunking/Overlap**
- **Chunk size:** 700 words
- **Overlap:** 200 words
- **Why:** Preserves context at chunk boundaries, improves retrieval accuracy.

---

### Environment Variables

- `MONGO_URI`: MongoDB Atlas connection string
- `OPENAI_API_KEY`: OpenAI API key
- `MISTRAL_API_KEY`: Mistral OCR API key

---

## Frontend

### Tech Stack

- **React** (with hooks)
- **react-markdown** (for formatted AI responses)
- **Streaming/typewriter effect** for AI answers
- **Auto-scroll to latest message**
- **Modern, responsive chat UI**

---

### UI/UX

- **Chat interface:** User types questions, sees streaming AI answers.
- **PDF upload:** (Not implemented in UI) for document ingestion can use Postman.

---

### Streaming Responses

- **Typewriter effect:** AI answers appear character by character for a modern, engaging experience.
- **Markdown rendering:** Lists, tables, and formatting are preserved.

---

## Deployment

- **Backend:** Deployable on any Node.js server (Render, Vercel, AWS, etc.)
- **Frontend:** Deployable as a static React app (Vercel, Netlify, etc.)

---

## Customization

- **Chunk size/overlap:** Adjustable in backend code.
- **Embedding model:** Swappable (e.g., OpenAI, Cohere, etc.)
- **AI model:** Configurable (GPT-4, GPT-3.5, etc.)
- **UI theme and branding:** Easily customizable in React frontend.

---

## FAQ

**Q: What happens if the document is too large for OpenAI’s context window?**  
A: The backend truncates the context to ~3000 characters to avoid API errors.

**Q: Can I use my own embedding model?**  
A: Yes, swap out the Universal Sentence Encoder in `services/embeddings.js`.

**Q: How accurate is the retrieval?**  
A: With chunking + overlap, most queries retrieve the correct context. For highly structured docs, consider chunking by table row.

**Q: What is the average response time?**  
A:  
- Retrieval: 100–300ms  
- OpenAI call: 2–8s  
- PDF ingestion: 5–30s

---

