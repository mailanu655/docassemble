import { Children, isValidElement, type ReactNode } from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';

import { fontFor } from '@/theme/fonts';
import { colors, type Weight } from '@/theme/tokens';

type Props = TextProps & {
  size?: number;
  weight?: Weight;
  color?: string;
  lineHeight?: number;
  /** Negative tracking for headings, like the mockups. */
  tight?: boolean;
  align?: TextStyle['textAlign'];
};

function plainText(node: ReactNode): string {
  let out = '';
  Children.forEach(node, (child) => {
    if (typeof child === 'string' || typeof child === 'number') out += String(child);
    else if (isValidElement<{ children?: ReactNode }>(child)) out += plainText(child.props.children);
  });
  return out;
}

export function Txt({
  size = 15,
  weight = 'regular',
  color = colors.ink,
  lineHeight,
  tight,
  align,
  style,
  children,
  ...rest
}: Props) {
  const fontFamily = fontFor(plainText(children), weight);
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily,
          fontSize: size,
          color,
          lineHeight,
          textAlign: align,
          letterSpacing: tight ? -size * 0.025 : 0,
        },
        style,
      ]}>
      {children}
    </Text>
  );
}
