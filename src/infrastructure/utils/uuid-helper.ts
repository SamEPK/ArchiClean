/**
 * UUID generator compatible with both ESM and CommonJS
 * Uses Node.js built-in crypto.randomUUID() which is available in Node 14.17.0+
 */

import { randomUUID } from 'crypto';

export function uuidv4(): string {
  return randomUUID();
}

