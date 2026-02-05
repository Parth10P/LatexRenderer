/**
 * LatexRenderer - React Native component for rendering LaTeX equations natively.
 *
 * This component bridges to the native NativeLatexView on Android,
 * which uses AndroidMath for high-performance LaTeX rendering.
 *
 * Features:
 * - Native rendering (no WebView)
 * - Background thread processing
 * - Bitmap caching for 60 FPS scrolling
 * - Error handling for invalid LaTeX
 */

import React, { memo } from 'react';
import {
  requireNativeComponent,
  Platform,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';

// Props interface for the LaTeX renderer
interface LatexRendererProps {
  /** The LaTeX string to render */
  latex: string;
  /** Font size for the rendered equation (default: 20) */
  fontSize?: number;
  /** Text color as hex string (default: "#000000") */
  textColor?: string;
  /** Optional style for the container */
  style?: ViewStyle;
}

// Native component props (what gets passed to native)
interface NativeLatexViewProps {
  latex: string;
  fontSize: number;
  textColor: string;
  style?: ViewStyle;
}

// Only available on Android
const NativeLatexView =
  Platform.OS === 'android'
    ? requireNativeComponent<NativeLatexViewProps>('NativeLatexView')
    : null;

/**
 * LatexRenderer Component
 *
 * Renders LaTeX equations using native Android view (AndroidMath).
 * Falls back to placeholder on iOS.
 *
 * @example
 * ```tsx
 * <LatexRenderer
 *   latex="x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}"
 *   fontSize={24}
 *   textColor="#333333"
 * />
 * ```
 */
const LatexRenderer: React.FC<LatexRendererProps> = memo(
  ({ latex, fontSize = 20, textColor = '#000000', style }) => {
    // Fallback for iOS or web
    if (Platform.OS !== 'android' || !NativeLatexView) {
      return (
        <View style={[styles.fallback, style]}>
          <Text style={styles.fallbackText}>LaTeX: {latex} (Android only)</Text>
        </View>
      );
    }

    return (
      <NativeLatexView
        latex={latex}
        fontSize={fontSize}
        textColor={textColor}
        style={StyleSheet.flatten([styles.container, style])}
      />
    );
  },
);

LatexRenderer.displayName = 'LatexRenderer';

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  fallback: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  fallbackText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#666',
  },
});

export default LatexRenderer;
