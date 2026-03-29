import React, { useState } from 'react';
import { ask } from '../api.js';
import { AskResponse } from '../types.js';
import { StatusBanner } from './StatusBanner.js';

interface AskFormProps {
  onSuccess: (data: AskResponse) => void;
  onError: (message: string) => void;
  disabled: boolean;
}

const examples = [
  'Where is authentication handled?',
  'How are chunks generated and stored?',
  'What model is used for embeddings?',
];

export const AskForm: React.FC<AskFormProps> = ({ onSuccess, onError, disabled }) => {
  const [question, setQuestion] = useState('How are chunks generated and stored?');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const res = await ask({ question });
      onSuccess(res);
      setStatus('Answer ready');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get answer';
      onError(message);
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel">
      <h2 className="section-title">Ask a question</h2>
      <p className="muted" style={{ marginBottom: 12 }}>Query the indexed codebase. Provide a specific question for better retrieval.</p>
      <form className="stack" onSubmit={handleSubmit}>
        <label className="label" htmlFor="question">Question</label>
        <textarea
          id="question"
          className="textarea"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={loading || disabled}
          required
        />
        <div className="examples">
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              className="example-pill"
              onClick={() => setQuestion(ex)}
              disabled={loading || disabled}
            >
              {ex}
            </button>
          ))}
        </div>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <button className="button" type="submit" disabled={loading || disabled}>
            {loading ? 'Asking…' : 'Ask'}
          </button>
          <span className="muted">POST /ask</span>
        </div>
      </form>
      {status && (
        <div style={{ marginTop: 12 }}>
          <StatusBanner variant={status === 'Answer ready' ? 'ok' : 'warn'} message={status} />
        </div>
      )}
    </section>
  );
};
