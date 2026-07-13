import React from 'react';

interface ActionBadgeProps {
  label: string;
}

export function ActionBadge({ label }: ActionBadgeProps) {
  return (
    <span className="action-badge">{label}</span>
  );
}

export default ActionBadge;
