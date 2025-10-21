# Multi-Model-Chat  
> A multi-modal AI chatbot supporting text, files (PDF, images, docs) and tool-powered messages.

## 🧠 Overview  
This project implements a full-stack chatbot application that handles **text messages**, **file uploads** (PDFs, images, docs), and integrates with tools and an AI backend. It supports storage of chat history, robust message schema validation, and a backend using Drizzle ORM + Neon (PostgreSQL) for persistence.

## 🚀 Key Features  
- Multi-modal message support: send text + file attachments in a single message  
- File types supported: PDFs, images, docs (with validation and fallback for unsupported types)  
- Structured message parts schema: parts array with types `text`, `file`, `tool`, etc.  
- Message queueing and persistence: chats, messages, message-parts stored in database  
- Tools integration: custom tools (e.g., image generation) can be incorporated  
- Message validation: ensures schema consistency before storing or sending to the AI model  

## 🧱 Tech Stack  
- Frontend: Next.js (App Router)  
- Backend: Node.js + TypeScript  
- Database: PostgreSQL via Neon  
- ORM: Drizzle ORM  
- Validation: Zod for message schema  
- AI integration: (you can specify exactly which LLM or service you use)  
- File handling: base64 encoding for uploads (PDF/image), URL support  

## 📦 Installation & Setup  

1. Clone the repo  
   ```bash
   git clone https://github.com/shiinedev/Multi-Model-Chat.git
   cd Multi-Model-Chat
