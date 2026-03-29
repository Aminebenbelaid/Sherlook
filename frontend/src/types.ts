export interface IngestRequest {
  path: string;
}

export interface IngestResponse {
  files_processed: number;
  chunks_stored: number;
  message: string;
}

export interface AskRequest {
  question: string;
}

export interface SourceChunk {
  file_path: string;
  chunk_index: number;
  score: number;
}

export interface AskResponse {
  answer: string;
  sources: SourceChunk[];
}
