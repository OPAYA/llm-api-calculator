# LLM API Cost Calculator

A client-side web application for calculating and comparing costs across multiple LLM providers (OpenAI, Anthropic, Google, Mistral, Cohere).

## Features

- **Real-time Token Counting**: Live token counting using tiktoken WASM
- **Multi-Model Comparison**: Compare costs across multiple providers and models simultaneously
- **Conversation Simulator**: Simulate multi-turn conversations with cumulative costs
- **Cost Visualization**: Chart.js integration for visual cost comparison
- **Dark/Light Theme**: Toggle between dark and light modes
- **100% Client-Side**: All data processing happens locally in your browser

## Tech Stack

- React + Vite
- tiktoken (WASM) for accurate token counting
- Chart.js for data visualization
- CSS Variables for theming

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deployment

The built files in the `dist` directory can be deployed to any static hosting service (Cloudflare Pages, Vercel, Netlify, etc.).

## Privacy

All data is processed locally in your browser and never sent to any server.