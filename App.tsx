import React, { useState } from 'react';
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  Text,
  View,
  StatusBar,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';
import LatexRenderer from './src/components/LatexRenderer';
import PerformanceTestScreen from './src/components/PerformanceTestScreen';

const TEST_CASES = [
  {
    id: '1',
    content:
      "This question is straightforward. Let's solve it step by step.\nRemember: speed = distance / time.",
  },
  {
    id: '2',
    content:
      'The formula for speed is $v = \\frac{d}{t}$.\nWe know that $a^2 + b^2 = c^2$ from the Pythagorean theorem.',
  },
  {
    id: '3',
    content:
      'If $x > 0$ and $x \\neq 1$, then $\\log x$ is defined and $x^n$ grows exponentially.',
  },
  {
    id: '4',
    content:
      'To calculate the area, we integrate the function:\n$$A = \\int_a^b f(x)\\,dx$$\nNow substitute the limits.',
  },
  {
    id: '5',
    content:
      'Consider the function $f(x) = \\frac{(x^2 + 3x + 5)(x^3 - 2x + 7)(x^4 + x^2 + 1)}{(x - 1)(x + 2)(x^2 + x + 1)}$ and analyze its behavior.',
  },
  {
    id: '6',
    content:
      'We now simplify $\\frac{(a_1 + a_2 + a_3 + \\cdots + a_n)^2}{\\sqrt{(b_1^2 + b_2^2 + \\cdots + b_n^2)(c_1^2 + c_2^2 + \\cdots + c_n^2)}}$ before proceeding.',
  },
  {
    id: '7',
    content:
      '$(a_1 + a_2 + a_3 + a_4 + a_5 + a_6 + a_7 + a_8 + a_9 + a_{10} + a_{11} + a_{12} + a_{13} + a_{14} + a_{15} + \\cdots + a_n)^2$',
  },
  {
    id: '8',
    content:
      'Using the identities:\n$$\\sin^2 x + \\cos^2 x = 1$$\nand\n$$\\tan x = \\frac{\\sin x}{\\cos x}$$\nwe can derive the result.',
  },
  {
    id: '9',
    content:
      "Let's solve this step by step.\nFirst, recall the identity $a^2 - b^2 = (a-b)(a+b)$.\nNow apply it to the expression:\n$$x^2 - 9$$\nFinally, factorize and simplify.",
  },
  {
    id: '10',
    content:
      'This expression is wrong: $\\frac{a+b }{ c$ and should not crash.',
    expectError: true,
  },
  {
    id: '11',
    content: 'Try rendering this: $\\sqrt{2 +$ which is invalid.',
    expectError: true,
  },
  {
    id: '12',
    content: 'Here is something unsupported: $\\unknowncommand{x}$.',
    expectError: true,
  },
  {
    id: '13',
    content: 'The total cost is $500 and the discount is $50.',
  },
  {
    id: '14',
    content: 'He earned $1000 in his first job.',
  },
  {
    id: '15',
    content:
      'We now simplify $\\frac{(a_1 + a_2 + a_3 + \\cdots + a_n)^2}{\\sqrt{(b_1^2 + b_2^2 + \\cdots + b_n^2)(c_1^2 + c_2^2 + \\cdots + c_n^2)}}$ before proceeding further in the solution.',
  },
];

interface ContentPart {
  type: 'text' | 'latex';
  content: string;
  display?: boolean;
}

const parseContent = (content: string): ContentPart[] => {
  const parts: ContentPart[] = [];
  let currentIndex = 0;
  const displayRegex = /\$\$([\s\S]*?)\$\$/g;
  const inlineRegex = /\$([^\$]+?)\$/g;

  interface MathMatch {
    start: number;
    end: number;
    content: string;
    display: boolean;
  }

  const allMatches: MathMatch[] = [];
  let match: RegExpExecArray | null;

  while ((match = displayRegex.exec(content)) !== null) {
    allMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      content: match[1].trim(),
      display: true,
    });
  }

  while ((match = inlineRegex.exec(content)) !== null) {
    const insideDisplay = allMatches.some(
      dm => match!.index > dm.start && match!.index < dm.end,
    );
    if (!insideDisplay) {
      const afterDollar = match[1];
      if (/^\d+(\.\d+)?$/.test(afterDollar.trim())) {
        continue;
      }

      allMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        content: match[1].trim(),
        display: false,
      });
    }
  }

  allMatches.sort((a, b) => a.start - b.start);

  allMatches.forEach(m => {
    if (m.start > currentIndex) {
      parts.push({
        type: 'text',
        content: content.substring(currentIndex, m.start),
      });
    }
    parts.push({
      type: 'latex',
      content: m.content,
      display: m.display,
    });
    currentIndex = m.end;
  });

  if (currentIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.substring(currentIndex),
    });
  }

  if (parts.length === 0) {
    parts.push({ type: 'text', content });
  }

  return parts;
};

const ContentRenderer = ({
  content,
  textColor,
}: {
  content: string;
  textColor: string;
}) => {
  const parts = parseContent(content);

  return (
    <View style={styles.contentContainer}>
      {parts.map((part, index) => {
        if (part.type === 'latex') {
          const isDisplay = part.display;
          // Use consistent large font size like PerformanceTestScreen
          const fontSize = isDisplay ? 45 : 40;
          return (
            <LatexRenderer
              key={index}
              latex={part.content}
              fontSize={fontSize}
              textColor={textColor}
              style={isDisplay ? styles.displayMath : styles.inlineMathItem}
              showErrorInline={true}
            />
          );
        } else {
          // Text part
          return (
            <Text key={index} style={[styles.textItem, { color: textColor }]}>
              {part.content}
            </Text>
          );
        }
      })}
    </View>
  );
};

const App = () => {
  const [showPerformanceTest, setShowPerformanceTest] = useState(false);
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const backgroundColor = isDarkMode ? '#1a1a1a' : '#f5f5f5';
  const cardBackgroundColor = isDarkMode ? '#2d2d2d' : '#ffffff';

  if (showPerformanceTest) {
    return (
      <PerformanceTestScreen onBack={() => setShowPerformanceTest(false)} />
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: cardBackgroundColor }]}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.title, { color: textColor }]}>
              LaTeX Renderer Test
            </Text>
            <Text
              style={[styles.subtitle, { color: isDarkMode ? '#888' : '#666' }]}
            >
              Native View - All 15 Test Cases
            </Text>
          </View>
          <TouchableOpacity
            style={styles.performanceButton}
            onPress={() => setShowPerformanceTest(true)}
          >
            <Text style={styles.performanceButtonText}>🚀 Test 50×</Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={TEST_CASES}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View
            style={[
              styles.item,
              { backgroundColor: cardBackgroundColor },
              item.expectError && styles.errorItem,
            ]}
          >
            <View style={styles.itemHeader}>
              <Text
                style={[
                  styles.itemNumber,
                  { color: isDarkMode ? '#888' : '#666' },
                ]}
              >
                Test Case {item.id}
              </Text>
              {item.expectError && (
                <Text style={styles.errorBadge}>⚠️ Error Test</Text>
              )}
            </View>
            <ContentRenderer content={item.content} textColor={textColor} />

            <View
              style={[
                styles.codeContainer,
                { backgroundColor: isDarkMode ? '#1a1a1a' : '#f8f8f8' },
              ]}
            >
              <Text
                style={[
                  styles.codeLabel,
                  { color: isDarkMode ? '#888' : '#666' },
                ]}
              >
                LaTeX Source:
              </Text>
              <Text
                style={[
                  styles.codeText,
                  { color: isDarkMode ? '#e0e0e0' : '#333' },
                ]}
              >
                {item.content}
              </Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  performanceButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  performanceButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    padding: 16,
    paddingHorizontal: 10
    ,
  },
  errorItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemNumber: {
    fontSize: 12,
  },
  errorBadge: {
    fontSize: 10,
    color: '#856404',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  contentContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
    lineHeight: 26,
    marginVertical: 8,
    textAlign: 'center',
  },
  displayMath: {
    alignSelf: 'center',
    marginVertical: 16,
    paddingVertical: 8,
    minHeight: 60,
  },
  wrapContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  inlineMath: {
    alignSelf: 'center',
    marginVertical: 12,
    paddingVertical: 8,
    minHeight: 50,
  },
  inlineMathItem: {
    alignSelf: 'center',
    marginVertical: 10,
    minHeight: 40,
  },
  textItem: {
    fontSize: 20,
    lineHeight: 34,
    color: '#000000',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  codeContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  codeLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
});

export default App;
