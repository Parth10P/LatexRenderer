import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  TouchableOpacity,
  TextInput,
  ScrollView,
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
  const [activeTab, setActiveTab] = useState<'examples' | 'playground'>(
    'examples',
  );
  const [inputLatex, setInputLatex] = useState<string>('\\frac{a}{b}');
  const [displayLatex, setDisplayLatex] = useState<string>('\\frac{a}{b}');

  // Memoize equations list
  const equations = useMemo(() => generateEquations(), []);

  // Handler for render button
  const handleRender = () => {
    setDisplayLatex(inputLatex);
  };

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
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'examples' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('examples')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'examples' && styles.activeTabText,
              ]}
            >
              Examples
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'playground' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('playground')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'playground' && styles.activeTabText,
              ]}
            >
              Playground
            </Text>
          </TouchableOpacity>
        </View>

        {/* View Content */}
        {activeTab === 'examples' ? (
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
        ) : (
          <ScrollView contentContainerStyle={styles.playgroundContainer}>
            <Text style={[styles.label, isDarkMode && styles.darkText]}>
              Enter LaTeX Code:
            </Text>
            <TextInput
              style={[styles.input, isDarkMode && styles.darkInput]}
              multiline
              value={inputLatex}
              onChangeText={setInputLatex}
              placeholder="e.g. \sqrt{x}"
              placeholderTextColor="#999"
            />

            <TouchableOpacity
              style={styles.renderButton}
              onPress={handleRender}
            >
              <Text style={styles.renderButtonText}>Render LaTeX</Text>
            </TouchableOpacity>

            <Text style={[styles.label, isDarkMode && styles.darkText]}>
              Preview:
            </Text>
            <View style={styles.previewCard}>
              <LatexRenderer
                latex={displayLatex}
                fontSize={30}
                textColor={isDarkMode ? '#FFFFFF' : '#000000'}
                style={styles.latex}
              />
            </View>
          </ScrollView>
        )}
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
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    justifyContent: 'center',
    gap: 12,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  activeTabText: {
    color: '#FFF',
  },
  // Playground
  playgroundContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
    marginTop: 12,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    color: '#000',
  },
  darkInput: {
    backgroundColor: '#333',
    borderColor: '#555',
    color: '#FFF',
  },
  renderButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  renderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previewCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 24,
    minHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    marginTop: 8,
  },
  // Existing Styles
  darkText: {
    color: '#FFFFFF',
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
