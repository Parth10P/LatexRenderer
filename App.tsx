/**
 * LaTexRenderer App - Demo with FlatList for 60 FPS scrolling test
 *
 * This app demonstrates native LaTeX rendering with 50+ equations
 * in a FlatList to prove smooth scrolling performance.
 */

import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import LatexRenderer from './src/components/LatexRenderer';

import { LATEX_EQUATIONS } from './src/data/latexEquations';

// Item type for FlatList
interface EquationItem {
  id: string;
  latex: string;
  index: number;
}

// Generate 50+ items by repeating if needed
const generateEquations = (): EquationItem[] => {
  const items: EquationItem[] = [];
  for (let i = 0; i < 60; i++) {
    const latex = LATEX_EQUATIONS[i % LATEX_EQUATIONS.length];
    items.push({
      id: `eq-${i}`,
      latex: latex,
      index: i + 1,
    });
  }
  return items;
};

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  // Memoize equations list
  const equations = useMemo(() => generateEquations(), []);

  // Memoized render function for optimal FlatList performance
  const renderItem = useCallback(
    ({ item }: { item: EquationItem }) => (
      <View style={styles.equationCard}>
        <Text style={[styles.equationIndex, isDarkMode && styles.darkText]}>
          #{item.index}
        </Text>
        <View style={styles.latexContainer}>
          <LatexRenderer
            latex={item.latex}
            fontSize={30}
            textColor={isDarkMode ? '#FFFFFF' : '#000000'}
            style={styles.latex}
          />
        </View>
        <Text style={[styles.latexSource, isDarkMode && styles.darkSubText]}>
          {item.latex}
        </Text>
      </View>
    ),
    [isDarkMode],
  );

  // Key extractor for FlatList
  const keyExtractor = useCallback((item: EquationItem) => item.id, []);

  // Optimized FlatList settings for 60 FPS
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: 120,
      offset: 120 * index,
      index,
    }),
    [],
  );

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView
        style={[styles.container, isDarkMode && styles.darkContainer]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>
            Native LaTeX Renderer
          </Text>
          <Text style={[styles.subtitle, isDarkMode && styles.darkSubText]}>
            50 equations • Scroll to test 60 FPS
          </Text>
        </View>

        <FlatList
          data={equations}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={8}
          updateCellsBatchingPeriod={60}
          // Styling
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  darkContainer: {
    backgroundColor: '#1A1A1A',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  darkText: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  darkSubText: {
    color: '#999',
  },
  listContent: {
    padding: 16,
  },
  equationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  equationIndex: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
  },
  latexContainer: {
    minHeight: 40,
    justifyContent: 'center',
  },
  latex: {
    alignSelf: 'flex-start',
  },
  latexSource: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#AAA',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
});

export default App;
