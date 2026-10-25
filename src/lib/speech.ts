/** Only browser-provided voices are considered. Name hints help choose a useful
 * default, but cannot guarantee that any engine sounds natural on a device. */
export interface VoiceLike {
  name: string;
  lang: string;
  voiceURI: string;
  localService: boolean;
  default: boolean;
}

export type VoiceSelectionReason = 'preferred' | 'automatic' | 'offline-fallback' | 'unavailable';

export interface VoiceSelection<T extends VoiceLike = VoiceLike> {
  voice: T | undefined;
  reason: VoiceSelectionReason;
  requestedUnavailable: boolean;
}

export interface SpeechPreferences {
  voice: string;
  rate: number;
}

export const SPEECH_RATES = [0.8, 1, 1.1] as const;
export const DEFAULT_SPEECH_PREFERENCES: Readonly<SpeechPreferences> = { voice: 'auto', rate: 1 };

function normalizedLanguage(language: string): string {
  return language.trim().replaceAll('_', '-').toLowerCase();
}

/** A browser's stable voice identifier, independent of its enumeration order. */
export function voiceKey(voice: VoiceLike): string {
  const uri = voice.voiceURI.trim();
  return uri ? `uri:${uri}` : `name:${normalizedLanguage(voice.lang)}:${voice.name}`;
}

/** Preserve native SpeechSynthesisVoice instances rather than copying them. */
export function getJapaneseVoices<T extends VoiceLike>(voices: readonly T[]): T[] {
  const seen = new Set<string>();
  return voices.filter((voice) => {
    if (!/^ja(?:$|-)/.test(normalizedLanguage(voice.lang))) return false;
    const key = voiceKey(voice);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function scoreVoice(voice: VoiceLike): number {
  const qualityHint = /(?:^|[\s(_-])(?:natural|neural|premium|enhanced|online)(?:$|[\s)_-])/i.test(voice.name);
  return (qualityHint ? 100 : 0) + (voice.localService ? 0 : 12) + (voice.default ? 2 : 0);
}

function automaticVoice<T extends VoiceLike>(voices: readonly T[], online: boolean): T | undefined {
  const usable = online ? [...voices] : voices.filter((voice) => voice.localService);
  return usable.sort((left, right) => {
    const scoreDifference = scoreVoice(right) - scoreVoice(left);
    if (scoreDifference) return scoreDifference;
    const leftKey = voiceKey(left);
    const rightKey = voiceKey(right);
    return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
  })[0];
}

/** Respect an explicit available Japanese voice. Offline mode never pretends
 * that a remote voice works: it selects a local fallback, or reports unavailable.
 * A preference can remain stored while the browser loads its voice list. */
export function pickJapaneseVoice<T extends VoiceLike>(
  voices: readonly T[],
  preference = 'auto',
  online = true,
): VoiceSelection<T> {
  const japanese = getJapaneseVoices(voices);
  const wantsSpecificVoice = preference !== 'auto';
  const preferred = wantsSpecificVoice ? japanese.find((voice) => voiceKey(voice) === preference) : undefined;

  if (preferred && (online || preferred.localService)) {
    return { voice: preferred, reason: 'preferred', requestedUnavailable: false };
  }

  const voice = automaticVoice(japanese, online);
  const requestedUnavailable = wantsSpecificVoice && (!preferred || (!online && !preferred.localService));
  return {
    voice,
    reason: !voice ? 'unavailable' : preferred && !online ? 'offline-fallback' : 'automatic',
    requestedUnavailable,
  };
}

/** UI preferences are separate from the learning-progress/backup schema. */
export function parseSpeechPreferences(value: unknown): SpeechPreferences {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return { ...DEFAULT_SPEECH_PREFERENCES };
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return { ...DEFAULT_SPEECH_PREFERENCES };
  const input = value as Record<string, unknown>;
  const voice = Object.hasOwn(input, 'voice') && typeof input.voice === 'string'
    && input.voice.trim().length > 0 && input.voice.length <= 1024 ? input.voice.trim() : 'auto';
  const rate = Object.hasOwn(input, 'rate') && typeof input.rate === 'number'
    && (SPEECH_RATES as readonly number[]).includes(input.rate) ? input.rate : 1;
  return { voice, rate };
}
