import { useLocalSearchParams } from 'expo-router';
import { ChevronLeft, SendHorizontal } from 'lucide-react-native';
import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { goBack } from '@/components/CoverHeader';
import { PostCard } from '@/components/PostCard';
import { Txt } from '@/components/Txt';
import { timeAgo } from '@/data/format';
import { useStore } from '@/data/store';
import { fontFor } from '@/theme/fonts';
import { colors } from '@/theme/tokens';

function Initial({ name }: { name: string }) {
  return (
    <View style={styles.initial}>
      <Txt size={13} weight="semibold" color={colors.ink2}>
        {name.charAt(0).toUpperCase()}
      </Txt>
    </View>
  );
}

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');
  const post = store.post(id);

  if (!post) return null;
  const temple = store.temple(post.templeId);

  const send = () => {
    const body = draft.trim();
    if (!body) return;
    store.addComment(post.id, body);
    setDraft('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={goBack} hitSlop={8} style={styles.back}>
          <ChevronLeft size={24} color={colors.ink} strokeWidth={2.2} />
        </Pressable>
        <Txt size={16} weight="semibold" numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>
          Post
        </Txt>
        <View style={styles.back} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={post.comments}
          keyExtractor={(c) => c.id}
          ListHeaderComponent={
            <>
              <PostCard post={post} detail />
              <View style={styles.commentsHead}>
                <Txt size={14} weight="semibold">
                  {post.comments.length === 0 ? 'No comments yet' : `${post.comments.length} ${post.comments.length === 1 ? 'comment' : 'comments'}`}
                </Txt>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <View style={styles.comment} testID={`comment-${item.id}`}>
              <Initial name={item.author} />
              <View style={{ flex: 1 }}>
                <Txt size={13.5}>
                  <Txt size={13.5} weight="semibold">
                    {item.author}
                  </Txt>
                  <Txt size={13} color={colors.muted}>
                    {'  '}
                    {timeAgo(item.createdAt)}
                  </Txt>
                </Txt>
                <Txt size={14.5} lineHeight={21} style={{ marginTop: 2 }}>
                  {item.body}
                </Txt>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 16 }}
        />

        <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <TextInput
            testID="comment-input"
            value={draft}
            onChangeText={setDraft}
            placeholder={temple ? `Reply to ${temple.short}…` : 'Write a reply…'}
            placeholderTextColor={colors.faint}
            style={[styles.input, { fontFamily: fontFor(draft, 'regular') }]}
            multiline
            maxLength={500}
            accessibilityLabel="Write a comment"
          />
          <Pressable
            testID="comment-send"
            accessibilityRole="button"
            accessibilityLabel="Send comment"
            disabled={!draft.trim()}
            onPress={send}
            style={[styles.send, !draft.trim() && { opacity: 0.35 }]}>
            <SendHorizontal size={18} color="#fff" strokeWidth={2.2} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  top: { height: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  commentsHead: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  comment: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 10 },
  initial: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    backgroundColor: colors.bg,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    backgroundColor: colors.soft,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: colors.ink,
  },
  send: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
});
