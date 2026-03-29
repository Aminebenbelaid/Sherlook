# Sherlook VS Code Extension

Lightweight VS Code client for the Sherlook RAG backend.

## Features
- **Sherlook: Ingest Folder** — POST /ingest with a chosen folder path.
- **Sherlook: Ask Codebase** — prompt for a question, POST /ask, and stream results to the Sherlook output channel.

## Requirements
- Sherlook FastAPI backend running locally (default `http://localhost:8000`).
- Backend must expose `/ingest` and `/ask` as in this repo.

## Extension Settings
- `sherlook.apiBase` (string): Base URL for the backend. Default `http://localhost:8000`.
- `sherlook.defaultIngestPath` (string): Default folder path sent to `/ingest`. Default `./data/my-project`.

## Commands
- `Sherlook: Ingest Folder`
- `Sherlook: Ask Codebase`

## Development
```
cd vscode-extension
npm install
npm run compile
code .
# Press F5 to launch the extension host
```

## Packaging
```
# Install once if needed
npm install -g @vscode/vsce

# From vscode-extension/
vsce package
```
