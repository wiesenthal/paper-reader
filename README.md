Read a PDF paper and highlight sections to get integrated explanations.

<img width="1718" alt="image" src="https://github.com/user-attachments/assets/e2959d4b-a254-4e2e-83f9-d8a2d9d31da4" />


## Features

- Upload and view PDF documents
- Select text within the PDF
- Get AI-powered explanations for the selected text in the context of the document
- Support for multiple AI model providers (OpenAI, Anthropic, Cerebras) via the Vercel AI SDK
- Real-time streaming responses for explanations

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- API keys for at least one LLM provider (OpenAI, Anthropic, Cerebras)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository_url>
    cd <repository_directory>
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Copy `.env.example` to `.env.local`:
    ```bash
    cp .env.example .env.local
    ```
4.  Edit `.env.local` and add your API keys for the provider(s) you intend to use:
    ```
    # Required: Choose at least one provider
    OPENAI_API_KEY=your_openai_api_key_here
    ANTHROPIC_API_KEY=your_anthropic_api_key_here
    CEREBRAS_API_KEY=your_cerebras_api_key_here
    ```

### Development

Start the development server (uses Turbopack):

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to use the application.

## How It Works

1.  Upload a PDF document using the drag-and-drop interface.
2.  The application uses `pdf-parse` and `react-pdf-viewer` (which utilizes `pdf.js`) in the browser to render the PDF and extract its text content.
3.  View the PDF using the integrated viewer.
4.  Select a portion of text within the PDF viewer.
5.  After a short delay (debounced), the selected text and the full document text are sent to the backend API (`/api/ai`).
6.  The backend API uses the Vercel AI SDK (`ai` package) to stream an explanation from the selected LLM provider (currently defaults to Claude Sonnet 3.5 in `page.tsx`, but the API supports others).
7.  The explanation is displayed in a chat-like interface.

## Technologies Used

- Next.js 15 (App Router with Turbopack for dev)
- React 19
- TypeScript
- Tailwind CSS 4
- PDF Handling:
  - `@react-pdf-viewer/core`, `@react-pdf-viewer/default-layout`, `@react-pdf-viewer/highlight`
  - `pdfjs-dist` (core PDF rendering engine)
  - `pdf-parse` (for initial text extraction)
- AI Integration:
  - Vercel AI SDK (`ai` package)
  - Supported LLM providers via SDK: OpenAI, Anthropic, Cerebras
- State Management: React Hooks (`useState`, `useRef`)
- UI Components: `react-dropzone`
