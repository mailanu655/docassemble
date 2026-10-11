import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand } from '@/components/Brand';
import { Txt } from '@/components/Txt';
import { Button } from '@/components/ui';
import { useStore } from '@/data/store';
import type { LanguageCode } from '@/data/types';
import { LANGUAGES } from '@/i18n/strings';
import { colors, radius } from '@/theme/tokens';

export default function Onboarding() {
  const { setLanguage } = useStore();
  const [selected, setSelected] = useState<LanguageCode>('en');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.body}>
        <Brand />
        <Txt size={28} weight="bold" tight lineHeight={32} style={{ marginTop: 28 }}>
          Choose your language
        </Txt>
        <Txt size={15} lineHeight={22} color={colors.ink2} style={{ marginTop: 10 }}>
          Temple updates, festival reminders and the app itself will appear in this language. You can change it any time.
        </Txt>
        <View style={styles.list} accessibilityRole="radiogroup">
          {LANGUAGES.map((l) => {
            const on = l.code === selected;
            return (
              <Pressable
                key={l.code}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                accessibilityLabel={l.english}
                testID={`lang-${l.code}`}
                onPress={() => setSelected(l.code)}
                style={[styles.row, on && styles.rowOn]}>
                <View>
                  <Txt size={17} weight="semibold">
                    {l.native}
                  </Txt>
                  <Txt size={12.5} color={colors.muted} style={{ marginTop: 1 }}>
                    {l.english}
                  </Txt>
                </View>
                {on ? (
                  <View style={styles.check}>
                    <Check size={16} color="#fff" strokeWidth={2.5} />
                  </View>
                ) : (
                  <View style={styles.radio} />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button label="Continue" testID="continue" onPress={() => setLanguage(selected)} />
        <Txt size={12} color={colors.muted} align="center" style={{ marginTop: 12 }}>
          By continuing you agree to the Terms and Privacy Policy
        </Txt>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 12 },
  list: { marginTop: 22, gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
  },
  rowOn: { borderColor: colors.ink, borderWidth: 2, paddingVertical: 10, paddingHorizontal: 15 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#D4CEC7' },
  check: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 },
});
