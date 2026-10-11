import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Ellipsis, Flame, Megaphone, MessageCircle, Share as ShareIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Share, StyleSheet, View } from 'react-native';

import { count, timeAgo } from '@/data/format';
import { useStore } from '@/data/store';
import type { Post } from '@/data/types';
import { colors, radius } from '@/theme/tokens';

import { EventInline } from './EventInline';
import { Txt } from './Txt';
import { Avatar, useT, Verified } from './ui';

type Props = { post: Post; showCity?: boolean; detail?: boolean };

export function PostCard({ post, showCity = true, detail = false }: Props) {
  const store = useStore();
  const t = useT();
  const temple = store.temple(post.templeId);
  const translated = store.language ? post.translations?.[store.language] : undefined;
  const [showTranslation, setShowTranslation] = useState(Boolean(translated));
  if (!temple) return null;

  const prayed = store.hasPrayed(post.id);
  const body = showTranslation && translated ? translated : post.body;
  const meta = [showCity ? temple.city : null, timeAgo(post.createdAt)].filter(Boolean).join(' · ');
  const event = post.eventId ? store.event(post.eventId) : undefined;

  const openPost = () => !detail && router.push({ pathname: '/post/[id]', params: { id: post.id } });

  const onShare = () =>
    Share.share({ message: `${temple.name}: ${post.body}\n\nOpen in Sannidhi: https://sannidhi.app/p/${post.id}` }).catch(
      () => {},
    );

  return (
    <View style={styles.card} testID={`post-${post.id}`}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Open ${temple.name}`}
          onPress={() => router.push({ pathname: '/temple/[id]', params: { id: temple.id } })}
          style={styles.who}>
          <Avatar source={temple.logo} />
          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Txt size={15} weight="semibold" numberOfLines={1} style={{ flexShrink: 1 }}>
                {temple.name}
              </Txt>
              {temple.verified && <Verified />}
            </View>
            <Txt size={13} color={colors.muted}>
              {meta}
            </Txt>
          </View>
        </Pressable>
        <Pressable accessibilityLabel="More options" hitSlop={8} style={styles.iconBtn}>
          <Ellipsis size={20} color={colors.ink} />
        </Pressable>
      </View>

      {post.type === 'urgent' && (
        <View style={styles.urgent}>
          <Megaphone size={14} color={colors.saffron} strokeWidth={2} />
          <Txt size={12.5} weight="semibold" color={colors.saffron}>
            Important update
          </Txt>
        </View>
      )}

      <Pressable onPress={openPost} disabled={detail}>
        <Txt size={detail ? 16 : 15} lineHeight={detail ? 25 : 22} style={styles.body}>
          {body}
        </Txt>
      </Pressable>

      {translated && (
        <Pressable onPress={() => setShowTranslation((v) => !v)} hitSlop={6} style={{ marginTop: -4, marginBottom: 10 }}>
          <Txt size={13} weight="medium" color={colors.muted}>
            {showTranslation ? t('seeOriginal') : t('seeTranslation')}
          </Txt>
        </Pressable>
      )}

      {event && <EventInline event={event} />}

      {post.image && (
        <Pressable onPress={openPost} disabled={detail}>
          <Image source={post.image} contentFit="cover" contentPosition="top" style={styles.photo} transition={150} />
        </Pressable>
      )}

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={prayed ? 'Remove prayer' : 'Pray'}
          accessibilityState={{ selected: prayed }}
          testID={`pray-${post.id}`}
          onPress={() => store.togglePray(post.id)}
          style={[styles.act, prayed && styles.actOn]}>
          <Flame
            size={19}
            strokeWidth={1.9}
            color={prayed ? colors.saffron : colors.ink2}
            fill={prayed ? colors.saffronTint : 'none'}
          />
          <Txt size={14} weight="medium" color={prayed ? colors.saffron : colors.ink2}>
            {t('pray')}
          </Txt>
          <Txt size={14} weight="semibold" color={prayed ? colors.saffron : colors.ink2}>
            {count(store.prayCount(post))}
          </Txt>
        </Pressable>
        <Pressable accessibilityLabel="Comments" onPress={openPost} style={styles.act}>
          <MessageCircle size={19} strokeWidth={1.75} color={colors.ink2} />
          <Txt size={14} weight="semibold" color={colors.ink2}>
            {post.comments.length}
          </Txt>
        </Pressable>
        <Pressable accessibilityLabel="Share" onPress={onShare} style={[styles.act, { marginLeft: 'auto' }]}>
          <ShareIcon size={19} strokeWidth={1.75} color={colors.ink2} />
          <Txt size={14} weight="medium" color={colors.ink2}>
            {t('share')}
          </Txt>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },
  header: { flexDirection: 'row', alignItems: 'center' },
  who: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  urgent: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  body: { marginTop: 10, marginBottom: 12 },
  photo: { width: '100%', height: 220, borderRadius: radius.md, marginBottom: 4 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 4, marginHorizontal: -8, marginTop: 6, paddingBottom: 6 },
  act: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 10, borderRadius: 18 },
  actOn: { backgroundColor: colors.saffronTint },
});
