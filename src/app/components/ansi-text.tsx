"use client"

import React from 'react';
import { parseAnsiString } from '@/lib/ansi-parser';

interface AnsiTextProps {
  children: string;
  className?: string;
}

export default function AnsiText({ children, className }: AnsiTextProps) {
  const segments = parseAnsiString(children);
  
  return (
    <span className={className}>
      {segments.map((segment, index) => (
        <span key={index} style={segment.style}>
          {segment.text}
        </span>
      ))}
    </span>
  );
}