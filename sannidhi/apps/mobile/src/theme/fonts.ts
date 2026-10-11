import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_600SemiBold,
} from '@expo-google-fonts/noto-sans-devanagari';
import {
  NotoSansGujarati_400Regular,
  NotoSansGujarati_600SemiBold,
} from '@expo-google-fonts/noto-sans-gujarati';
import {
  NotoSansKannada_400Regular,
  NotoSansKannada_600SemiBold,
} from '@expo-google-fonts/noto-sans-kannada';
import { NotoSansTamil_400Regular, NotoSansTamil_600SemiBold } from '@expo-google-fonts/noto-sans-tamil';
import {
  NotoSansTelugu_400Regular,
  NotoSansTelugu_600SemiBold,
} from '@expo-google-fonts/noto-sans-telugu';

import type { Weight } from './tokens';

export const fontAssets = {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  NotoSansTelugu_400Regular,
  NotoSansTelugu_600SemiBold,
  NotoSansTamil_400Regular,
  NotoSansTamil_600SemiBold,
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_600SemiBold,
  NotoSansKannada_400Regular,
  NotoSansKannada_600SemiBold,
  NotoSansGujarati_400Regular,
  NotoSansGujarati_600SemiBold,
};

type Script = 'latin' | 'telugu' | 'tamil' | 'devanagari' | 'kannada' | 'gujarati';

const RANGES: [Script, number, number][] = [
  ['devanagari', 0x0900, 0x097f],
  ['gujarati', 0x0a80, 0x0aff],
  ['tamil', 0x0b80, 0x0bff],
  ['telugu', 0x0c00, 0x0c7f],
  ['kannada', 0x0c80, 0x0cff],
];

const FAMILY: Record<Exclude<Script, 'latin'>, string> = {
  telugu: 'NotoSansTelugu',
  tamil: 'NotoSansTamil',
  devanagari: 'NotoSansDevanagari',
  kannada: 'NotoSansKannada',
  gujarati: 'NotoSansGujarati',
};

/** The first Indic script found in the text, or latin. */
export function detectScript(text: string): Script {
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    for (const [script, lo, hi] of RANGES) {
      if (code >= lo && code <= hi) return script;
    }
  }
  return 'latin';
}

const INTER: Record<Weight, string> = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

/** Picks a font that has glyphs for the text, so Telugu never renders as empty boxes. */
export function fontFor(text: string, weight: Weight): string {
  const script = detectScript(text);
  if (script === 'latin') return INTER[weight];
  const heavy = weight === 'semibold' || weight === 'bold';
  return `${FAMILY[script]}_${heavy ? '600SemiBold' : '400Regular'}`;
}
