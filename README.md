# LaTeX Renderer for React Native

A native Android module for rendering LaTeX mathematical expressions in React Native applications with high performance and smooth scrolling.

---

## Demo Video

<!-- Add your demo video link here -->

[**Watch Demo Video**](https://drive.google.com/file/d/1XZvHC1wYCzb9SOYXU75V8v0MgNPE6R9g/view?usp=sharing)

---

## Download APK

<!-- Add your APK download link here -->

[**Download APK**](https://drive.google.com/file/d/1Kc2FRaRmKFKWz5q3eoWFxG4t1cA4gZSw/view?usp=sharing)

---

## Overview

This project is a **native Android implementation** for rendering LaTeX expressions in React Native. Unlike WebView-based solutions, this approach uses the **AndroidMath (MTMathView)** library for direct native rendering, resulting in better performance and smoother user experience.

### Key Highlights

- **Pure Native Rendering** - No WebView overhead
- **Smooth Scrolling** - Optimized for FlatList with 50+ items
- **Error Handling** - Graceful fallback for invalid LaTeX
- **Interactive Playground** - Test LaTeX expressions in real-time

---

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Native (JS)                         │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  App.tsx                                                     │ │
│  │    ├── ContentRenderer (parses $...$ and $$...$$)           │ │
│  │    ├── PlaygroundScreen (interactive editor)                 │ │
│  │    └── PerformanceTestScreen (50-item stress test)          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  LatexRenderer.tsx                                           │ │
│  │    ├── LaTeX validation (brace matching, incomplete cmds)   │ │
│  │    ├── React.memo() for performance                         │ │
│  │    └── requireNativeComponent('NativeLatexView')            │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                    React Native Bridge
                               │
┌──────────────────────────────┴──────────────────────────────────┐
│                        Native Android (Java)                     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  LatexPackage.java                                           │ │
│  │    └── Registers LatexViewManager with React Native         │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  LatexViewManager.java                                       │ │
│  │    ├── @ReactProp(name = "latex")                           │ │
│  │    ├── @ReactProp(name = "fontSize")                        │ │
│  │    └── @ReactProp(name = "textColor")                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  NativeLatexView.java                                        │ │
│  │    ├── HorizontalScrollView wrapper                         │ │
│  │    ├── MTMathView (AndroidMath library)                     │ │
│  │    ├── Error TextView (fallback UI)                         │ │
│  │    └── Custom onMeasure() for React Native Fabric           │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  AndroidMath (MTMathView)                                    │ │
│  │    └── Renders LaTeX → Native Android View                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

<!-- ### Component Breakdown

#### Native Layer (Java)

| File | Purpose |
|------|---------|
| `NativeLatexView.java` | Custom FrameLayout wrapping MTMathView with HorizontalScrollView, error handling, and proper measurement for React Native's Yoga layout system |
| `LatexViewManager.java` | React Native ViewManager exposing native view with `@ReactProp` annotations |
| `LatexPackage.java` | Package registration for React Native's module system |

#### React Native Layer (TypeScript)

| File | Purpose |
|------|---------|
| `LatexRenderer.tsx` | Main component using `requireNativeComponent`, includes validation and memoization |
| `App.tsx` | Main app with test cases, playground, and content parsing |
| `PerformanceTestScreen.tsx` | 50-item FlatList for performance testing | -->

### Data Flow

```
1. User enters: "The formula is $E = mc^2$"
           │
           ▼
2. App.tsx parseContent() extracts LaTeX:
   - Text: "The formula is "
   - LaTeX: "E = mc^2" (inline)
           │
           ▼
3. LatexRenderer.tsx:
   - Validates LaTeX syntax
   - Cleans delimiters ($, $$, \[, \])
   - Passes to NativeLatexView via Bridge
           │
           ▼
4. LatexViewManager.java:
   - Receives props via @ReactProp
   - Calls setLatex(), setFontSize(), setTextColor()
           │
           ▼
5. NativeLatexView.java:
   - Queues rendering if not attached
   - Renders via MTMathView
   - Handles errors with fallback UI
   - Reports dimensions to Yoga
           │
           ▼
6. MTMathView renders LaTeX natively
```

---

<!-- <!--
## 🔧 Technical Decisions

### Why AndroidMath (MTMathView)?

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **AndroidMath** ✓ | Native rendering, no WebView, good LaTeX coverage, open source | Android only | **Selected** |
| KaTeX | Fast, widely used | Requires WebView on mobile | Not used |
| MathJax | Full LaTeX support | Slow, requires WebView | Not used |
| JLaTeXMath | Pure Java | More complex integration | Not used |

**Rationale**: AndroidMath provides direct native rendering with the `MTMathView` widget, eliminating WebView overhead entirely. It supports a wide range of LaTeX math commands and integrates well with React Native's view system.

### Why Native View Approach (vs Bitmap)?

| Approach | Pros | Cons |
|----------|------|------|
| **Native View** ✓ | Real-time rendering, proper scaling, interactive | More complex measurement |
| Bitmap | Simple caching, predictable size | File I/O, not scalable |

**Selected**: Native View because:
- Direct integration with Android's view system
- No file storage overhead
- Better quality at any font size
- Simpler memory management

### Why React Native Bridge (vs JSI)?

| Approach | Pros | Cons |
|----------|------|------|
| **Bridge** ✓ | Well documented, stable API, simpler setup | Async communication |
| JSI | Synchronous, faster | Complex setup, less documentation |

**Selected**: Bridge approach using `requireNativeComponent` because:
- More documentation and community support
- Sufficient performance for this use case
- Simpler maintenance -->

--- -->

## 🔗 Native ↔ React Native Boundary

### Bridge Communication

The native view is exposed to React Native using the standard ViewManager pattern:

```java
// LatexViewManager.java
public class LatexViewManager extends SimpleViewManager<NativeLatexView> {

    @ReactProp(name = "latex")
    public void setLatex(NativeLatexView view, String latex) {
        view.setLatex(latex);
    }

    @ReactProp(name = "fontSize", defaultFloat = 20f)
    public void setFontSize(NativeLatexView view, float fontSize) {
        view.setFontSize(fontSize);
    }

    @ReactProp(name = "textColor")
    public void setTextColor(NativeLatexView view, String color) {
        view.setTextColor(Color.parseColor(color));
    }
}
```

```typescript
// LatexRenderer.tsx
const NativeLatexView =
  requireNativeComponent<NativeLatexViewProps>('NativeLatexView');

<NativeLatexView
  latex={cleanLatex}
  fontSize={fontSize}
  textColor={textColor}
/>;
```

### View Lifecycle Handling

One key challenge was handling React Native Fabric's measurement timing:

```java
// NativeLatexView.java
@Override
protected void onAttachedToWindow() {
    super.onAttachedToWindow();
    isAttached = true;

    if (pendingLatex != null) {
        // Render queued LaTeX after view is attached
        handler.postDelayed(() -> renderLatex(pendingLatex), 100);
    }
}

public void setLatex(String latex) {
    if (!isAttached) {
        pendingLatex = latex;  // Queue for later
        return;
    }
    renderLatex(latex);
}
```

### Custom Measurement for Yoga

React Native uses Yoga for layout. We override `onMeasure()` to report correct dimensions:

```java
@Override
protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
    // Measure MTMathView with UNSPECIFIED to get natural size
    mathView.measure(
        MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED),
        MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED)
    );

    int mathWidth = mathView.getMeasuredWidth();
    int mathHeight = mathView.getMeasuredHeight();

    // Report dimensions to Yoga layout system
    setMeasuredDimension(
        resolveSize(mathWidth, widthMeasureSpec),
        resolveSize(mathHeight, heightMeasureSpec)
    );
}
```

---

## ⚡ Performance Considerations

### Optimizations Implemented

| Optimization               | Implementation                                               | Impact                                 |
| -------------------------- | ------------------------------------------------------------ | -------------------------------------- |
| **React.memo()**           | Wraps LatexRenderer component                                | Prevents unnecessary re-renders        |
| **minHeight/minWidth**     | Calculated from fontSize and content length                  | Reserves space before render completes |
| **FlatList Optimizations** | `removeClippedSubviews`, `maxToRenderPerBatch`, `windowSize` | Smooth scrolling with many items       |
| **Pending LaTeX Queue**    | Queues rendering until view is attached                      | Prevents race conditions               |
| **postDelayed Rendering**  | 100ms delay after attachment                                 | Ensures view hierarchy is ready        |

### FlatList Configuration

```typescript
<FlatList
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
  initialNumToRender={5}
/>
```

### Performance Results

| Metric                 | Result                         |
| ---------------------- | ------------------------------ |
| Scroll Performance     | 60 FPS with 50 items           |
| Initial Render         | ~100-200ms per equation        |
| Re-render (same LaTeX) | Skipped (cached check)         |
| Memory Usage           | Stable with FlatList recycling |

---

## Trade-offs & Limitations

### Architectural Trade-offs

| Decision              | What We Chose        | What We Sacrificed    | Why                                     |
| --------------------- | -------------------- | --------------------- | --------------------------------------- |
| Native View vs Bitmap | Native View          | Simpler caching       | Better quality and real-time rendering  |
| Bridge vs JSI         | Bridge               | Sync communication    | Simpler implementation, sufficient perf |
| Single Library        | AndroidMath          | Broader LaTeX support | Good balance of features and simplicity |
| Horizontal Scroll     | HorizontalScrollView | Fixed-width layout    | Long equations remain usable            |

### Known Limitations

| Limitation              | Impact                               | Potential Solution                            |
| ----------------------- | ------------------------------------ | --------------------------------------------- |
| **Android Only**        | No iOS support                       | Would need iOS native module with iosMath     |
| **LaTeX Coverage**      | Some advanced commands not supported | MTMathView limitation                         |
| **Horizontal Overflow** | Long equations require scrolling     | By design for usability                       |
| **Render Timing**       | 100ms delay for reliability          | Could optimize with better lifecycle handling |

---

## 🛠️ Setup & Installation

### Prerequisites

- Node.js >= 20
- React Native development environment
- Android Studio
- JDK 11+

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/Parth10P/LatexRenderer.git
cd LatexRenderer

# 2. Install dependencies
npm install

# 3. Run on Android
npm run android
```

### Build Release APK

```bash
cd android
./gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

---

<!-- ### Display vs Inline Mode

- **Inline**: `$...$` - Smaller, flows with text
- **Display**: `$$...$$` - Larger, centered on own line -->

---

## Error Handling

### Validation (JavaScript Side)

```typescript
const validateLatex = (latex: string): string | null => {
  // Check brace matching
  let braceCount = 0;
  for (const char of latex) {
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    if (braceCount < 0) return 'Mismatched braces';
  }

  // Check incomplete commands
  if (/\\frac\s*$/.test(latex)) return 'Incomplete \\frac';

  return null; // Valid
};
```

### Native Error Handling

```java
try {
    mathView.setLatex(latex);
    scrollView.setVisibility(VISIBLE);
    errorView.setVisibility(GONE);
} catch (Exception e) {
    errorView.setText("⚠️ LaTeX Error: " + e.getMessage());
    errorView.setVisibility(VISIBLE);
    scrollView.setVisibility(GONE);
}
```

### Fallback UI

Invalid LaTeX displays a warning banner instead of crashing:

```
┌──────────────────────────────────────┐
│ ⚠️ Error: Mismatched braces         │
└──────────────────────────────────────┘
```

---

## Dependencies

### Native (Android)

| Dependency  | Version | Purpose                        |
| ----------- | ------- | ------------------------------ |
| AndroidMath | v1.1.0  | LaTeX rendering via MTMathView |

### JavaScript

| Dependency   | Version | Purpose          |
| ------------ | ------- | ---------------- |
| react        | 19.2.0  | UI framework     |
| react-native | 0.83.1  | Mobile framework |
| typescript   | 5.8.3   | Type safety      |

---

## Project Structure

```
LatexRenderer/
├── android/
│   └── app/
│       ├── build.gradle              # AndroidMath dependency
│       └── src/main/java/com/latexrenderer/
│           ├── latex/
│           │   ├── NativeLatexView.java    # Custom view
│           │   ├── LatexViewManager.java   # ViewManager
│           │   └── LatexPackage.java       # Package registration
│           ├── MainActivity.kt
│           └── MainApplication.kt
├── src/
│   └── components/
│       ├── LatexRenderer.tsx         # Main component
│       ├── LaTeXView.tsx             # Alternative view
│       └── PerformanceTestScreen.tsx # 50-item test
├── App.tsx                           # Main app with test cases
├── package.json
└── README.md
```

---

