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
  /** Callback when an error occurs during rendering */
  onError?: (error: string) => void;
  /** Show errors inline (compact) instead of full-screen (default: false) */
  showErrorInline?: boolean;
}

// Native component props (what gets passed to native)
interface NativeLatexViewProps {
  latex: string;
  fontSize: number;
  textColor: string;
  style?: ViewStyle;
  onLatexError?: (event: { nativeEvent: { error: string } }) => void;
}

// Only available on Android
const NativeLatexView =
  Platform.OS === 'android'
    ? requireNativeComponent<NativeLatexViewProps>('NativeLatexView')
    : null;

/**
 * Simple LaTeX validation to check for common errors.
 * Returns error message if invalid, null if valid.
 */
const validateLatex = (latex: string): string | null => {
  // Check for mismatched braces
  let braceCount = 0;
  for (const char of latex) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    if (braceCount < 0) return 'Mismatched braces: extra closing brace';
  }
  if (braceCount > 0) return 'Mismatched braces: missing closing brace';

  // Check for incomplete commands (e.g., \frac without arguments)
  const incompleteCommands = [
    { pattern: /\\frac\s*$/i, msg: 'Incomplete \\frac command' },
    { pattern: /\\sqrt\s*$/i, msg: 'Incomplete \\sqrt command' },
    { pattern: /\\frac\s*\{[^}]*\}\s*$/i, msg: '\\frac needs two arguments' },
  ];

  for (const { pattern, msg } of incompleteCommands) {
    if (pattern.test(latex)) return msg;
  }

  return null; // Valid
};

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
  ({ latex, fontSize = 20, textColor = '#000000', style, onError, showErrorInline = false }) => {
    // Sanitize the LaTeX string by removing wrapping delimiters
    const cleanLatex = React.useMemo(() => {
      let cleaned = latex.trim();

      // Remove \[ ... \]
      if (cleaned.startsWith('\\[') && cleaned.endsWith('\\]')) {
        cleaned = cleaned.substring(2, cleaned.length - 2).trim();
      }

      // Remove $$ ... $$
      if (cleaned.startsWith('$$') && cleaned.endsWith('$$')) {
        cleaned = cleaned.substring(2, cleaned.length - 2).trim();
      }

      // Remove $ ... $ (only if it's wrapping the whole string)
      if (
        cleaned.startsWith('$') &&
        cleaned.endsWith('$') &&
        !cleaned.startsWith('$$')
      ) {
        cleaned = cleaned.substring(1, cleaned.length - 1).trim();
      }

      return cleaned;
    }, [latex]);

    // Validate LaTeX and get error if any
    const validationError = React.useMemo(() => {
      return validateLatex(cleanLatex);
    }, [cleanLatex]);

    // Call onError callback when there's a validation error
    React.useEffect(() => {
      if (validationError && onError) {
        onError(validationError);
      }
    }, [validationError, onError]);

    // Handle native error events
    const handleNativeError = React.useCallback(
      (event: { nativeEvent: { error: string } }) => {
        if (onError) {
          onError(event.nativeEvent.error);
        }
      },
      [onError],
    );

    // If there's a validation error and showErrorInline is true, show compact error
    if (validationError && showErrorInline) {
      return (
        <View style={[styles.errorContainer, style]}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorMessage}>{validationError}</Text>
        </View>
      );
    }

    // Fallback for iOS or web
    if (Platform.OS !== 'android' || !NativeLatexView) {
      return (
        <View style={[styles.fallback, style]}>
          <Text style={styles.fallbackText}>
            LaTeX: {cleanLatex} (Android only)
          </Text>
        </View>
      );
    }

    return (
      <NativeLatexView
        latex={cleanLatex}
        fontSize={fontSize}
        textColor={textColor}
        style={StyleSheet.flatten([styles.container, style])}
        onLatexError={handleNativeError}
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
  // Error styles - compact inline display
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFECB5',
  },
  errorIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#856404',
    flex: 1,
  },
});

export default LatexRenderer;
