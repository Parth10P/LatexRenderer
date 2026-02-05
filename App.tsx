/**
 * React Native LaTeX Renderer Demo App
 *
 * Demonstrates native LaTeX rendering with all 15 test cases from the assignment.
 * Uses LatexRenderer component backed by native MTMathView (vector-based, not image).
 */

import React from 'react';
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  Text,
  View,
  StatusBar,
  useColorScheme,
} from 'react-native';
import LatexRenderer from './src/components/LatexRenderer';

// All 15 test cases from IMPLEMENTATION_PROMPT.md
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

// Type for parsed content parts
interface ContentPart {
  type: 'text' | 'latex';
  content: string;
  display?: boolean;
}

/**
 * Parse content to extract LaTeX expressions.
 * Handles both $...$ (inline) and $$...$$ (display) delimiters.
 */
const parseContent = (content: string): ContentPart[] => {
  const parts: ContentPart[] = [];
  let currentIndex = 0;

  // Match $$ ... $$ for display math
  const displayRegex = /\$\$([\s\S]*?)\$\$/g;
  // Match $ ... $ for inline math (but not $$)
  const inlineRegex = /\$([^\$]+?)\$/g;

  interface MathMatch {
    start: number;
    end: number;
    content: string;
    display: boolean;
  }

  const allMatches: MathMatch[] = [];
  let match: RegExpExecArray | null;

  // Find all display math
  while ((match = displayRegex.exec(content)) !== null) {
    allMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      content: match[1].trim(),
      display: true,
    });
  }

  // Find all inline math
  while ((match = inlineRegex.exec(content)) !== null) {
    // Check if this match is not inside a display math block
    const insideDisplay = allMatches.some(
      dm => match!.index > dm.start && match!.index < dm.end,
    );
    if (!insideDisplay) {
      // Check if it looks like a currency value (followed by a number)
      const afterDollar = match[1];
      if (/^\d+(\.\d+)?$/.test(afterDollar.trim())) {
        // This is likely a currency value, not LaTeX - skip
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

  // Sort by start position
  allMatches.sort((a, b) => a.start - b.start);

  // Build parts array
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

  // If no LaTeX found, return as single text part
  if (parts.length === 0) {
    parts.push({ type: 'text', content });
  }

  return parts;
};

/**
 * ContentRenderer - Renders mixed text and LaTeX content.
 */
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
        if (part.type === 'text') {
          return (
            <Text key={index} style={[styles.text, { color: textColor }]}>
              {part.content}
            </Text>
          );
        } else {
          return (
            <LatexRenderer
              key={index}
              latex={part.content}
              fontSize={part.display ? 50 : 50}
              textColor={textColor}
              style={part.display ? styles.displayMath : styles.inlineMath}
              showErrorInline={true}
            />
          );
        }
      })}
    </View>
  );
};

/**
 * Main App Component
 */
const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const backgroundColor = isDarkMode ? '#1a1a1a' : '#f5f5f5';
  const cardBackgroundColor = isDarkMode ? '#2d2d2d' : '#ffffff';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: cardBackgroundColor }]}>
        <Text style={[styles.title, { color: textColor }]}>
          LaTeX Renderer Test
        </Text>
        <Text
          style={[styles.subtitle, { color: isDarkMode ? '#888' : '#666' }]}
        >
          Native View - All 15 Test Cases
        </Text>
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
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        // Performance optimizations for smooth scrolling
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
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
  },
  text: {
    fontSize: 16,
    lineHeight: 26,
    marginVertical: 8,
  },
  displayMath: {
    alignSelf: 'center',
    marginVertical: 24,
    paddingVertical: 12,
    minHeight: 60,
  },
  inlineMath: {
    alignSelf: 'flex-start',
    marginVertical: 24,
    paddingVertical: 12,
    minHeight: 50,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
});

export default App;
