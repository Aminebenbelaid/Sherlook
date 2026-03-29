import React, { useState } from 'react';
import { ingest } from '../api.js';
import { IngestResponse } from '../types.js';
import { StatusBanner } from './StatusBanner.js';

interface IngestFormProps {
  onSuccess: (data: IngestResponse) => void;
  onError: (message: string) => void;
  disabled: boolean;
}

export const IngestForm: React.FC<IngestFormProps> = ({ onSuccess, onError, disabled }) => {
  const [path, setPath] = useState('./data/my-project');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const res = await ingest({ path });
      setStatus(`Indexed ${res.files_processed} files into ${res.chunks_stored} chunks`);
      onSuccess(res);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to ingest path';
      setStatus(message);
      onError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel">
      <h2 className="section-title">Ingest project</h2>
      <p className="muted" style={{ marginBottom: 12 }}>Scan a folder, chunk files, and populate ChromaDB.</p>
      <form className="stack" onSubmit={handleSubmit}>
        <label className="label" htmlFor="path">Folder path</label>
        <input
          id="path"
          className="input"
          placeholder="./data/my-project"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          disabled={loading || disabled}
          required
        />
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <button className="button" type="submit" disabled={loading || disabled}>
            {loading ? 'Ingesting…' : 'Ingest'}
          </button>
          <span className="muted">POST /ingest</span>
        </div>
      </form>
      {status && (
        <div style={{ marginTop: 12 }}>
          <StatusBanner variant={status.startsWith('Indexed') ? 'ok' : 'warn'} message={status} />
        </div>
      )}
    </section>
  );
};
