import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateBox } from '@/components/EventInline';
import { Txt } from '@/components/Txt';
import { useT } from '@/components/ui';
import { clock, count, weekdayShort } from '@/data/format';
import { useStore } from '@/data/store';
import { colors, radius } from '@/theme/tokens';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Events() {
  const store = useStore();
  const t = useT();
  const upcoming = store.events
    .filter((e) => store.followed.includes(e.templeId))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const sections = upcoming.reduce<{ title: string; data: typeof upcoming }[]>((acc, e) => {
    const d = new Date(e.startsAt);
    const title = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    const last = acc[acc.length - 1];
    if (last?.title === title) last.data.push(e);
    else acc.push({ title, data: [e] });
    return acc;
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.top}>
        <Txt size={28} weight="bold" tight>
          {t('events')}
        </Txt>
        <Txt size={14} color={colors.muted} style={{ marginTop: 2 }}>
          From the temples you follow
        </Txt>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(e) => e.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderSectionHeader={({ section }) => (
          <Txt size={12} weight="semibold" color={colors.muted} style={styles.section}>
            {section.title.toUpperCase()}
          </Txt>
        )}
        renderItem={({ item }) => {
          const temple = store.temple(item.templeId);
          const mine = store.rsvps[item.id];
          return (
            <Pressable
              style={styles.row}
              testID={`event-row-${item.id}`}
              onPress={() => router.push({ pathname: '/event/[id]', params: { id: item.id } })}>
              <DateBox local={item.startsAt} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Txt size={15.5} weight="semibold" numberOfLines={1}>
                  {item.title}
                </Txt>
                <Txt size={13} color={colors.muted} numberOfLines={1} style={{ marginTop: 2 }}>
                  {weekdayShort(item.startsAt)} · {clock(item.startsAt)} · {temple?.short}
                </Txt>
                <Txt size={12.5} weight="medium" color={mine ? colors.saffron : colors.ink2} style={{ marginTop: 5 }}>
                  {mine ? `You're going with ${mine}` : `${count(store.goingCount(item.id))} ${t('going')}`}
                </Txt>
              </View>
              <Image source={item.cover} contentFit="cover" style={styles.thumb} />
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  top: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 6 },
  section: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 8, letterSpacing: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  thumb: { width: 64, height: 64, borderRadius: radius.sm },
});
