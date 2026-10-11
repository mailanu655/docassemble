import type { ImageSourcePropType } from 'react-native';

export type LanguageCode = 'en' | 'te' | 'ta' | 'hi' | 'kn' | 'gu';

export type ParkingState = 'ok' | 'filling' | 'full';

export type TempleStatus = {
  open: boolean;
  closesAt: string;
  aarti: string;
  parking: ParkingState;
  parkingNote?: string;
};

export type Temple = {
  id: string;
  name: string;
  /** Short name used under the avatar row. */
  short: string;
  city: string;
  distanceMi: number;
  address: string;
  phone: string;
  deities: string[];
  languages: string[];
  followers: number;
  verified: boolean;
  cover: ImageSourcePropType;
  logo: ImageSourcePropType;
  about: string;
  status: TempleStatus;
};

export type PostType = 'update' | 'event' | 'darshan' | 'urgent';

export type Comment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

export type Post = {
  id: string;
  templeId: string;
  type: PostType;
  body: string;
  /** Translations keyed by language, shown with a "see original" toggle. */
  translations?: Partial<Record<LanguageCode, string>>;
  image?: ImageSourcePropType;
  eventId?: string;
  createdAt: string;
  prays: number;
  comments: Comment[];
};

export type TempleEvent = {
  id: string;
  templeId: string;
  category: string;
  title: string;
  startsAt: string;
  endsAt: string;
  location: string;
  address: string;
  going: number;
  cover: ImageSourcePropType;
  program: { time: string; label: string }[];
};
