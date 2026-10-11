import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Txt } from '@/components/Txt';
import { Avatar, Dot, useT, Verified } from '@/components/ui';
import { count } from '@/data/format';
import { useStore } from '@/data/store';
import { font, colors, radius } from '@/theme/tokens';

export default function Temples() {
  const store = useStore();
  const t = useT();
  const [q, setQ] = useState('');
  const list = store.temples
    .filter((x) => `${x.name} ${x.city} ${x.deities.join(' ')}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => a.distanceMi - b.distanceMi);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.top}>
        <Txt size={28} weight="bold" tight>
          {t('temples')}
        </Txt>
        <View style={styles.search}>
          <Search size={18} color={colors.muted} strokeWidth={2} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Search by name, deity or city"
            placeholderTextColor={colors.faint}
            style={styles.input}
            accessibilityLabel="Search temples"
          />
        </View>
      </View>
      <FlatList
        data={list}
        keyExtractor={(x) => x.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListHeaderComponent={
          <Txt size={12} weight="semibold" color={colors.muted} style={styles.section}>
            NEAR PLANO, TX
          </Txt>
        }
        renderItem={({ item }) => {
          const following = store.isFollowing(item.id);
          return (
            <Pressable
              style={styles.row}
              onPress={() => router.push({ pathname: '/temple/[id]', params: { id: item.id } })}>
              <Avatar source={item.cover} size={52} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Txt size={15} weight="semibold" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {item.name}
                  </Txt>
                  {item.verified && <Verified />}
                </View>
                <Txt size={13} color={colors.muted} numberOfLines={1} style={{ marginTop: 1 }}>
                  {item.city} · {item.distanceMi} mi · {count(item.followers)} followers
                </Txt>
                <View style={styles.status}>
                  <Dot tone={item.status.open ? 'open' : 'closed'} />
                  <Txt size={12.5} color={colors.ink2}>
                    {item.status.open ? `Open until ${item.status.closesAt}` : 'Closed now'}
                  </Txt>
                  {!item.verified && (
                    <Txt size={12.5} color={colors.muted}>
                      · Unclaimed
                    </Txt>
                  )}
                </View>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: following }}
                testID={`follow-${item.id}`}
                onPress={() => store.toggleFollow(item.id)}
                style={[styles.follow, following && styles.following]}>
                <Txt size={13.5} weight="semibold" color={following ? colors.ink : '#fff'}>
                  {following ? t('following') : t('follow')}
                </Txt>
              </Pressable>
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  top: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 4 },
  search: { marginTop: 14, height: 44, borderRadius: radius.md, backgroundColor: colors.soft, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 },
  input: { flex: 1, fontFamily: font.regular, fontSize: 15, color: colors.ink, height: 44 },
  section: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 6, letterSpacing: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 11 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  follow: { height: 34, paddingHorizontal: 14, borderRadius: 17, backgroundColor: colors.ink, justifyContent: 'center' },
  following: { backgroundColor: colors.soft },
});
