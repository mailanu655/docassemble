import { Flame } from 'lucide-react-native';
import { View } from 'react-native';

import { colors } from '@/theme/tokens';

import { Txt } from './Txt';

export function Brand({ size = 'md' }: { size?: 'md' | 'sm' }) {
  const box = size === 'md' ? 36 : 30;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }} accessibilityRole="header" accessibilityLabel="Sannidhi">
      <View
        style={{
          width: box,
          height: box,
          borderRadius: size === 'md' ? 10 : 9,
          backgroundColor: colors.saffronTint,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Flame size={size === 'md' ? 22 : 18} color={colors.saffron} fill={colors.saffronTint} strokeWidth={2} />
      </View>
      <Txt size={size === 'md' ? 20 : 19} weight="bold" tight>
        Sannidhi
      </Txt>
    </View>
  );
}
