/**
 * LexoRank-style string positioning utility.
 * Generates an initial order string or calculates the midpoint between two strings.
 */
export function generateInitialOrder(index = 0): string {
  // Format: "0|i00000:", "0|i00010:", etc.
  const padded = index.toString().padStart(5, '0');
  return `0|i${padded}:`;
}

export function calculateMidpointOrder(prevOrder?: string, nextOrder?: string): string {
  if (!prevOrder && !nextOrder) {
    return '0|i00000:';
  }
  if (!prevOrder && nextOrder) {
    // Insert before next: decrement character code or prepend
    return nextOrder.slice(0, -1) + '0:';
  }
  if (prevOrder && !nextOrder) {
    // Insert after prev: append increment
    return prevOrder.slice(0, -1) + 'z:';
  }

  // Midpoint between prevOrder and nextOrder
  let p = prevOrder!;
  let n = nextOrder!;

  // Strip prefix "0|" and suffix ":" if present
  const pCore = p.replace(/^0\|/, '').replace(/:$/, '');
  const nCore = n.replace(/^0\|/, '').replace(/:$/, '');

  let mid = '';
  const len = Math.max(pCore.length, nCore.length);

  for (let i = 0; i < len; i++) {
    const pCode = i < pCore.length ? pCore.charCodeAt(i) : 96; // '`' before 'a'
    const nCode = i < nCore.length ? nCore.charCodeAt(i) : 123; // '{' after 'z'

    if (pCode === nCode) {
      mid += String.fromCharCode(pCode);
    } else {
      const midCode = Math.floor((pCode + nCode) / 2);
      if (midCode === pCode) {
        mid += String.fromCharCode(pCode);
        // Break tie by extending character depth
        mid += 'm';
      } else {
        mid += String.fromCharCode(midCode);
      }
      break;
    }
  }

  return `0|${mid}:`;
}
