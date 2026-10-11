import { Image, type ImageProps } from 'expo-image';
import { BadgeCheck } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { useStore } from '@/data/store';
import { translate, type StringKey } from '@/i18n/strings';
import { colors, radius } from '@/theme/tokens';

import { Txt } from './Txt';

export function useT() {
  const { language } = useStore();
  return (key: StringKey) => translate(language, key);
}

export function Avatar({ source, size = 40 }: { source: ImageProps['source']; size?: number }) {
  return (
    <Image
      source={source}
      contentFit="cover"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.line,
      }}
    />
  );
}

export function Verified({ size = 15 }: { size?: number }) {
  return (
    <View accessibilityLabel="Verified temple" style={{ marginLeft: 4 }}>
      <BadgeCheck size={size} color="#fff" fill={colors.saffron} strokeWidth={2} />
    </View>
  );
}

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: 'primary' | 'saffron' | 'soft' | 'outline';
  size?: 'md' | 'sm';
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, variant = 'primary', size = 'md', icon, style, ...rest }: ButtonProps) {
  const bg = { primary: colors.ink, saffron: colors.saffron, soft: colors.soft, outline: colors.bg }[variant];
  const fg = variant === 'primary' || variant === 'saffron' ? '#fff' : colors.ink;
  const height = size === 'md' ? 52 : 36;
  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      style={({ pressed }) => [
        {
          height,
          paddingHorizontal: size === 'md' ? 20 : 14,
          borderRadius: size === 'md' ? radius.md : radius.pill,
          backgroundColor: bg,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: colors.line,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}>
      {icon}
      <Txt size={size === 'md' ? 16 : 13.5} weight="semibold" color={fg}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function Hairline({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: colors.line }, style]} />;
}

export function Dot({ tone }: { tone: 'open' | 'busy' | 'closed' }) {
  const fill = { open: colors.green, busy: colors.amber, closed: colors.faint }[tone];
  const ring = { open: colors.greenTint, busy: colors.amberTint, closed: colors.soft }[tone];
  return (
    <View
      style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: ring, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: fill }} />
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, backgroundColor: colors.bg }, style]}>
      {children}
    </View>
  );
}
