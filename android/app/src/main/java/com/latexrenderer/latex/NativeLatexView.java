package com.latexrenderer.latex;

import android.content.Context;
import android.graphics.Color;
import android.os.Handler;
import android.os.Looper;
import android.util.AttributeSet;
import android.util.Log;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.HorizontalScrollView;
import android.widget.TextView;

import com.agog.mathdisplay.MTMathView;

/**
 * NativeLatexView - Custom Android View for rendering LaTeX equations.
 * 
 * This view wraps MTMathView from AndroidMath library and provides:
 * - Direct native LaTeX rendering (no WebView)
 * - Error handling for invalid LaTeX (displays red error text)
 * - Horizontal scrolling for long equations
 * - Responsive layout with proper measurement
 */
public class NativeLatexView extends FrameLayout {
    
    private static final String TAG = "NativeLatexView";
    
    private final Handler handler = new Handler(Looper.getMainLooper());
    
    private HorizontalScrollView scrollView;
    
    private MTMathView mathView;
    
    private TextView errorView;
    
    private String latexString = "";
    private float fontSize = 20f;
    private int textColor = Color.BLACK;
    private boolean hasError = false;
    private boolean isAttached = false;
    private String pendingLatex = null;
    
    public NativeLatexView(Context context) {
        super(context);
        init(context);
    }
    
    public NativeLatexView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init(context);
    }
    
    public NativeLatexView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init(context);
    }
    
    private void init(Context context) {
        Log.d(TAG, "Initializing NativeLatexView");
        
        scrollView = new HorizontalScrollView(context);
        scrollView.setHorizontalScrollBarEnabled(true);
        scrollView.setFillViewport(false);
        FrameLayout.LayoutParams scrollParams = new FrameLayout.LayoutParams(
            LayoutParams.MATCH_PARENT,
            LayoutParams.WRAP_CONTENT
        );
        scrollView.setLayoutParams(scrollParams);
        
        scrollView.setOnTouchListener((v, event) -> {
            int action = event.getAction();
            if (action == android.view.MotionEvent.ACTION_DOWN || 
                action == android.view.MotionEvent.ACTION_MOVE) {
                v.getParent().requestDisallowInterceptTouchEvent(true);
            } else if (action == android.view.MotionEvent.ACTION_UP || 
                       action == android.view.MotionEvent.ACTION_CANCEL) {
                v.getParent().requestDisallowInterceptTouchEvent(false);
            }
            return false;
        });
        
        mathView = new MTMathView(context);
        HorizontalScrollView.LayoutParams mathParams = new HorizontalScrollView.LayoutParams(
            LayoutParams.WRAP_CONTENT,
            LayoutParams.WRAP_CONTENT
        );
        mathView.setLayoutParams(mathParams);
        mathView.setFontSize(fontSize);
        
        scrollView.addView(mathView);
        addView(scrollView);
        
        errorView = new TextView(context);
        errorView.setTextColor(Color.parseColor("#856404"));
        errorView.setTextSize(14f);
        errorView.setVisibility(GONE);
        
        android.graphics.drawable.GradientDrawable background = new android.graphics.drawable.GradientDrawable();
        background.setColor(Color.parseColor("#FFF3CD"));
        background.setCornerRadius(dpToPx(8));
        background.setStroke(dpToPx(1), Color.parseColor("#FFECB5"));
        errorView.setBackground(background);
        
        int padding = dpToPx(12);
        errorView.setPadding(padding, padding, padding, padding);
        
        errorView.setLayoutParams(new FrameLayout.LayoutParams(
            LayoutParams.WRAP_CONTENT,
            LayoutParams.WRAP_CONTENT
        ));
        addView(errorView);
    }
    
    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        isAttached = true;
        Log.d(TAG, "onAttachedToWindow, pendingLatex: " + pendingLatex + ", latexString: " + latexString);
        
        if (pendingLatex != null && !pendingLatex.isEmpty()) {
            final String latex = pendingLatex;
            pendingLatex = null;
            // Use postDelayed to ensure the view hierarchy is fully ready
            handler.postDelayed(() -> {
                Log.d(TAG, "Rendering pending latex: " + latex);
                this.latexString = ""; // Clear to force re-render
                renderLatex(latex);
            }, 100);
        } else if (!latexString.isEmpty()) {
            // Re-render existing latex when view is re-attached
            final String latex = latexString;
            handler.postDelayed(() -> {
                Log.d(TAG, "Re-rendering existing latex: " + latex);
                this.latexString = ""; // Clear to force re-render
                renderLatex(latex);
            }, 100);
        }
    }
    
    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        isAttached = false;
        Log.d(TAG, "onDetachedFromWindow");
    }
    
    public void setLatex(String latex) {
        if (latex == null) {
            latex = "";
        }
        
        Log.d(TAG, "setLatex called with: " + latex + ", isAttached: " + isAttached);
        
        if (!isAttached) {
            Log.d(TAG, "Not attached yet, queuing latex");
            pendingLatex = latex;
            return;
        }
        
        renderLatex(latex);
    }
    
    private void renderLatex(String latex) {
        if (latex == null) {
            latex = "";
        }
        
        Log.d(TAG, "renderLatex: " + latex);
        
        if (latex.equals(this.latexString) && !latex.isEmpty()) {
            Log.d(TAG, "Same latex, skipping");
            return;
        }
        
        this.latexString = latex;
        this.hasError = false;
        
        if (latex.isEmpty()) {
            scrollView.setVisibility(GONE);
            errorView.setVisibility(GONE);
            return;
        }
        
        final String finalLatex = latex;
        
        try {
            Log.d(TAG, "Rendering latex: " + finalLatex);
            
            // Set properties first
            mathView.setTextColor(textColor);
            mathView.setFontSize(fontSize);
            
            // Set the latex content
            mathView.setLatex(finalLatex);
            
            // Make visible
            scrollView.setVisibility(VISIBLE);
            errorView.setVisibility(GONE);
            
            Log.d(TAG, "MTMathView getLatex() immediately after set: '" + mathView.getLatex() + "'");
            
            // Force measure and layout of mathView
            int widthSpec = MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED);
            int heightSpec = MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED);
            mathView.measure(widthSpec, heightSpec);
            
            int mathWidth = mathView.getMeasuredWidth();
            int mathHeight = mathView.getMeasuredHeight();
            
            Log.d(TAG, "MTMathView after measure: " + mathWidth + "x" + mathHeight);
            
            // Layout the mathView with the measured dimensions
            mathView.layout(0, 0, mathWidth, mathHeight);
            
            // Force scrollView to layout
            scrollView.measure(
                MeasureSpec.makeMeasureSpec(getWidth() > 0 ? getWidth() : mathWidth, MeasureSpec.AT_MOST),
                MeasureSpec.makeMeasureSpec(mathHeight, MeasureSpec.EXACTLY)
            );
            scrollView.layout(0, 0, scrollView.getMeasuredWidth(), mathHeight);
            
            // Request layout updates for React Native
            mathView.requestLayout();
            mathView.invalidate();
            scrollView.requestLayout();
            
            // This is crucial for React Native - we need to set a minimum height
            // to force the view to be visible
            setMinimumHeight(mathHeight);
            setMinimumWidth(Math.min(mathWidth, getWidth() > 0 ? getWidth() : mathWidth));
            
            // Request a new layout pass
            requestLayout();
            invalidate();
            
            // Use forceLayout to ensure the view is remeasured
            forceLayout();
            
            Log.d(TAG, "After layout - mathView: " + mathView.getWidth() + "x" + mathView.getHeight() + 
                       ", this view min: " + getMinimumWidth() + "x" + getMinimumHeight());
            
        } catch (Exception e) {
            Log.e(TAG, "Error rendering latex: " + e.getMessage(), e);
            
            hasError = true;
            String errorMsg = "⚠️ LaTeX Error";
            if (e.getMessage() != null && !e.getMessage().isEmpty()) {
                errorMsg = "⚠️ Error: " + e.getMessage();
            }
            
            errorView.setText(errorMsg);
            errorView.setVisibility(VISIBLE);
            scrollView.setVisibility(GONE);
            
            errorView.requestLayout();
        }
    }
    
    public void setFontSize(float size) {
        Log.d(TAG, "setFontSize: " + size);
        this.fontSize = size;
        if (mathView != null) {
            mathView.setFontSize(size);
            // Re-render if we have latex content
            if (!latexString.isEmpty()) {
                mathView.setLatex(latexString);
                mathView.requestLayout();
                mathView.invalidate();
            }
        }
    }
    
    public void setTextColor(int color) {
        Log.d(TAG, "setTextColor: " + color);
        this.textColor = color;
        if (mathView != null) {
            mathView.setTextColor(color);
            // Re-render if we have latex content
            if (!latexString.isEmpty()) {
                mathView.setLatex(latexString);
                mathView.requestLayout();
                mathView.invalidate();
            }
        }
    }
    
    private int dpToPx(int dp) {
        float density = getResources().getDisplayMetrics().density;
        return Math.round(dp * density);
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        // Measure children first
        int widthMode = MeasureSpec.getMode(widthMeasureSpec);
        int heightMode = MeasureSpec.getMode(heightMeasureSpec);
        int widthSize = MeasureSpec.getSize(widthMeasureSpec);
        int heightSize = MeasureSpec.getSize(heightMeasureSpec);
        
        // Measure the mathView with UNSPECIFIED to get its natural size
        int childWidthSpec = MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED);
        int childHeightSpec = MeasureSpec.makeMeasureSpec(0, MeasureSpec.UNSPECIFIED);
        
        if (scrollView.getVisibility() == VISIBLE && mathView != null) {
            mathView.measure(childWidthSpec, childHeightSpec);
            scrollView.measure(
                MeasureSpec.makeMeasureSpec(widthSize, widthMode == MeasureSpec.EXACTLY ? MeasureSpec.EXACTLY : MeasureSpec.AT_MOST),
                MeasureSpec.makeMeasureSpec(mathView.getMeasuredHeight(), MeasureSpec.EXACTLY)
            );
        }
        
        if (errorView.getVisibility() == VISIBLE) {
            errorView.measure(childWidthSpec, childHeightSpec);
        }
        
        // Calculate final dimensions
        int measuredWidth;
        int measuredHeight;
        
        if (scrollView.getVisibility() == VISIBLE) {
            int mathWidth = mathView.getMeasuredWidth();
            int mathHeight = mathView.getMeasuredHeight();
            
            // If mathView hasn't rendered yet (size is 1x1) but we have pending latex,
            // estimate size based on latex content length and fontSize
            String latexToMeasure = (pendingLatex != null && !pendingLatex.isEmpty()) ? pendingLatex : latexString;
            if ((mathWidth <= 1 || mathHeight <= 1) && !latexToMeasure.isEmpty()) {
                mathHeight = Math.round(fontSize * 2.5f);
                // Estimate width: longer formulas need more space
                // Use approximately 0.6 * fontSize per character as a rough estimate
                mathWidth = Math.max(
                    Math.round(fontSize * 5), 
                    Math.round(latexToMeasure.length() * fontSize * 0.6f)
                );
            }
            
            // For React Native, we should use our calculated width if the mode allows
            // If widthMode is AT_MOST, we can use up to widthSize
            // If widthMode is UNSPECIFIED, use our calculated width
            // If widthMode is EXACTLY, we must use widthSize
            if (widthMode == MeasureSpec.EXACTLY) {
                measuredWidth = widthSize;
            } else if (widthMode == MeasureSpec.AT_MOST) {
                measuredWidth = Math.min(mathWidth, widthSize);
            } else {
                // UNSPECIFIED - use our calculated width
                measuredWidth = mathWidth;
            }
            measuredHeight = mathHeight;
            
            Log.d(TAG, "onMeasure calculation - widthMode=" + widthMode + " widthSize=" + widthSize + 
                       " mathWidth=" + mathWidth + " measuredWidth=" + measuredWidth);
        } else if (errorView.getVisibility() == VISIBLE) {
            measuredWidth = errorView.getMeasuredWidth();
            measuredHeight = errorView.getMeasuredHeight();
        } else {
            measuredWidth = 0;
            measuredHeight = 0;
        }
        
        // Apply at least minimum size from setMinimumWidth/Height if set
        measuredWidth = Math.max(measuredWidth, getSuggestedMinimumWidth());
        measuredHeight = Math.max(measuredHeight, getSuggestedMinimumHeight());
        
        Log.d(TAG, "onMeasure - mathView measured: " + mathView.getMeasuredWidth() + "x" + mathView.getMeasuredHeight() +
                   ", final: " + measuredWidth + "x" + measuredHeight +
                   ", latex: '" + mathView.getLatex() + "'" +
                   ", pendingLatex: " + (pendingLatex != null ? pendingLatex : "null"));
        
        setMeasuredDimension(
            resolveSize(measuredWidth, widthMeasureSpec),
            resolveSize(measuredHeight, heightMeasureSpec)
        );
    }
    
    @Override
    protected void onLayout(boolean changed, int left, int top, int right, int bottom) {
        super.onLayout(changed, left, top, right, bottom);
        Log.d(TAG, "onLayout - final size: " + (right - left) + "x" + (bottom - top));
    }
}
