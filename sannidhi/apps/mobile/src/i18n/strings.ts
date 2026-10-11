import type { LanguageCode } from '@/data/types';

export const LANGUAGES: { code: LanguageCode; native: string; english: string }[] = [
  { code: 'en', native: 'English', english: 'English' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil' },
  { code: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { code: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada' },
  { code: 'gu', native: 'ગુજરાતી', english: 'Gujarati' },
];

const en = {
  home: 'Home',
  events: 'Events',
  temples: 'Temples',
  me: 'Me',
  today: 'Today',
  allTemples: 'All temples',
  openUntil: 'Open until',
  closed: 'Closed now',
  aarti: 'Aarti',
  pray: 'Pray',
  share: 'Share',
  rsvp: 'RSVP',
  going: 'going',
  imGoing: "I'm going",
  youreGoing: "You're going",
  follow: 'Follow',
  following: 'Following',
  directions: 'Directions',
  seeTranslation: 'See translation',
  seeOriginal: 'See original',
};

export type StringKey = keyof typeof en;

const te: Partial<Record<StringKey, string>> = {
  home: 'హోమ్',
  events: 'కార్యక్రమాలు',
  temples: 'ఆలయాలు',
  me: 'నేను',
  today: 'ఈ రోజు',
  allTemples: 'అన్ని ఆలయాలు',
  pray: 'ప్రార్థన',
  share: 'షేర్',
  going: 'వస్తున్నారు',
  imGoing: 'నేను వస్తున్నాను',
  follow: 'ఫాలో',
  following: 'ఫాలో అవుతున్నారు',
  directions: 'దారి',
  seeTranslation: 'అనువాదం చూడండి',
  seeOriginal: 'అసలు చూడండి',
};

const tables: Partial<Record<LanguageCode, Partial<Record<StringKey, string>>>> = { en, te };

export function translate(language: LanguageCode | null, key: StringKey): string {
  return tables[language ?? 'en']?.[key] ?? en[key];
}
