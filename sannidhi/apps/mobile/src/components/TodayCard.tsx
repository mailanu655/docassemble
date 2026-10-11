import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Fragment } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { todayLabel } from '@/data/format';
import type { Temple } from '@/data/types';
import { colors, radius } from '@/theme/tokens';

import { Txt } from './Txt';
import { Dot, Hairline, useT } from './ui';

/** The "Today at your temples" card: timings and parking, the details devotees check before driving. */
export function TodayCard({ temples }: { temples: Temple[] }) {
  const t = useT();
  const primary = temples[0];
  if (!primary) return null;
  const rows: { tone: 'open' | 'busy' | 'closed'; title: string; sub: string; id: string }[] = [
    {
      id: primary.id,
      tone: primary.status.open ? 'open' : 'closed',
      title: primary.name.replace(/^Sri /, ''),
      sub: primary.status.open
        ? `${t('openUntil')} ${primary.status.closesAt} · ${t('aarti')} ${primary.status.aarti}`
        : `${t('closed')} · ${t('aarti')} ${primary.status.aarti}`,
    },
  ];
  const busy = temples.find((x) => x.status.parking !== 'ok');
  if (busy) {
    rows.push({
      id: busy.id,
      tone: 'busy',
      title: busy.status.parking === 'full' ? `Parking is full at ${busy.short}` : 'Parking is filling up',
      sub: busy.status.parkingNote ?? busy.address,
    });
  }

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Txt size={12} weight="semibold" color={colors.muted} style={{ letterSpacing: 0.7 }}>
          {`${t('today')} · ${todayLabel()}`.toUpperCase()}
        </Txt>
        <Pressable onPress={() => router.push('/temples')} style={styles.link} hitSlop={8}>
          <Txt size={13} weight="medium" color={colors.ink2}>
            {t('allTemples')}
          </Txt>
          <ChevronRight size={14} color={colors.ink2} strokeWidth={2} />
        </Pressable>
      </View>
      {rows.map((r, i) => (
        <Fragment key={`${r.id}-${i}`}>
          {i > 0 && <Hairline />}
          <Pressable
            style={styles.row}
            onPress={() => router.push({ pathname: '/temple/[id]', params: { id: r.id } })}>
            <View style={{ marginTop: 3 }}>
              <Dot tone={r.tone} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt size={14.5} weight="semibold">
                {r.title}
              </Txt>
              <Txt size={13} color={colors.muted} style={{ marginTop: 1 }}>
                {r.sub}
              </Txt>
            </View>
          </Pressable>
        </Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: 2, marginBottom: 10, borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  row: { flexDirection: 'row', gap: 10, paddingVertical: 9 },
});
