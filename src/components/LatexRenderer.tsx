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

  // List of known/supported LaTeX commands (from MTMathView / AndroidMath)
  const knownCommands = [
    'frac',
    'sqrt',
    'sum',
    'prod',
    'int',
    'oint',
    'iint',
    'iiint',
    'sin',
    'cos',
    'tan',
    'cot',
    'sec',
    'csc',
    'arcsin',
    'arccos',
    'arctan',
    'sinh',
    'cosh',
    'tanh',
    'coth',
    'log',
    'ln',
    'exp',
    'lim',
    'limsup',
    'liminf',
    'sup',
    'inf',
    'min',
    'max',
    'alpha',
    'beta',
    'gamma',
    'delta',
    'epsilon',
    'varepsilon',
    'zeta',
    'eta',
    'theta',
    'vartheta',
    'iota',
    'kappa',
    'lambda',
    'mu',
    'nu',
    'xi',
    'pi',
    'varpi',
    'rho',
    'varrho',
    'sigma',
    'varsigma',
    'tau',
    'upsilon',
    'phi',
    'varphi',
    'chi',
    'psi',
    'omega',
    'Gamma',
    'Delta',
    'Theta',
    'Lambda',
    'Xi',
    'Pi',
    'Sigma',
    'Upsilon',
    'Phi',
    'Psi',
    'Omega',
    'pm',
    'mp',
    'times',
    'div',
    'cdot',
    'cdots',
    'ldots',
    'vdots',
    'ddots',
    'ast',
    'star',
    'circ',
    'bullet',
    'oplus',
    'ominus',
    'otimes',
    'oslash',
    'cap',
    'cup',
    'uplus',
    'sqcap',
    'sqcup',
    'vee',
    'wedge',
    'setminus',
    'wr',
    'diamond',
    'bigtriangleup',
    'bigtriangledown',
    'triangleleft',
    'triangleright',
    'lhd',
    'rhd',
    'unlhd',
    'unrhd',
    'leq',
    'le',
    'geq',
    'ge',
    'neq',
    'ne',
    'sim',
    'simeq',
    'approx',
    'cong',
    'equiv',
    'prec',
    'succ',
    'preceq',
    'succeq',
    'll',
    'gg',
    'subset',
    'supset',
    'subseteq',
    'supseteq',
    'sqsubset',
    'sqsupset',
    'sqsubseteq',
    'sqsupseteq',
    'in',
    'ni',
    'notin',
    'vdash',
    'dashv',
    'models',
    'perp',
    'mid',
    'parallel',
    'bowtie',
    'smile',
    'frown',
    'propto',
    'leftarrow',
    'rightarrow',
    'leftrightarrow',
    'Leftarrow',
    'Rightarrow',
    'Leftrightarrow',
    'longleftarrow',
    'longrightarrow',
    'longleftrightarrow',
    'Longleftarrow',
    'Longrightarrow',
    'Longleftrightarrow',
    'uparrow',
    'downarrow',
    'updownarrow',
    'Uparrow',
    'Downarrow',
    'Updownarrow',
    'nearrow',
    'searrow',
    'nwarrow',
    'swarrow',
    'mapsto',
    'longmapsto',
    'hookleftarrow',
    'hookrightarrow',
    'leftharpoonup',
    'leftharpoondown',
    'rightharpoonup',
    'rightharpoondown',
    'rightleftharpoons',
    'leadsto',
    'forall',
    'exists',
    'nexists',
    'neg',
    'lnot',
    'land',
    'lor',
    'top',
    'bot',
    'emptyset',
    'varnothing',
    'infty',
    'nabla',
    'partial',
    'angle',
    'prime',
    'backprime',
    'triangle',
    'square',
    'blacksquare',
    'lozenge',
    'blacklozenge',
    'clubsuit',
    'diamondsuit',
    'heartsuit',
    'spadesuit',
    'flat',
    'natural',
    'sharp',
    'Re',
    'Im',
    'wp',
    'aleph',
    'beth',
    'gimel',
    'daleth',
    'hbar',
    'ell',
    'imath',
    'jmath',
    'left',
    'right',
    'big',
    'Big',
    'bigg',
    'Bigg',
    'lbrace',
    'rbrace',
    'lbrack',
    'rbrack',
    'langle',
    'rangle',
    'lceil',
    'rceil',
    'lfloor',
    'rfloor',
    'vert',
    'Vert',
    'backslash',
    'overline',
    'underline',
    'overbrace',
    'underbrace',
    'hat',
    'check',
    'tilde',
    'acute',
    'grave',
    'dot',
    'ddot',
    'breve',
    'bar',
    'vec',
    'widehat',
    'widetilde',
    'text',
    'textbf',
    'textit',
    'textrm',
    'textsf',
    'texttt',
    'mathbf',
    'mathit',
    'mathrm',
    'mathsf',
    'mathtt',
    'mathbb',
    'mathcal',
    'mathfrak',
    'mathscr',
    'binom',
    'tbinom',
    'dbinom',
    'choose',
    'atop',
    'over',
    'above',
    'begin',
    'end',
    'matrix',
    'pmatrix',
    'bmatrix',
    'Bmatrix',
    'vmatrix',
    'Vmatrix',
    'array',
    'cases',
    'aligned',
    'gathered',
    'split',
    'hspace',
    'vspace',
    'quad',
    'qquad',
    'thinspace',
    'enspace',
    'kern',
    'mkern',
    'hfill',
    'vfill',
    'hskip',
    'vskip',
    'color',
    'textcolor',
    'colorbox',
    'fcolorbox',
    'not',
    'cancel',
    'bcancel',
    'xcancel',
    'cancelto',
    'boxed',
    'fbox',
    'frame',
    'framebox',
  ];

  // Check for unknown commands
  const commandPattern = /\\([a-zA-Z]+)/g;
  let match;
  while ((match = commandPattern.exec(latex)) !== null) {
    const command = match[1];
    if (!knownCommands.includes(command)) {
      return `Unsupported command: \\${command}`;
    }
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
  ({
    latex,
    fontSize = 20,
    textColor = '#000000',
    style,
    onError,
    showErrorInline = false,
  }) => {
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
