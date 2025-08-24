import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Basic HTML escape to protect against accidental HTML injection when interpolating strings
export function escapeHTML(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Sanitize free-text inputs to reduce the chance of SQL/XSS payloads reaching the backend
// - Normalizes unicode
// - Removes control chars
// - Collapses whitespace
// - Strips common SQL token characters and comment markers
export function sanitizeTextInput(
  value: string,
  options?: { allowNewlines?: boolean; maxLength?: number; trimEdges?: boolean }
): string {
  const allowNewlines = options?.allowNewlines ?? false
  const maxLength = options?.maxLength ?? 2000
  const trimEdges   = options?.trimEdges ?? false   // ← new flag

  let sanitized = (value || '').normalize('NFKC')

  // Remove control chars (optionally keep newlines)
  const controlChars = allowNewlines ? /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g : /[\x00-\x1F\x7F]/g
  sanitized = sanitized.replace(controlChars, '')

  // Remove some SQL/comment tokens
  sanitized = sanitized.replace(/(--|;|\/\*|\*\/|`|\u2018|\u2019|\u201C|\u201D)/g, ' ')

  // Collapse whitespace without trimming trailing during typing
  if (allowNewlines) {
    // collapse spaces/tabs but keep newlines; no trim of line ends while typing
    sanitized = sanitized.replace(/[ \t\f\v]+/g, ' ')
  } else {
    // collapse 2+ spaces to one; keep a single trailing space
    sanitized = sanitized.replace(/\s{2,}/g, ' ')
    if (trimEdges) sanitized = sanitized.trim()
    else sanitized = sanitized.replace(/^\s+/, '') // avoid leading spaces only
  }

  if (sanitized.length > maxLength) sanitized = sanitized.slice(0, maxLength)
  return sanitized
}


// Keep only digits up to a max length (e.g., for room numbers)
export function sanitizeDigits(value: string, maxLength = 10): string {
  const digitsOnly = (value || '').replace(/\D+/g, '')
  return digitsOnly.slice(0, maxLength)
}

// Trim and normalize email; lowercased to keep consistency
export function sanitizeEmail(value: string): string {
  return (value || '').trim().toLowerCase()
}
