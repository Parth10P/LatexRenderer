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

  latex: string;
  fontSize?: number;
  textColor?: string;
  maxWidth?: number;
  style?: ViewStyle;
  onError?: (error: string) => void;
}

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
        if (!latex || latex.trim() === '') {
          setError('Empty LaTeX expression');
          setLoading(false);
          return;
        }

        try {
          setLoading(true);
          setError(null);

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

    if (loading) {
      return (
        <View style={[styles.container, style]}>
          <ActivityIndicator size="small" color="#666" />
        </View>
      );
    }

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

    if (!imageUri) {
      return (
        <View style={[styles.container, style]}>
          <Text style={styles.fallbackText}>{latex}</Text>
        </View>
      );
    }
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

            const maxW = 350; 
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
