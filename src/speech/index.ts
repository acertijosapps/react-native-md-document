export type { MockSpeechOptions } from './mockEngine';
export { createMockSpeechEngine } from './mockEngine';
export { createNativeSpeechEngine } from './nativeEngine';
export type { SpeechEngine, SpeechHandlers, SpeechOptions, SpeechUtterance } from './types';
export { boundaryToRange, segmentUtterances } from './types';
export type { SpeechStatus, UseTextToSpeech, UseTextToSpeechParams } from './useTextToSpeech';
export { useTextToSpeech } from './useTextToSpeech';
