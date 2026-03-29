import React, { useMemo, useState } from 'react';
import { Header } from './components/Header.js';
import { IngestForm } from './components/IngestForm.js';
import { AskForm } from './components/AskForm.js';
import { AnswerCard } from './components/AnswerCard.js';
import { SourcesList } from './components/SourcesList.js';
import { StatusBanner } from './components/StatusBanner.js';
import { AskResponse, IngestResponse, SourceChunk } from './types.js';

function App() {
  const [ingestResult, setIngestResult] = useState<IngestResponse | null>(null);
  const [answer, setAnswer] = useState<string>('');
  const [sources, setSources] = useState<SourceChunk[]>([]);
  const [error, setError] = useState<string>('');
  const [info, setInfo] = useState<string>('');

  const indexed = useMemo(() => {
    return !!ingestResult || sources.length > 0;
  }, [ingestResult, sources.length]);

  const handleIngestSuccess = (data: IngestResponse) => {
    setError('');
    setInfo(data.message || 'Ingestion complete');
    setIngestResult(data);
  };

  const handleAskSuccess = (data: AskResponse) => {
    setError('');
    setInfo('Answer generated');
    setAnswer(data.answer);
    setSources(data.sources || []);
  };

  const handleError = (message: string) => {
    setError(message);
    setInfo('');
  };

  return (
    <div className="app-grid">
      <div style={{ gridColumn: '1 / -1' }}>
        <Header indexed={indexed} sourceCount={sources.length} />
      </div>

      {error && (
        <div style={{ gridColumn: '1 / -1' }}>
          <StatusBanner variant="warn" message={error} />
        </div>
      )}
      {!error && info && (
        <div style={{ gridColumn: '1 / -1' }}>
          <StatusBanner variant="info" message={info} />
        </div>
      )}

      <IngestForm onSuccess={handleIngestSuccess} onError={handleError} disabled={false} />
      <AskForm onSuccess={handleAskSuccess} onError={handleError} disabled={false} />

      <AnswerCard answer={answer} />
      <SourcesList sources={sources} />
    </div>
  );
}

export default App;
