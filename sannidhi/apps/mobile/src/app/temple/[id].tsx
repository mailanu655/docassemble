import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { Car, Check, Clock, Navigation, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CoverHeader } from '@/components/CoverHeader';
import { EventInline } from '@/components/EventInline';
import { PostCard } from '@/components/PostCard';
import { Txt } from '@/components/Txt';
import { Card, Dot, useT, Verified } from '@/components/ui';
import { count } from '@/data/format';
import { useStore } from '@/data/store';
import { colors, radius } from '@/theme/tokens';

type Tab = 'posts' | 'events' | 'about';

const PARKING = { ok: 'Plenty of space', filling: 'Filling up', full: 'Full' } as const;

function openMaps(address: string) {
  const q = encodeURIComponent(address);
  const url = Platform.select({ ios: `maps:?q=${q}`, android: `geo:0,0?q=${q}`, default: `https://maps.google.com/?q=${q}` });
  Linking.openURL(url).catch(() => {});
}

export default function TempleProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore();
  const t = useT();
  const [tab, setTab] = useState<Tab>('posts');
  const temple = store.temple(id);

  if (!temple) {
    return (
      <View style={styles.missing}>
        <Txt size={16} weight="semibold">
          Temple not found
        </Txt>
      </View>
    );
  }

  const following = store.isFollowing(temple.id);
  const posts = store.allPosts.filter((p) => p.templeId === temple.id);
  const events = store.events.filter((e) => e.templeId === temple.id);
  const parkingTone = temple.status.parking === 'ok' ? colors.ink2 : colors.amberText;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 40 }}>
      <CoverHeader source={temple.cover} height={250} shareText={`${temple.name} on Sannidhi: https://sannidhi.app/t/${temple.id}`} />

      <View style={styles.prof}>
        <Image source={temple.logo} contentFit="cover" contentPosition="top" style={styles.logo} />
        <View style={styles.nameRow}>
          <Txt size={23} weight="bold" tight lineHeight={28} style={{ flexShrink: 1 }}>
            {temple.name}
          </Txt>
          {temple.verified && <Verified size={20} />}
        </View>
        <Txt size={13.5} color={colors.muted} style={{ marginTop: 2 }}>
          Hindu temple · {temple.city} · {temple.distanceMi} mi
        </Txt>
        <View style={styles.stats}>
          <Txt size={13.5} color={colors.ink2}>
            <Txt size={13.5} weight="semibold">
              {count(temple.followers + (following ? 1 : 0))}
            </Txt>{' '}
            followers
          </Txt>
          <View style={styles.sep} />
          <Txt size={13.5} color={colors.ink2}>
            {temple.languages.join(' · ')}
          </Txt>
        </View>

        {!temple.verified && (
          <View style={styles.unclaimed}>
            <Txt size={13} color={colors.ink2} lineHeight={18}>
              This profile was built from the temple’s public website and hasn’t been claimed yet. Information may be out of date.
            </Txt>
          </View>
        )}

        <View style={styles.btnRow}>
          <Pressable
            testID="profile-follow"
            accessibilityRole="button"
            accessibilityState={{ selected: following }}
            onPress={() => store.toggleFollow(temple.id)}
            style={[styles.btn, { flex: 1.2 }, following ? styles.btnSoft : styles.btnInk]}>
            {following && <Check size={17} color={colors.ink} strokeWidth={2.4} />}
            <Txt size={14.5} weight="semibold" color={following ? colors.ink : '#fff'}>
              {following ? t('following') : t('follow')}
            </Txt>
          </Pressable>
          <Pressable onPress={() => openMaps(temple.address)} style={[styles.btn, styles.btnOutline, { flex: 1 }]}>
            <Navigation size={17} color={colors.ink} strokeWidth={2} />
            <Txt size={14.5} weight="semibold">
              {t('directions')}
            </Txt>
          </Pressable>
          <Pressable
            accessibilityLabel={`Call ${temple.name}`}
            onPress={() => Linking.openURL(`tel:${temple.phone.replace(/\s/g, '')}`).catch(() => {})}
            style={[styles.btn, styles.btnOutline, { width: 42 }]}>
            <Phone size={17} color={colors.ink} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      <Card style={styles.today}>
        <View style={styles.todayHead}>
          <Dot tone={temple.status.open ? 'open' : 'closed'} />
          <Txt size={14.5} weight="semibold">
            {temple.status.open ? 'Open now' : 'Closed now'}
          </Txt>
          <Txt size={14} color={colors.muted}>
            · {temple.status.open ? `Closes ${temple.status.closesAt}` : 'Opens tomorrow'}
          </Txt>
        </View>
        <View style={styles.tiles}>
          <View style={styles.tile}>
            <Clock size={17} color={colors.ink2} strokeWidth={1.75} />
            <View>
              <Txt size={13} weight="semibold">
                Evening aarti
              </Txt>
              <Txt size={13} weight="medium" color={colors.ink2}>
                {temple.status.aarti}
              </Txt>
            </View>
          </View>
          <View style={styles.tile}>
            <Car size={17} color={colors.ink2} strokeWidth={1.75} />
            <View style={{ flexShrink: 1 }}>
              <Txt size={13} weight="semibold">
                Parking
              </Txt>
              <Txt size={13} weight="medium" color={parkingTone}>
                {PARKING[temple.status.parking]}
              </Txt>
            </View>
          </View>
        </View>
      </Card>

      <View style={styles.tabs} accessibilityRole="tablist">
        {(['posts', 'events', 'about'] as Tab[]).map((k) => (
          <Pressable key={k} accessibilityRole="tab" accessibilityState={{ selected: tab === k }} onPress={() => setTab(k)}>
            <Txt size={14.5} weight="semibold" color={tab === k ? colors.ink : colors.faint} style={[styles.tab, tab === k && styles.tabOn]}>
              {k === 'posts' ? 'Posts' : k === 'events' ? 'Events' : 'About'}
            </Txt>
          </Pressable>
        ))}
      </View>

      {tab === 'posts' &&
        (posts.length ? (
          posts.map((p, i) => (
            <View key={p.id} style={i === 0 ? { marginTop: -1 } : undefined}>
              <PostCard post={p} showCity={false} />
            </View>
          ))
        ) : (
          <Txt size={14} color={colors.muted} style={styles.emptyText}>
            No posts yet.
          </Txt>
        ))}

      {tab === 'events' && (
        <View style={{ padding: 16, gap: 10 }}>
          {events.length ? events.map((e) => <EventInline key={e.id} event={e} />) : (
            <Txt size={14} color={colors.muted}>
              No upcoming events.
            </Txt>
          )}
        </View>
      )}

      {tab === 'about' && (
        <View style={{ padding: 18, gap: 16 }}>
          <Txt size={15} lineHeight={22}>
            {temple.about}
          </Txt>
          <View>
            <Txt size={13} weight="semibold" color={colors.muted}>
              DEITIES
            </Txt>
            <Txt size={15} style={{ marginTop: 4 }}>
              {temple.deities.join(', ')}
            </Txt>
          </View>
          <View>
            <Txt size={13} weight="semibold" color={colors.muted}>
              ADDRESS
            </Txt>
            <Txt size={15} style={{ marginTop: 4 }}>
              {temple.address}
            </Txt>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  prof: { paddingHorizontal: 18, paddingBottom: 14 },
  logo: { width: 84, height: 84, borderRadius: 42, borderWidth: 4, borderColor: '#fff', marginTop: -42, backgroundColor: colors.soft },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  sep: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#C9C2BA' },
  unclaimed: { marginTop: 12, padding: 12, borderRadius: radius.md, backgroundColor: colors.soft },
  btnRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  btn: { height: 42, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  btnInk: { backgroundColor: colors.ink },
  btnSoft: { backgroundColor: colors.soft },
  btnOutline: { borderWidth: 1, borderColor: colors.line },
  today: { marginHorizontal: 16, padding: 14 },
  todayHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tiles: { flexDirection: 'row', gap: 10, marginTop: 12 },
  tile: { flex: 1, flexDirection: 'row', gap: 9, backgroundColor: colors.soft, borderRadius: 12, padding: 11 },
  tabs: { flexDirection: 'row', gap: 24, paddingHorizontal: 18, marginTop: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  tab: { paddingVertical: 11 },
  tabOn: { borderBottomWidth: 2, borderBottomColor: colors.ink },
  emptyText: { padding: 18 },
});
