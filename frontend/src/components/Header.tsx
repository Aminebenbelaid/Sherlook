import React from 'react';

interface HeaderProps {
  indexed: boolean;
  sourceCount: number;
}

export const Header: React.FC<HeaderProps> = ({ indexed, sourceCount }) => {
  return (
    <header className="panel" style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 22, letterSpacing: -0.2 }}>Sherlook</h1>
        <p className="muted" style={{ margin: '4px 0 0' }}>Ask your codebase with RAG-powered answers.</p>
      </div>
      <div className="badge" aria-live="polite">
        <span style={{ width: 8, height: 8, borderRadius: 999, background: indexed ? 'var(--success)' : 'var(--danger)' }} />
        {indexed ? `Indexed • ${sourceCount} chunks` : 'Not indexed'}
      </div>
    </header>
  );
};
