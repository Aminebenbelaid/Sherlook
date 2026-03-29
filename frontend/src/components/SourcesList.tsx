import React from 'react';
import { SourceChunk } from '../types';

interface SourcesListProps {
  sources: SourceChunk[];
}

export const SourcesList: React.FC<SourcesListProps> = ({ sources }) => {
  return (
    <section className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Sources</h2>
        <span className="badge">{sources.length} source{sources.length === 1 ? '' : 's'}</span>
      </div>
      {sources.length === 0 ? (
        <p className="muted">No sources yet. Run /ask to see retrieved chunks.</p>
      ) : (
        <div className="card-list" style={{ marginTop: 12 }}>
          {sources.map((source, idx) => (
            <article className="card" key={`${source.file_path}-${source.chunk_index}-${idx}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: 'var(--muted)' }}>Chunk #{source.chunk_index}</span>
                <span className="badge" style={{ background: 'rgba(94, 234, 212, 0.08)' }}>Score: {source.score.toFixed(2)}</span>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.4 }}>{source.file_path}</div>
              {source.text && (
                <pre
                  style={{
                    marginTop: 8,
                    fontSize: 12,
                    lineHeight: 1.5,
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: 8,
                    maxHeight: 220,
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {source.text}
                </pre>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
