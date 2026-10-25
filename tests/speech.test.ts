import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SPEECH_PREFERENCES, getJapaneseVoices, parseSpeechPreferences,
  pickJapaneseVoice, SPEECH_RATES, voiceKey, type VoiceLike,
} from '../src/lib/speech';

const local: VoiceLike = { name: 'Japanese device voice', lang: 'ja-JP', voiceURI: 'local-ja', localService: true, default: false };
const remote: VoiceLike = { name: 'Japanese online voice', lang: 'ja_JP', voiceURI: 'remote-ja', localService: false, default: false };
const natural: VoiceLike = { name: 'Japanese (Natural)', lang: 'ja-JP', voiceURI: 'natural-ja', localService: false, default: false };
const english: VoiceLike = { name: 'English Natural', lang: 'en-US', voiceURI: 'english', localService: false, default: true };

describe('browser-provided Japanese voice selection', () => {
  it('accepts ja, ja-JP and ja_JP without accidentally accepting other language prefixes', () => {
    const japanese = [local, remote, { ...local, lang: 'JA', voiceURI: 'plain-ja' }];
    expect(getJapaneseVoices([...japanese, english, { ...local, lang: 'jam', voiceURI: 'jam' }, { ...local, lang: 'en-ja', voiceURI: 'en-ja' }])).toEqual(japanese);
  });

  it('uses stable URI keys and normalizes the language in a name fallback', () => {
    expect(voiceKey(local)).toBe('uri:local-ja');
    expect(voiceKey({ ...local, voiceURI: '', lang: 'JA_jp' })).toBe(voiceKey({ ...local, voiceURI: '', lang: 'ja-JP' }));
    expect(voiceKey({ ...local, voiceURI: '', name: 'Another voice' })).not.toBe(voiceKey({ ...local, voiceURI: '' }));
  });

  it('removes duplicate browser entries without losing the original native-like object', () => {
    expect(getJapaneseVoices([local, { ...local }, remote])).toEqual([local, remote]);
    expect(getJapaneseVoices([local])[0]).toBe(local);
  });

  it('can prefer a marked natural voice online while never choosing a non-Japanese voice', () => {
    const selection = pickJapaneseVoice([english, local, natural]);
    expect(selection).toEqual({ voice: natural, reason: 'automatic', requestedUnavailable: false });
  });

  it('slightly prefers an unmarked remote option online, with a local-only fallback when needed', () => {
    const unmarkedRemote = { ...remote, name: 'Japanese voice' };
    expect(pickJapaneseVoice([local, unmarkedRemote]).voice).toBe(unmarkedRemote);
    expect(pickJapaneseVoice([local]).voice).toBe(local);
  });

  it('respects an explicit local choice even when a marked natural remote voice is available', () => {
    expect(pickJapaneseVoice([natural, local], voiceKey(local))).toEqual({ voice: local, reason: 'preferred', requestedUnavailable: false });
  });

  it('preserves a selected voice when the browser enumeration order changes', () => {
    const preference = voiceKey(remote);
    expect(pickJapaneseVoice([remote, local], preference).voice).toBe(remote);
    expect(pickJapaneseVoice([local, remote], preference).voice).toBe(remote);
  });

  it('automatically selects local Japanese speech offline and reports a selected remote fallback', () => {
    expect(pickJapaneseVoice([natural, local], 'auto', false)).toEqual({ voice: local, reason: 'automatic', requestedUnavailable: false });
    expect(pickJapaneseVoice([natural, local], voiceKey(natural), false)).toEqual({ voice: local, reason: 'offline-fallback', requestedUnavailable: true });
  });

  it('reports unavailable rather than offering remote-only voices offline', () => {
    expect(pickJapaneseVoice([natural, remote], 'auto', false)).toEqual({ voice: undefined, reason: 'unavailable', requestedUnavailable: false });
    expect(pickJapaneseVoice([natural], voiceKey(natural), false)).toEqual({ voice: undefined, reason: 'unavailable', requestedUnavailable: true });
  });

  it('falls back without throwing while the saved voice is absent or voices have not loaded yet', () => {
    expect(pickJapaneseVoice([local], 'uri:removed-voice')).toEqual({ voice: local, reason: 'automatic', requestedUnavailable: true });
    expect(pickJapaneseVoice([], voiceKey(local))).toEqual({ voice: undefined, reason: 'unavailable', requestedUnavailable: true });
    expect(pickJapaneseVoice([english])).toEqual({ voice: undefined, reason: 'unavailable', requestedUnavailable: false });
  });

  it('makes tied automatic choices deterministic without mutating the original array', () => {
    const another = { ...local, name: 'Another device voice', voiceURI: 'aaa-local' };
    const voices = [local, another];
    expect(pickJapaneseVoice(voices).voice).toBe(another);
    expect(pickJapaneseVoice([...voices].reverse()).voice).toBe(another);
    expect(voices).toEqual([local, another]);
  });
});

describe('speech preference validation', () => {
  it('defaults to natural playback speed rather than forced slow speech', () => {
    expect(DEFAULT_SPEECH_PREFERENCES).toEqual({ voice: 'auto', rate: 1 });
    for (const value of [undefined, null, [], 1, 'bad', new Date(), Object.create({ voice: 'inherited', rate: 0.8 })]) {
      expect(parseSpeechPreferences(value)).toEqual({ voice: 'auto', rate: 1 });
    }
  });

  it('retains the chosen stable key and each supported playback rate', () => {
    for (const rate of SPEECH_RATES) expect(parseSpeechPreferences({ voice: voiceKey(local), rate })).toEqual({ voice: voiceKey(local), rate });
  });

  it('validates fields independently and does not coerce corrupt numeric values', () => {
    for (const rate of [NaN, Infinity, -1, 0, 9, '0.8', 0.9]) {
      expect(parseSpeechPreferences({ voice: voiceKey(local), rate })).toEqual({ voice: voiceKey(local), rate: 1 });
    }
    for (const voice of ['', '  ', 1, null, 'a'.repeat(1025)]) {
      expect(parseSpeechPreferences({ voice, rate: 0.8 })).toEqual({ voice: 'auto', rate: 0.8 });
    }
    expect(parseSpeechPreferences({ voice: ' auto ', rate: 1.1, unknown: true })).toEqual({ voice: 'auto', rate: 1.1 });
  });
});
