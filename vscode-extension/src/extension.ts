import * as vscode from 'vscode';
import fetch from 'node-fetch';

interface IngestResponse {
  files_processed: number;
  chunks_stored: number;
  message: string;
}

interface SourceChunk {
  file_path: string;
  chunk_index: number;
  score: number;
}

interface AskResponse {
  answer: string;
  sources: SourceChunk[];
}

function getConfig() {
  const config = vscode.workspace.getConfiguration('sherlook');
  return {
    apiBase: config.get<string>('apiBase', 'http://localhost:8000'),
    defaultIngestPath: config.get<string>('defaultIngestPath', './data/my-project'),
  };
}

async function callApi<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const { apiBase } = getConfig();
  const url = `${apiBase}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export function activate(context: vscode.ExtensionContext) {
  const output = vscode.window.createOutputChannel('Sherlook');

  const ingestCommand = vscode.commands.registerCommand('sherlook.ingestFolder', async () => {
    const { defaultIngestPath } = getConfig();
    const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const suggested = workspacePath ?? defaultIngestPath;

    const path = await vscode.window.showInputBox({
      title: 'Sherlook: Folder to ingest',
      value: suggested,
      prompt: 'Folder path sent to /ingest',
    });
    if (!path) {
      return;
    }

    await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: 'Sherlook ingest', cancellable: false },
      async () => {
        output.appendLine(`[Sherlook] Ingesting: ${path}`);
        try {
          const response = await callApi<IngestResponse>('/ingest', { path });
          output.appendLine(`[Sherlook] ${response.message}`);
          vscode.window.showInformationMessage(`Sherlook: Ingested ${response.files_processed} files → ${response.chunks_stored} chunks`);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Ingest failed';
          output.appendLine(`[Sherlook] Ingest failed: ${message}`);
          vscode.window.showErrorMessage(`Sherlook ingest failed: ${message}`);
        }
      }
    );
  });

  const askCommand = vscode.commands.registerCommand('sherlook.askQuestion', async () => {
    const question = await vscode.window.showInputBox({
      title: 'Sherlook: Ask your codebase',
      prompt: 'Enter a question to send to /ask',
      placeHolder: 'How are chunks generated and stored?'
    });
    if (!question) {
      return;
    }

    await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Notification, title: 'Sherlook asking…', cancellable: false },
      async () => {
        output.appendLine(`[Sherlook] Q: ${question}`);
        try {
          const response = await callApi<AskResponse>('/ask', { question });
          output.appendLine(`[Sherlook] Answer:\n${response.answer}`);
          if (response.sources?.length) {
            output.appendLine('[Sherlook] Sources:');
            response.sources.forEach((s) => {
              output.appendLine(` - ${s.file_path} (chunk ${s.chunk_index}, score ${s.score})`);
            });
          }
          output.show(true);
          vscode.window.showInformationMessage('Sherlook: Answer ready (see output)');
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Ask failed';
          output.appendLine(`[Sherlook] Ask failed: ${message}`);
          vscode.window.showErrorMessage(`Sherlook ask failed: ${message}`);
        }
      }
    );
  });

  context.subscriptions.push(ingestCommand, askCommand, output);
}

export function deactivate() {}
