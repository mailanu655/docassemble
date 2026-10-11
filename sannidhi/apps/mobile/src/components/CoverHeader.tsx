import { Image, type ImageProps } from 'expo-image';
import { router } from 'expo-router';
import { ChevronLeft, Share as ShareIcon } from 'lucide-react-native';
import { Pressable, Share, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme/tokens';

export function RoundButton({ onPress, label, children }: { onPress: () => void; label: string; children: React.ReactNode }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.round}>
      {children}
    </Pressable>
  );
}

export function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/** Full-bleed photo with floating back and share buttons, as on the profile and event screens. */
export function CoverHeader({ source, height, shareText }: { source: ImageProps['source']; height: number; shareText: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ height }}>
      <Image source={source} contentFit="cover" style={StyleSheet.absoluteFill} transition={150} />
      <View style={[styles.bar, { top: insets.top + 8 }]}>
        <RoundButton label="Back" onPress={goBack}>
          <ChevronLeft size={22} color={colors.ink} strokeWidth={2.2} />
        </RoundButton>
        <RoundButton label="Share" onPress={() => Share.share({ message: shareText }).catch(() => {})}>
          <ShareIcon size={20} color={colors.ink} strokeWidth={2} />
        </RoundButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' },
  round: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
