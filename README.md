# React Native LaTeX Renderer

Native LaTeX rendering for React Native using AndroidMath on Android.

## Architecture

### Native Module Design

```
┌──────────────────────────────────────────────────────────────────┐
│                        React Native Layer                         │
├──────────────────────────────────────────────────────────────────┤
│  LaTeXView.tsx                                                    │
│  - Calls NativeModules.LaTeXRenderer.renderLaTeX()               │
│  - Displays Base64 PNG images                                     │
│  - Handles loading/error states                                   │
│  - Memoized for performance                                       │
└─────────────────────────┬────────────────────────────────────────┘
                          │ React Native Bridge
┌─────────────────────────▼────────────────────────────────────────┐
│                        Native Layer (Android)                     │
├──────────────────────────────────────────────────────────────────┤
│  LaTeXModule.java                                                 │
│  - @ReactMethod renderLaTeX(latex, options, promise)             │
│  - HashMap cache for rendered expressions                         │
│  - Background thread for Base64 encoding                          │
│  - Graceful error handling                                        │
│                                                                    │
│  AndroidMath (MTMathView)                                         │
│  - Native LaTeX parsing and rendering                             │
│  - Renders to Bitmap via Canvas                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Component Structure

| File                | Purpose                                   |
| ------------------- | ----------------------------------------- |
| `LaTeXModule.java`  | Native module with `renderLaTeX()` method |
| `LaTeXPackage.java` | Registers native module                   |
| `LaTeXView.tsx`     | React component for rendering             |
| `App.tsx`           | Demo with 15 test cases                   |

---

## Performance Optimizations

### 1. Caching (HashMap)

```java
private final Map<String, String> cache = new HashMap<>();
String cacheKey = latex + "_" + fontSize + "_" + textColor;
```

- In-memory cache prevents re-rendering identical expressions
- Cache key includes all render parameters for correctness

### 2. Memoization (React.memo)

```typescript
const LaTeXView = memo(({ latex, fontSize, ... }) => {
  // Component logic
}, (prevProps, nextProps) => {
  return prevProps.latex === nextProps.latex && ...;
});
```

- Avoids unnecessary re-renders in FlatList
- Custom comparison function for fine-grained control

### 3. Async Rendering

- LaTeX parsing on UI thread (required by MTMathView)
- Base64 encoding on background thread via ExecutorService
- Promises for non-blocking JS bridge

### 4. FlatList Optimizations

```typescript
<FlatList
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
  initialNumToRender={5}
/>
```

---

## Error Handling

### Native Layer

```java
try {
    // Render LaTeX
} catch (Exception e) {
    promise.reject("LATEX_ERROR", "Failed to render: " + e.getMessage());
}
```

- Try-catch wraps all rendering
- Errors returned via Promise rejection
- App never crashes on invalid LaTeX

### React Layer

```typescript
if (error) {
  return (
    <View style={styles.errorContainer}>
      <Text>⚠️ {latex}</Text>
      <Text>{error}</Text>
    </View>
  );
}
```

- Fallback UI shows original LaTeX with error message
- Invalid expressions (test cases 10-12) display gracefully

---

## Tradeoffs

| Decision                      | Pros                       | Cons                                   |
| ----------------------------- | -------------------------- | -------------------------------------- |
| **Base64 vs File Storage**    | Simple, no file management | Higher memory for large lists          |
| **AndroidMath vs JLaTeXMath** | Android-compatible         | Less comprehensive than JLaTeXMath     |
| **HashMap Cache**             | Fast lookups, simple       | No size limit (could grow unbounded)   |
| **UI Thread Rendering**       | Required by MTMathView     | Brief blocking for complex expressions |

### Future Improvements

- LRU cache with size limit
- File-based caching for persistence
- Web worker for JS-side processing

---

## Setup

```bash
# Install dependencies
npm install

# Clean Android build
cd android && ./gradlew clean && cd ..

# Run on Android
npx react-native run-android
```

---

## Test Cases

All 15 assignment test cases are included in `App.tsx`:

| #   | Description                 | Type     |
| --- | --------------------------- | -------- |
| 1   | Plain text (no LaTeX)       | Text     |
| 2   | Inline math with `$...$`    | Mixed    |
| 3   | Inline math with conditions | Mixed    |
| 4   | Display math with `$$...$$` | Display  |
| 5   | Complex inline function     | Complex  |
| 6   | Nested fractions and sqrt   | Complex  |
| 7   | Wide expression (overflow)  | Wide     |
| 8   | Multiple display equations  | Multiple |
| 9   | Step-by-step solution       | Mixed    |
| 10  | Invalid: mismatched braces  | Error    |
| 11  | Invalid: incomplete sqrt    | Error    |
| 12  | Invalid: unknown command    | Error    |
| 13  | Dollar sign as currency     | Text     |
| 14  | Dollar sign as currency     | Text     |
| 15  | Performance test expression | Complex  |

---

## Validation

Run the validation script to verify implementation:

```bash
./validate-repo.sh
```

Expected output:

- ✓ LaTeXModule.java found
- ✓ LaTeXPackage.java found
- ✓ LaTeX component in src/
- ✓ README contains: architecture, performance, cache
- Score: 90%+ (EXCELLENT)
