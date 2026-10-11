import { router } from 'expo-router';
import { ChevronRight, Languages, SquarePen } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Txt } from '@/components/Txt';
import { Avatar, Card, Hairline, useT, Verified } from '@/components/ui';
import { dateLong } from '@/data/format';
import { useStore } from '@/data/store';
import { LANGUAGES } from '@/i18n/strings';
import { colors } from '@/theme/tokens';

function Row({ icon, title, sub, onPress, testID }: { icon: ReactNode; title: string; sub?: string; onPress: () => void; testID?: string }) {
  return (
    <Pressable style={styles.row} onPress={onPress} testID={testID}>
      {icon}
      <View style={{ flex: 1 }}>
        <Txt size={15} weight="medium">
          {title}
        </Txt>
        {sub ? (
          <Txt size={13} color={colors.muted} style={{ marginTop: 1 }}>
            {sub}
          </Txt>
        ) : null}
      </View>
      <ChevronRight size={18} color={colors.faint} />
    </Pressable>
  );
}

export default function Me() {
  const store = useStore();
  const t = useT();
  const lang = LANGUAGES.find((l) => l.code === store.language);
  const admin = store.temple('narasimha');
  const going = Object.entries(store.rsvps)
    .map(([id, n]) => ({ event: store.event(id), n }))
    .filter((x) => x.event);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.top}>
          <Txt size={28} weight="bold" tight>
            {t('me')}
          </Txt>
        </View>

        <Txt size={12} weight="semibold" color={colors.muted} style={styles.section}>
          YOUR EVENTS
        </Txt>
        <Card style={styles.card}>
          {going.length === 0 ? (
            <Txt size={14} color={colors.muted} style={{ padding: 14 }}>
              Events you RSVP to will show up here.
            </Txt>
          ) : (
            going.map(({ event, n }, i) => (
              <View key={event!.id}>
                {i > 0 && <Hairline style={{ marginLeft: 14 }} />}
                <Row
                  icon={<Avatar source={event!.cover} size={36} />}
                  title={event!.title}
                  sub={`${dateLong(event!.startsAt)} · ${n} ${n === 1 ? 'person' : 'people'}`}
                  onPress={() => router.push({ pathname: '/event/[id]', params: { id: event!.id } })}
                />
              </View>
            ))
          )}
        </Card>

        <Txt size={12} weight="semibold" color={colors.muted} style={styles.section}>
          SETTINGS
        </Txt>
        <Card style={styles.card}>
          <Row
            icon={<Languages size={20} color={colors.ink2} />}
            title="Language"
            sub={lang ? `${lang.native} · ${lang.english}` : undefined}
            onPress={() => store.setLanguage(store.language === 'te' ? 'en' : 'te')}
            testID="toggle-language"
          />
        </Card>

        {admin && (
          <>
            <Txt size={12} weight="semibold" color={colors.muted} style={styles.section}>
              TEMPLE YOU MANAGE
            </Txt>
            <Card style={styles.card}>
              <View style={styles.adminHead}>
                <Avatar source={admin.logo} size={40} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Txt size={15} weight="semibold" numberOfLines={1} style={{ flexShrink: 1 }}>
                      {admin.name}
                    </Txt>
                    <Verified />
                  </View>
                  <Txt size={13} color={colors.muted}>
                    Admin
                  </Txt>
                </View>
              </View>
              <Hairline style={{ marginLeft: 14 }} />
              <Row
                icon={<SquarePen size={20} color={colors.saffron} />}
                title="New post"
                sub="Update, event, darshan or urgent notice"
                onPress={() => router.push('/compose')}
                testID="open-compose"
              />
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  top: { paddingHorizontal: 18, paddingTop: 10 },
  section: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 8, letterSpacing: 0.7 },
  card: { marginHorizontal: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  adminHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
});
