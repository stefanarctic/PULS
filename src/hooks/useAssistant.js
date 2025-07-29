import { useRef } from 'react';

// Ref global la nivel de modul
let assistantRef = null;

export function setAssistantRef(ref) {
  assistantRef = ref;
}

export function useAssistant() {
  // Returnează ref-ul global
  return assistantRef;
} 