import React, { useState } from 'react';

interface AnswerCardProps {
  answer: string;
  onCopy?: () => void;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({ answer, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(answer);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Answer</h2>
        <button className="copy-btn" onClick={handleCopy} disabled={!answer} type="button">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {answer ? <div className="answer-box">{answer}</div> : <p className="muted">No answer yet. Ask a question to see results.</p>}
    </div>
  );
};
