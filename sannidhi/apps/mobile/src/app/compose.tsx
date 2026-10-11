import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Check, ImagePlus, Languages, X } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { goBack } from '@/components/CoverHeader';
import { DateBox } from '@/components/EventInline';
import { Txt } from '@/components/Txt';
import { Avatar, Verified } from '@/components/ui';
import { count, dateLong } from '@/data/format';
import { useStore } from '@/data/store';
import type { PostType } from '@/data/types';
import { fontFor } from '@/theme/fonts';
import { colors, radius } from '@/theme/tokens';

const TYPES: { key: PostType; label: string; hint: string }[] = [
  { key: 'update', label: 'Update', hint: 'News, timings, announcements' },
  { key: 'event', label: 'Event', hint: 'Attach an event so devotees can RSVP' },
  { key: 'darshan', label: 'Darshan', hint: 'Today’s alankaram or a photo from the sanctum' },
  { key: 'urgent', label: 'Urgent', hint: 'Closures, parking, weather. Sent as a push alert' },
];

const MAX = 1200;

export default function Compose() {
  const store = useStore();
  const insets = useSafeAreaInsets();
  // Phase 1 demo: the signed-in user administers this temple.
  const temple = store.temple('narasimha')!;
  const events = store.events.filter((e) => e.templeId === temple.id);

  const [type, setType] = useState<PostType>('update');
  const [body, setBody] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | undefined>(events[0]?.id);
  const [withTelugu, setWithTelugu] = useState(false);
  const [telugu, setTelugu] = useState('');

  const ready = body.trim().length > 0 && (type !== 'event' || Boolean(eventId));

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const submit = () => {
    if (!ready) return;
    store.publish(temple.id, type, body.trim(), {
      translations: withTelugu && telugu.trim() ? { te: telugu.trim() } : undefined,
      image: image ? { uri: image } : undefined,
      eventId: type === 'event' ? eventId : undefined,
    });
    goBack();
  };

  const hint = TYPES.find((t) => t.key === type)!.hint;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.bar}>
        <Pressable accessibilityRole="button" accessibilityLabel="Discard" onPress={goBack} hitSlop={8} style={styles.iconBtn}>
          <X size={24} color={colors.ink} strokeWidth={2} />
        </Pressable>
        <Txt size={16} weight="semibold">
          New post
        </Txt>
        <Pressable
          testID="publish"
          accessibilityRole="button"
          accessibilityState={{ disabled: !ready }}
          disabled={!ready}
          onPress={submit}
          style={[styles.postBtn, !ready && { backgroundColor: colors.soft }]}>
          <Txt size={14.5} weight="semibold" color={ready ? '#fff' : colors.faint}>
            Post
          </Txt>
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
          <View style={styles.asRow}>
            <Avatar source={temple.logo} size={40} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Txt size={15} weight="semibold" numberOfLines={1} style={{ flexShrink: 1 }}>
                  {temple.name}
                </Txt>
                {temple.verified && <Verified />}
              </View>
              <Txt size={13} color={colors.muted}>
                Posting to {count(temple.followers)} followers
              </Txt>
            </View>
          </View>

          <View style={styles.chips} accessibilityRole="radiogroup">
            {TYPES.map((t) => {
              const on = t.key === type;
              return (
                <Pressable
                  key={t.key}
                  testID={`type-${t.key}`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  onPress={() => setType(t.key)}
                  style={[styles.chip, on && styles.chipOn]}>
                  <Txt size={13.5} weight="semibold" color={on ? '#fff' : colors.ink2}>
                    {t.label}
                  </Txt>
                </Pressable>
              );
            })}
          </View>
          <Txt size={12.5} color={colors.muted} style={{ marginTop: 8 }}>
            {hint}
          </Txt>

          <TextInput
            testID="compose-body"
            value={body}
            onChangeText={(v) => setBody(v.slice(0, MAX))}
            placeholder="What would you like to share with devotees?"
            placeholderTextColor={colors.faint}
            multiline
            autoFocus={Platform.OS !== 'web'}
            style={[styles.editor, { fontFamily: fontFor(body, 'regular') }]}
            accessibilityLabel="Post text"
          />
          {body.length > MAX - 200 && (
            <Txt size={12} color={colors.muted} align="right">
              {MAX - body.length} characters left
            </Txt>
          )}

          {image && (
            <View style={styles.attach}>
              <Image source={{ uri: image }} contentFit="cover" style={StyleSheet.absoluteFill} />
              <Pressable accessibilityLabel="Remove photo" onPress={() => setImage(null)} style={styles.removeImg}>
                <X size={14} color="#fff" strokeWidth={2.5} />
              </Pressable>
            </View>
          )}

          {type === 'event' && (
            <View style={styles.section}>
              <Txt size={13} weight="semibold" color={colors.muted} style={{ letterSpacing: 0.6 }}>
                ATTACH EVENT
              </Txt>
              {events.map((e) => {
                const on = e.id === eventId;
                return (
                  <Pressable
                    key={e.id}
                    testID={`attach-${e.id}`}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    onPress={() => setEventId(e.id)}
                    style={[styles.eventRow, on && { borderColor: colors.ink }]}>
                    <DateBox local={e.startsAt} size={42} />
                    <View style={{ flex: 1 }}>
                      <Txt size={14.5} weight="semibold" numberOfLines={1}>
                        {e.title}
                      </Txt>
                      <Txt size={12.5} color={colors.muted}>
                        {dateLong(e.startsAt)} · RSVP on
                      </Txt>
                    </View>
                    <View style={[styles.radio, on && styles.radioOn]}>{on && <Check size={12} color="#fff" strokeWidth={3} />}</View>
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={styles.trans}>
            <Pressable
              testID="toggle-telugu"
              accessibilityRole="checkbox"
              accessibilityState={{ checked: withTelugu }}
              onPress={() => setWithTelugu((v) => !v)}
              style={styles.transHead}>
              <Languages size={18} color={colors.saffron} strokeWidth={2} />
              <View style={{ flex: 1 }}>
                <Txt size={14.5} weight="semibold">
                  Also post in Telugu
                </Txt>
                <Txt size={12.5} color={colors.muted}>
                  Devotees who chose Telugu see this version first
                </Txt>
              </View>
              <View style={[styles.box, withTelugu && styles.boxOn]}>{withTelugu && <Check size={13} color="#fff" strokeWidth={3} />}</View>
            </Pressable>
            {withTelugu && (
              <TextInput
                testID="compose-telugu"
                value={telugu}
                onChangeText={setTelugu}
                placeholder="తెలుగులో రాయండి"
                placeholderTextColor={colors.faint}
                multiline
                style={[styles.teInput, { fontFamily: fontFor(telugu || 'తె', 'regular') }]}
                accessibilityLabel="Telugu version"
              />
            )}
          </View>
        </ScrollView>

        <View style={[styles.tools, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Add photo" onPress={pickImage} hitSlop={6} style={styles.tool}>
            <ImagePlus size={22} color={colors.ink2} strokeWidth={1.75} />
            <Txt size={13.5} weight="medium" color={colors.ink2}>
              Photo
            </Txt>
          </Pressable>
          <Txt size={12.5} color={colors.muted} style={{ marginLeft: 'auto' }}>
            {type === 'urgent' ? 'Followers get a push alert' : 'Shows in followers’ feeds'}
          </Txt>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  bar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  postBtn: { height: 34, paddingHorizontal: 16, borderRadius: 17, backgroundColor: colors.saffron, justifyContent: 'center' },
  asRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  chip: { height: 34, paddingHorizontal: 14, borderRadius: 17, borderWidth: 1, borderColor: colors.line, justifyContent: 'center' },
  chipOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  editor: { minHeight: 140, marginTop: 14, fontSize: 16, lineHeight: 24, color: colors.ink, textAlignVertical: 'top' },
  attach: { height: 190, borderRadius: radius.md, overflow: 'hidden', marginTop: 8, backgroundColor: colors.soft },
  removeImg: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(22,19,15,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginTop: 18, gap: 8 },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#CFC8C0', alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: colors.ink, borderColor: colors.ink },
  trans: { marginTop: 18, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 14 },
  transHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: '#CFC8C0', alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.saffron, borderColor: colors.saffron },
  teInput: {
    marginTop: 12,
    minHeight: 80,
    borderRadius: radius.md,
    backgroundColor: colors.soft,
    padding: 12,
    fontSize: 15,
    lineHeight: 24,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  tools: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  tool: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
