# PDF Paper Reader with AI

A Next.js application for uploading and reading PDFs, with an integrated AI assistant powered by LLMs.

## Features

- Upload and view PDF documents
- Text highlighting and selection
- Ask questions about the document context
- Multiple AI model support (OpenAI, Anthropic, Cerebras)
- Real-time streaming responses

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- API keys for LLM providers (OpenAI, Anthropic, Cerebras)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env.local` and add your API keys:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here 
CEREBRAS_API_KEY=your_cerebras_api_key_here
```

### Development

Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the application.

## How It Works

1. Upload a PDF document through the drag-and-drop interface
2. The document is processed on the server to extract text
3. View the PDF in the document viewer
4. Highlight text to focus on specific sections
5. Ask questions through the chat interface
6. The AI uses the document content and highlighted text as context to answer questions

## Technologies Used

- Next.js 14 (App Router)
- React
- TypeScript
- Tailwind CSS
- react-pdf for PDF rendering
- pdf-parse for text extraction
- Vercel AI SDK
- Various LLM providers (OpenAI, Anthropic, Cerebras)

## License

MIT