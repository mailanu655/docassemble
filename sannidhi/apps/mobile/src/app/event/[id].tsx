import { router, useLocalSearchParams } from 'expo-router';
import { CalendarDays, MapPin, Minus, Plus, UsersRound } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CoverHeader } from '@/components/CoverHeader';
import { Txt } from '@/components/Txt';
import { Avatar, Button, Hairline, useT, Verified } from '@/components/ui';
import { clockLong, count, dateLong } from '@/data/format';
import { useStore } from '@/data/store';
import { colors, radius } from '@/theme/tokens';

function DetailRow({ icon, title, sub, action, onAction }: { icon: React.ReactNode; title: string; sub: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.row}>
      {icon}
      <View style={{ flex: 1 }}>
        <Txt size={15} weight="semibold">
          {title}
        </Txt>
        <Txt size={13} color={colors.muted} style={{ marginTop: 2 }}>
          {sub}
        </Txt>
      </View>
      {action && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Txt size={13} weight="semibold" color={colors.saffron}>
            {action}
          </Txt>
        </Pressable>
      )}
    </View>
  );
}

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore();
  const t = useT();
  const insets = useSafeAreaInsets();
  const event = store.event(id);
  const mine = event ? store.rsvps[event.id] : undefined;
  const [headcount, setHeadcount] = useState(mine ?? 1);

  if (!event) return null;
  const temple = store.temple(event.templeId);
  const going = Boolean(mine);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        <CoverHeader source={event.cover} height={290} shareText={`${event.title} · ${dateLong(event.startsAt)} at ${temple?.name}`} />
        <View style={styles.body}>
          <Txt size={12} weight="semibold" color={colors.saffron} style={{ letterSpacing: 0.7 }}>
            {event.category.toUpperCase()}
          </Txt>
          <Txt size={27} weight="bold" tight lineHeight={31} style={{ marginTop: 6 }}>
            {event.title}
          </Txt>
          {temple && (
            <Pressable
              style={styles.host}
              onPress={() => router.push({ pathname: '/temple/[id]', params: { id: temple.id } })}>
              <Avatar source={temple.logo} size={24} />
              <Txt size={14} weight="medium" color={colors.ink2}>
                {temple.name}
              </Txt>
              {temple.verified && <Verified />}
            </Pressable>
          )}

          <View style={styles.rows}>
            <Hairline />
            <DetailRow
              icon={<CalendarDays size={20} color={colors.ink2} strokeWidth={1.75} />}
              title={dateLong(event.startsAt)}
              sub={`${clockLong(event.startsAt)} – ${clockLong(event.endsAt)}`}
              action="Add to calendar"
            />
            <Hairline />
            <DetailRow
              icon={<MapPin size={20} color={colors.ink2} strokeWidth={1.75} />}
              title={event.location}
              sub={event.address}
              action={t('directions')}
              onAction={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(event.address)}`).catch(() => {})}
            />
            <Hairline />
            <DetailRow
              icon={<UsersRound size={20} color={colors.ink2} strokeWidth={1.75} />}
              title={`${count(store.goingCount(event.id))} ${t('going')}`}
              sub={going ? `Including you and ${mine! - 1 > 0 ? `${mine! - 1} more` : 'no one else'} from your family` : 'RSVP so the temple can plan food and parking'}
            />
            <Hairline />
          </View>

          <Txt size={17} weight="bold" tight style={{ marginTop: 20 }}>
            Program
          </Txt>
          <View style={{ marginTop: 8 }}>
            {event.program.map((p) => (
              <View key={p.time + p.label} style={styles.prog}>
                <Txt size={14} weight="medium" color={colors.muted} style={{ width: 76 }}>
                  {p.time}
                </Txt>
                <Txt size={15} style={{ flex: 1 }}>
                  {p.label}
                </Txt>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) + 10 }]}>
        <View style={styles.stepper} accessibilityLabel={`${headcount} people`}>
          <Pressable accessibilityLabel="Fewer people" testID="minus" onPress={() => setHeadcount((n) => Math.max(1, n - 1))} style={styles.stepBtn}>
            <Minus size={18} color={colors.ink} strokeWidth={2.2} />
          </Pressable>
          <View style={{ alignItems: 'center', minWidth: 44 }}>
            <Txt size={17} weight="bold" testID="headcount">
              {headcount}
            </Txt>
            <Txt size={11} color={colors.muted}>
              {headcount === 1 ? 'person' : 'people'}
            </Txt>
          </View>
          <Pressable accessibilityLabel="More people" testID="plus" onPress={() => setHeadcount((n) => Math.min(20, n + 1))} style={styles.stepBtn}>
            <Plus size={18} color={colors.ink} strokeWidth={2.2} />
          </Pressable>
        </View>
        {going && mine === headcount ? (
          <Button label="Cancel RSVP" variant="outline" style={{ flex: 1 }} testID="cancel-rsvp" onPress={() => store.cancelRsvp(event.id)} />
        ) : (
          <Button
            label={going ? 'Update RSVP' : t('imGoing')}
            variant="saffron"
            style={{ flex: 1 }}
            testID="rsvp"
            onPress={() => store.rsvp(event.id, headcount)}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 18, paddingTop: 18 },
  host: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  rows: { marginTop: 18 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 13 },
  prog: { flexDirection: 'row', paddingVertical: 7 },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 52, paddingHorizontal: 4, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md },
  stepBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});
