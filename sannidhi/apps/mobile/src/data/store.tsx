import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

import { events as seedEvents, posts as seedPosts, temples } from './seed';
import type { Comment, LanguageCode, Post, PostType } from './types';

const STORAGE_KEY = 'sannidhi.v1';

type Persisted = {
  language: LanguageCode | null;
  followed: string[];
  prayed: string[];
  rsvps: Record<string, number>;
  myComments: Record<string, Comment[]>;
  myPosts: Post[];
};

type State = Persisted & { hydrated: boolean };

const initial: State = {
  hydrated: false,
  language: null,
  followed: ['narasimha', 'ganesha', 'balaji', 'krishna', 'shiva'],
  prayed: ['p1'],
  rsvps: {},
  myComments: {},
  myPosts: [],
};

type Action =
  | { type: 'hydrate'; data: Partial<Persisted> }
  | { type: 'setLanguage'; language: LanguageCode }
  | { type: 'toggleFollow'; templeId: string }
  | { type: 'togglePray'; postId: string }
  | { type: 'rsvp'; eventId: string; headcount: number }
  | { type: 'cancelRsvp'; eventId: string }
  | { type: 'comment'; postId: string; comment: Comment }
  | { type: 'publish'; post: Post };

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.data, hydrated: true };
    case 'setLanguage':
      return { ...state, language: action.language };
    case 'toggleFollow':
      return { ...state, followed: toggle(state.followed, action.templeId) };
    case 'togglePray':
      return { ...state, prayed: toggle(state.prayed, action.postId) };
    case 'rsvp':
      return { ...state, rsvps: { ...state.rsvps, [action.eventId]: action.headcount } };
    case 'cancelRsvp': {
      const { [action.eventId]: _removed, ...rest } = state.rsvps;
      return { ...state, rsvps: rest };
    }
    case 'comment': {
      const list = state.myComments[action.postId] ?? [];
      return { ...state, myComments: { ...state.myComments, [action.postId]: [...list, action.comment] } };
    }
    case 'publish':
      return { ...state, myPosts: [action.post, ...state.myPosts] };
  }
}

type Store = ReturnType<typeof useStoreValue>;
const StoreContext = createContext<Store | null>(null);

function useStoreValue() {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => dispatch({ type: 'hydrate', data: raw ? (JSON.parse(raw) as Partial<Persisted>) : {} }))
      .catch(() => dispatch({ type: 'hydrate', data: {} }));
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    const { hydrated: _h, ...persisted } = state;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted)).catch(() => {});
  }, [state]);

  const allPosts = useMemo(
    () =>
      [...state.myPosts, ...seedPosts]
        .map((p) => ({ ...p, comments: [...p.comments, ...(state.myComments[p.id] ?? [])] }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [state.myPosts, state.myComments],
  );

  const feed = useMemo(
    () => allPosts.filter((p) => state.followed.includes(p.templeId)),
    [allPosts, state.followed],
  );

  const prayCount = useCallback(
    (post: Post) => {
      const seeded = seedPosts.find((p) => p.id === post.id);
      const startedPrayed = seeded ? initial.prayed.includes(post.id) : false;
      const now = state.prayed.includes(post.id);
      return post.prays + (now ? 1 : 0) - (startedPrayed ? 1 : 0);
    },
    [state.prayed],
  );

  const goingCount = useCallback(
    (eventId: string) => {
      const event = seedEvents.find((e) => e.id === eventId);
      return (event?.going ?? 0) + (state.rsvps[eventId] ?? 0);
    },
    [state.rsvps],
  );

  return {
    ...state,
    temples,
    events: seedEvents,
    allPosts,
    feed,
    prayCount,
    goingCount,
    temple: (id: string) => temples.find((t) => t.id === id),
    event: (id: string) => seedEvents.find((e) => e.id === id),
    post: (id: string) => allPosts.find((p) => p.id === id),
    isFollowing: (id: string) => state.followed.includes(id),
    hasPrayed: (id: string) => state.prayed.includes(id),
    setLanguage: (language: LanguageCode) => dispatch({ type: 'setLanguage', language }),
    toggleFollow: (templeId: string) => dispatch({ type: 'toggleFollow', templeId }),
    togglePray: (postId: string) => dispatch({ type: 'togglePray', postId }),
    rsvp: (eventId: string, headcount: number) => dispatch({ type: 'rsvp', eventId, headcount }),
    cancelRsvp: (eventId: string) => dispatch({ type: 'cancelRsvp', eventId }),
    addComment: (postId: string, body: string) =>
      dispatch({
        type: 'comment',
        postId,
        comment: { id: `mc-${Date.now()}`, author: 'You', body, createdAt: new Date().toISOString() },
      }),
    publish: (
      templeId: string,
      type: PostType,
      body: string,
      extras: Pick<Post, 'translations' | 'image' | 'eventId'> = {},
    ) =>
      dispatch({
        type: 'publish',
        post: {
          id: `mp-${Date.now()}`,
          templeId,
          type,
          body,
          ...extras,
          createdAt: new Date().toISOString(),
          prays: 0,
          comments: [],
        },
      }),
  };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}
