import React from 'react';

interface DecisionPillProps {
  decision: 'PERMIT' | 'DENY' | string;
}

export function DecisionPill({ decision }: DecisionPillProps) {
  return (
    <span className={`decision-pill ${decision === 'DENY' ? 'decision-deny' : 'decision-permit'}`}>{decision}</span>
  );
}

export default DecisionPill;
