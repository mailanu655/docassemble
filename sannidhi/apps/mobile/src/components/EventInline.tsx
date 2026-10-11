import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { clock, count, dayOfMonth, monthShort, weekdayShort } from '@/data/format';
import { useStore } from '@/data/store';
import type { TempleEvent } from '@/data/types';
import { colors, radius } from '@/theme/tokens';

import { Txt } from './Txt';
import { useT } from './ui';

const FACES = ['#F1C9A5', '#C8D8C3', '#D9C9E8'];

export function DateBox({ local, size = 48 }: { local: string; size?: number }) {
  return (
    <View style={[styles.date, { width: size, height: size + 4 }]}>
      <Txt size={10.5} weight="bold" color={colors.saffron} style={{ letterSpacing: 0.8 }}>
        {monthShort(local)}
      </Txt>
      <Txt size={20} weight="bold" style={{ marginTop: 1 }}>
        {dayOfMonth(local)}
      </Txt>
    </View>
  );
}

export function GoingFaces() {
  return (
    <View style={{ flexDirection: 'row' }}>
      {FACES.map((c, i) => (
        <View key={c} style={[styles.face, { backgroundColor: c, marginLeft: i === 0 ? 0 : -5 }]} />
      ))}
    </View>
  );
}

export function EventInline({ event }: { event: TempleEvent }) {
  const store = useStore();
  const t = useT();
  const mine = store.rsvps[event.id];
  const open = () => router.push({ pathname: '/event/[id]', params: { id: event.id } });
  return (
    <Pressable onPress={open} style={styles.card} accessibilityRole="link" accessibilityLabel={`Open event ${event.title}`}>
      <DateBox local={event.startsAt} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Txt size={15} weight="semibold" numberOfLines={1}>
          {event.title}
        </Txt>
        <Txt size={13} color={colors.muted} numberOfLines={1} style={{ marginTop: 2 }}>
          {weekdayShort(event.startsAt)} · {clock(event.startsAt)} – {clock(event.endsAt)}
        </Txt>
        <View style={styles.going}>
          <GoingFaces />
          <Txt size={12.5} weight="medium" color={colors.ink2}>
            {count(store.goingCount(event.id))} {t('going')}
          </Txt>
        </View>
      </View>
      <View style={[styles.rsvp, mine ? styles.rsvpOn : null]}>
        <Txt size={13.5} weight="semibold" color={mine ? colors.saffron : '#fff'}>
          {mine ? `Going · ${mine}` : t('rsvp')}
        </Txt>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 4,
  },
  date: { borderRadius: 10, backgroundColor: colors.saffronTint, alignItems: 'center', justifyContent: 'center' },
  going: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  face: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: '#fff' },
  rsvp: { height: 34, paddingHorizontal: 14, borderRadius: 17, backgroundColor: colors.ink, justifyContent: 'center' },
  rsvpOn: { backgroundColor: colors.saffronTint },
});
