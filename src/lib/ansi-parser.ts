interface AnsiSegment {
  text: string;
  style: React.CSSProperties;
}

export function parseAnsiString(ansiString: string): AnsiSegment[] {
  const segments: AnsiSegment[] = [];
  const ansiRegex = /\[38;2;(\d+);(\d+);(\d+)m([^\[]*)\[0m/g;
  
  let lastIndex = 0;
  let match;
  
  while ((match = ansiRegex.exec(ansiString)) !== null) {
    const [fullMatch, r, g, b, text] = match;
    const startIndex = match.index;
    
    // Add any text before this match (without color)
    if (startIndex > lastIndex) {
      const plainText = ansiString.slice(lastIndex, startIndex);
      if (plainText) {
        segments.push({
          text: plainText,
          style: {}
        });
      }
    }
    
    // Add the colored segment
    segments.push({
      text: text,
      style: {
        color: `rgb(${r}, ${g}, ${b})`
      }
    });
    
    lastIndex = ansiRegex.lastIndex;
  }
  
  // Add any remaining text
  if (lastIndex < ansiString.length) {
    const remainingText = ansiString.slice(lastIndex);
    if (remainingText) {
      segments.push({
        text: remainingText,
        style: {}
      });
    }
  }
  
  return segments;
}