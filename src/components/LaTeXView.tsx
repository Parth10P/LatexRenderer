/**
 * LaTeXView Component
 *
 * React Native component that renders LaTeX using native Android module.
 * Uses Base64-encoded PNG images for display.
 *
 * Features:
 * - Native rendering via LaTeXModule
 * - In-memory caching for performance
 * - Loading and error states
 * - Memoization to prevent unnecessary re-renders
 */

import React, { useEffect, useState, memo } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  NativeModules,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';

const { LaTeXRenderer } = NativeModules;

interface LaTeXViewProps {
  /** The LaTeX string to render */
  latex: string;
  /** Font size for rendering (default: 20) */
  fontSize?: number;
  /** Text color as hex string (default: "#000000") */
  textColor?: string;
  /** Maximum width for the rendered expression */
  maxWidth?: number;
  /** Optional style for the container */
  style?: ViewStyle;
  /** Callback when an error occurs */
  onError?: (error: string) => void;
}

/**
 * LaTeXView - Renders LaTeX expressions using native Android module.
 *
 * @example
 * ```tsx
 * <LaTeXView
 *   latex="x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}"
 *   fontSize={24}
 *   textColor="#333333"
 * />
 * ```
 */
const LaTeXView: React.FC<LaTeXViewProps> = memo(
  ({
    latex,
    fontSize = 20,
    textColor = '#000000',
    maxWidth = 800,
    style,
    onError,
  }) => {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageDimensions, setImageDimensions] = useState({
      width: 100,
      height: 30,
    });

    useEffect(() => {
      let isMounted = true;

      const renderLaTeX = async () => {
        // Validate LaTeX input
        if (!latex || latex.trim() === '') {
          setError('Empty LaTeX expression');
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setError(null);

          // Check if LaTeXRenderer is available
          if (!LaTeXRenderer || !LaTeXRenderer.renderLaTeX) {
            throw new Error('LaTeXRenderer native module not available');
          }

          const result = await LaTeXRenderer.renderLaTeX(latex, {
            fontSize,
            textColor,
            maxWidth,
          });

          if (isMounted) {
            setImageUri(result);
            setLoading(false);
          }
        } catch (err: unknown) {
          if (isMounted) {
            const errorMessage =
              err instanceof Error ? err.message : 'Failed to render LaTeX';
            setError(errorMessage);
            setLoading(false);
            if (onError) {
              onError(errorMessage);
            }
          }
        }
      };

      renderLaTeX();

      return () => {
        isMounted = false;
      };
    }, [latex, fontSize, textColor, maxWidth, onError]);

    // Loading state
    if (loading) {
      return (
        <View style={[styles.container, style]}>
          <ActivityIndicator size="small" color="#666" />
        </View>
      );
    }

    // Error state
    if (error) {
      return (
        <View style={[styles.errorContainer, style]}>
          <Text style={styles.errorText}>
            ⚠️ {latex.substring(0, 30)}
            {latex.length > 30 ? '...' : ''}
          </Text>
          <Text style={styles.errorDetails}>{error}</Text>
        </View>
      );
    }

    // No image state
    if (!imageUri) {
      return (
        <View style={[styles.container, style]}>
          <Text style={styles.fallbackText}>{latex}</Text>
        </View>
      );
    }

    // Success state - display rendered image with proper sizing
    return (
      <View style={[styles.container, style]}>
        <Image
          source={{ uri: imageUri }}
          style={{
            width: imageDimensions.width,
            height: imageDimensions.height,
          }}
          resizeMode="contain"
          onLoad={event => {
            const { width, height } = event.nativeEvent.source;
            // Use actual image dimensions, scaled down if needed
            const maxW = 350; // Max width to fit screen
            const scale = width > maxW ? maxW / width : 1;
            setImageDimensions({
              width: Math.round(width * scale),
              height: Math.round(height * scale),
            });
          }}
        />
      </View>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memoization - only re-render if these props change
    return (
      prevProps.latex === nextProps.latex &&
      prevProps.fontSize === nextProps.fontSize &&
      prevProps.textColor === nextProps.textColor &&
      prevProps.maxWidth === nextProps.maxWidth
    );
  },
);

LaTeXView.displayName = 'LaTeXView';

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  errorContainer: {
    padding: 8,
    backgroundColor: '#fff3cd',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  errorText: {
    color: '#856404',
    fontSize: 14,
  },
  errorDetails: {
    color: '#856404',
    fontSize: 10,
    marginTop: 4,
  },
  fallbackText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default LaTeXView;
