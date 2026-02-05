
import React from 'react';
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
} from 'react-native';
import LatexRenderer from './LatexRenderer';

interface PerformanceTestScreenProps {
  onBack: () => void;
}


const TEST_CASE_15_CONTENT =
  'We now simplify $\\frac{(a_1 + a_2 + a_3 + \\cdots + a_n)^2}{\\sqrt{(b_1^2 + b_2^2 + \\cdots + b_n^2)(c_1^2 + c_2^2 + \\cdots + c_n^2)}}$ before proceeding further in the solution.';


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


const generateTestData = () => {
  return Array.from({ length: 50 }, (_, index) => ({
    id: String(index + 1),
    content: TEST_CASE_15_CONTENT,
  }));
};

const PerformanceTestScreen: React.FC<PerformanceTestScreenProps> = ({
  onBack,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const backgroundColor = isDarkMode ? '#1a1a1a' : '#f5f5f5';
  const cardBackgroundColor = isDarkMode ? '#2d2d2d' : '#ffffff';

  const testData = React.useMemo(() => generateTestData(), []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: cardBackgroundColor }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: textColor }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.title, { color: textColor }]}>
            Performance Test
          </Text>
          <Text
            style={[styles.subtitle, { color: isDarkMode ? '#888' : '#666' }]}
          >
            Test Case 15 × 50 items
          </Text>
        </View>
      </View>

      <FlatList
        data={testData}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: cardBackgroundColor }]}>
            <Text
              style={[
                styles.itemNumber,
                { color: isDarkMode ? '#888' : '#666' },
              ]}
            >
              Item #{item.id}
            </Text>
            <ContentRenderer content={item.content} textColor={textColor} />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={3}
        getItemLayout={(_, index) => ({
          length: 200,
          offset: 200 * index,
          index,
        })}
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTextContainer: {
    flex: 1,
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
  itemNumber: {
    fontSize: 12,
    marginBottom: 8,
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

export default PerformanceTestScreen;
