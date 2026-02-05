import React, { memo } from 'react';
import {
  requireNativeComponent,
  Platform,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface LatexRendererProps {
  latex: string;
  fontSize?: number;
  textColor?: string;
  style?: ViewStyle;
  onError?: (error: string) => void;
  showErrorInline?: boolean;
}

interface NativeLatexViewProps {
  latex: string;
  fontSize: number;
  textColor: string;
  style?: ViewStyle;
  onLatexError?: (event: { nativeEvent: { error: string } }) => void;
}


const NativeLatexView =
  Platform.OS === 'android'
    ? requireNativeComponent<NativeLatexViewProps>('NativeLatexView')
    : null;

const validateLatex = (latex: string): string | null => {
  let braceCount = 0;
  for (const char of latex) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    if (braceCount < 0) return 'Mismatched braces: extra closing brace';
  }
  if (braceCount > 0) return 'Mismatched braces: missing closing brace';

  const incompleteCommands = [
    { pattern: /\\frac\s*$/i, msg: 'Incomplete \\frac command' },
    { pattern: /\\sqrt\s*$/i, msg: 'Incomplete \\sqrt command' },
    { pattern: /\\frac\s*\{[^}]*\}\s*$/i, msg: '\\frac needs two arguments' },
  ];

  for (const { pattern, msg } of incompleteCommands) {
    if (pattern.test(latex)) return msg;
  }

  return null; 
};

const LatexRenderer: React.FC<LatexRendererProps> = memo(
  ({
    latex,
    fontSize = 20,
    textColor = '#000000',
    style,
    onError,
    showErrorInline = false,
  }) => {

    const cleanLatex = React.useMemo(() => {
      let cleaned = latex.trim();

      if (cleaned.startsWith('\\[') && cleaned.endsWith('\\]')) {
        cleaned = cleaned.substring(2, cleaned.length - 2).trim();
      }

      if (cleaned.startsWith('$$') && cleaned.endsWith('$$')) {
        cleaned = cleaned.substring(2, cleaned.length - 2).trim();
      }
      if (
        cleaned.startsWith('$') &&
        cleaned.endsWith('$') &&
        !cleaned.startsWith('$$')
      ) {
        cleaned = cleaned.substring(1, cleaned.length - 1).trim();
      }

      return cleaned;
    }, [latex]);


    const validationError = React.useMemo(() => {
      return validateLatex(cleanLatex);
    }, [cleanLatex]);


    React.useEffect(() => {
      if (validationError && onError) {
        onError(validationError);
      }
    }, [validationError, onError]);


    const handleNativeError = React.useCallback(
      (event: { nativeEvent: { error: string } }) => {
        if (onError) {
          onError(event.nativeEvent.error);
        }
      },
      [onError],
    );

    if (validationError && showErrorInline) {
      return (
        <View style={[styles.errorContainer, style]}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorMessage}>{validationError}</Text>
        </View>
      );
    }

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
