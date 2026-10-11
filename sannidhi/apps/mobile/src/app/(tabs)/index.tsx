import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/components/Brand';
import { PostCard } from '@/components/PostCard';
import { TodayCard } from '@/components/TodayCard';
import { Txt } from '@/components/Txt';
import { Button } from '@/components/ui';
import { useStore } from '@/data/store';
import { colors } from '@/theme/tokens';

function TempleRow() {
  const { temples, followed } = useStore();
  const mine = temples.filter((t) => followed.includes(t.id));
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stories}>
      {mine.map((t, i) => (
        <Pressable
          key={t.id}
          style={styles.story}
          accessibilityLabel={t.name}
          onPress={() => router.push({ pathname: '/temple/[id]', params: { id: t.id } })}>
          <View style={[styles.ring, i < 2 && styles.ringNew]}>
            <Image source={t.cover} contentFit="cover" style={styles.storyImg} />
          </View>
          <Txt size={11.5} weight="medium" color={colors.ink2} numberOfLines={1}>
            {t.short}
          </Txt>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function EmptyFeed() {
  return (
    <View style={styles.empty}>
      <Txt size={17} weight="semibold" align="center">
        Follow your temples
      </Txt>
      <Txt size={14} color={colors.muted} align="center" lineHeight={20} style={{ marginTop: 6, marginBottom: 16 }}>
        Updates, darshan photos and events from the temples you follow appear here.
      </Txt>
      <Button label="Find temples near you" size="sm" onPress={() => router.push('/temples')} />
    </View>
  );
}

export default function Home() {
  const { feed, temples, followed } = useStore();
  const mine = temples.filter((t) => followed.includes(t.id));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.top}>
        <Brand size="sm" />
        <Pressable accessibilityLabel="Notifications" style={styles.bell}>
          <Bell size={22} color={colors.ink} strokeWidth={1.75} />
          <View style={styles.dot} />
        </Pressable>
      </View>
      <FlatList
        data={feed}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <PostCard post={item} />}
        ListHeaderComponent={
          mine.length ? (
            <>
              <TempleRow />
              <TodayCard temples={mine} />
            </>
          ) : null
        }
        ListEmptyComponent={EmptyFeed}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  top: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 18, paddingRight: 10 },
  bell: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 9, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.saffron, borderWidth: 2, borderColor: '#fff' },
  stories: { gap: 14, paddingHorizontal: 16, paddingTop: 6, paddingBottom: 14 },
  story: { width: 66, alignItems: 'center', gap: 6 },
  ring: { width: 62, height: 62, borderRadius: 31, padding: 2, borderWidth: 1.5, borderColor: colors.line },
  ringNew: { borderColor: colors.saffron, borderWidth: 2 },
  storyImg: { flex: 1, borderRadius: 31, borderWidth: 2, borderColor: '#fff' },
  empty: { paddingHorizontal: 32, paddingVertical: 64, alignItems: 'center' },
});
