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

// Sample LaTeX equations for testing - variety of complexity levels
const LATEX_EQUATIONS = [
  // Simple equations
  'x^2 + y^2 = z^2',
  'E = mc^2',
  'a^2 + b^2 = c^2',
  'f(x) = x^2',
  '\\pi \\approx 3.14159',

  // Medium complexity
  '\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}',
  '\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}',
  '\\lim_{x \\to \\infty} \\frac{1}{x} = 0',
  '\\int x^2 dx = \\frac{x^3}{3} + C',
  '\\sqrt{x^2 + y^2}',

  // Trigonometry
  '\\sin^2(x) + \\cos^2(x) = 1',
  '\\tan(x) = \\frac{\\sin(x)}{\\cos(x)}',
  'e^{i\\pi} + 1 = 0',
  '\\sin(2x) = 2\\sin(x)\\cos(x)',
  '\\cos(a+b) = \\cos a \\cos b - \\sin a \\sin b',

  // Calculus
  '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
  '\\frac{d}{dx}[\\sin(x)] = \\cos(x)',
  '\\frac{\\partial f}{\\partial x}',
  '\\nabla \\cdot \\vec{F} = 0',
  '\\oint_C \\vec{F} \\cdot d\\vec{r}',

  // Linear Algebra
  '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}',
  '\\det(A) = ad - bc',
  'A^{-1} = \\frac{1}{\\det(A)} \\text{adj}(A)',
  '\\vec{a} \\times \\vec{b}',
  '\\|\\vec{v}\\| = \\sqrt{v_1^2 + v_2^2 + v_3^2}',

  // Complex equations
  '\\binom{n}{k} = \\frac{n!}{k!(n-k)!}',
  '\\prod_{i=1}^{n} x_i',
  '\\bigcup_{i=1}^{n} A_i',
  '\\forall x \\in \\mathbb{R}',
  '\\exists y : y > x',

  // Physics
  'F = G\\frac{m_1 m_2}{r^2}',
  'PV = nRT',
  '\\Delta E = \\hbar \\omega',
  'S = k_B \\ln W',
  '\\vec{F} = m\\vec{a}',

  // Statistics
  '\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i',
  '\\sigma = \\sqrt{\\frac{1}{n}\\sum_{i=1}^{n}(x_i - \\mu)^2}',
  'P(A|B) = \\frac{P(B|A)P(A)}{P(B)}',
  '\\mathbb{E}[X] = \\sum_{i} x_i p_i',
  'Var(X) = \\mathbb{E}[X^2] - (\\mathbb{E}[X])^2',

  // More equations to reach 50+
  '\\alpha + \\beta = \\gamma',
  '\\theta = \\arctan\\left(\\frac{y}{x}\\right)',
  '\\log_a(xy) = \\log_a x + \\log_a y',
  'n! = n \\times (n-1)!',
  '\\zeta(s) = \\sum_{n=1}^{\\infty} \\frac{1}{n^s}',
  '\\Gamma(n) = (n-1)!',
  '\\phi = \\frac{1 + \\sqrt{5}}{2}',
  'i^2 = -1',
  '|z| = \\sqrt{a^2 + b^2}',
  '\\arg(z) = \\arctan\\left(\\frac{b}{a}\\right)',

  '\\left(a_1 + a_2 + a_3 + a_4 + a_5 + a_6 + a_7 + a_8 + a_9 + a_{10} + a_{11} + a_{12} + a_{13} + a_{14} + a_{15} + a_{16} + a_{17} + a_{18} + a_{19} + a_{20} + a_{21} + a_{22} + a_{23} + a_{24} + a_{25} + \\cdots + a_n \\right)^2',
];

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
