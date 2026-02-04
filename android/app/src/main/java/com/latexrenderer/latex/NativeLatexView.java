package com.latexrenderer.latex;

import android.content.Context;
import android.graphics.Color;
import android.os.Handler;
import android.os.Looper;
import android.util.AttributeSet;
import android.util.Log;
import android.widget.FrameLayout;
import android.widget.TextView;

import com.agog.mathdisplay.MTMathView;

/**
 * NativeLatexView - Custom Android View for rendering LaTeX equations.
 * 
 * This view wraps MTMathView from AndroidMath library and provides:
 * - Direct native LaTeX rendering (no WebView)
 * - Error handling for invalid LaTeX (displays red error text)
 * - Responsive layout with proper measurement
 */
public class NativeLatexView extends FrameLayout {
    
    private static final String TAG = "NativeLatexView";
    
    // Handler for posting UI updates
    private final Handler handler = new Handler(Looper.getMainLooper());
    
    // Internal MTMathView for rendering
    private MTMathView mathView;
    
    // Error text view for invalid LaTeX
    private TextView errorView;
    
    // Current state
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
        
        // Initialize MTMathView for rendering  
        mathView = new MTMathView(context);
        FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(
            LayoutParams.MATCH_PARENT,
            LayoutParams.WRAP_CONTENT
        );
        mathView.setLayoutParams(params);
        // Set default font size
        mathView.setFontSize(fontSize);
        addView(mathView);
        
        // Initialize error text view
        errorView = new TextView(context);
        errorView.setTextColor(Color.RED);
        errorView.setTextSize(14f);
        errorView.setVisibility(GONE);
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
        Log.d(TAG, "onAttachedToWindow");
        
        // If there's pending latex, render it now
        if (pendingLatex != null) {
            final String latex = pendingLatex;
            pendingLatex = null;
            // Use postDelayed to ensure view is fully ready
            handler.postDelayed(() -> {
                this.latexString = ""; // Reset to force re-render
                setLatex(latex);
            }, 50);
        }
    }
    
    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        isAttached = false;
    }
    
    /**
     * Set the LaTeX string to render.
     */
    public void setLatex(String latex) {
        if (latex == null) {
            latex = "";
        }
        
        Log.d(TAG, "setLatex called with: " + latex);
        
        // If not attached yet, queue the latex for later
        if (!isAttached) {
            Log.d(TAG, "Not attached yet, queuing latex");
            pendingLatex = latex;
            return;
        }
        
        // Skip if same latex
        if (latex.equals(this.latexString)) {
            Log.d(TAG, "Same latex, skipping");
            return;
        }
        
        this.latexString = latex;
        this.hasError = false;
        
        if (latex.isEmpty()) {
            mathView.setVisibility(GONE);
            errorView.setVisibility(GONE);
            return;
        }
        
        try {
            Log.d(TAG, "Rendering latex: " + latex);
            
            // Configure MTMathView - order matters!
            mathView.setTextColor(textColor);
            mathView.setFontSize(fontSize);
            
            // Set the LaTeX - important to set this AFTER config
            mathView.setLatex(latex);
            
            // Show math view, hide error
            mathView.setVisibility(VISIBLE);
            errorView.setVisibility(GONE);
            
            Log.d(TAG, "MTMathView getLatex(): '" + mathView.getLatex() + "'");
            
            // Force a complete re-layout
            mathView.requestLayout();
            mathView.invalidate();
            requestLayout();
            invalidate();
            
            // Double check after layout
            handler.postDelayed(() -> {
                Log.d(TAG, "After delay - mathView: " + 
                           "size=" + mathView.getWidth() + "x" + mathView.getHeight() +
                           ", measured=" + mathView.getMeasuredWidth() + "x" + mathView.getMeasuredHeight() +
                           ", visibility=" + mathView.getVisibility());
            }, 200);
            
        } catch (Exception e) {
            Log.e(TAG, "Error rendering latex: " + e.getMessage(), e);
            
            // Handle rendering error - show error message
            hasError = true;
            String errorMsg = "LaTeX Error";
            if (e.getMessage() != null && !e.getMessage().isEmpty()) {
                errorMsg = "Error: " + e.getMessage();
            }
            
            errorView.setText(errorMsg);
            errorView.setVisibility(VISIBLE);
            mathView.setVisibility(GONE);
        }
    }
    
    /**
     * Set the font size for rendering.
     */
    public void setFontSize(float size) {
        Log.d(TAG, "setFontSize: " + size);
        if (this.fontSize != size) {
            this.fontSize = size;
            if (mathView != null) {
                mathView.setFontSize(size);
            }
            // Re-render
            if (isAttached && !latexString.isEmpty()) {
                String current = this.latexString;
                this.latexString = "";
                setLatex(current);
            }
        }
    }
    
    /**
     * Set the text color.
     */
    public void setTextColor(int color) {
        Log.d(TAG, "setTextColor: " + color);
        if (this.textColor != color) {
            this.textColor = color;
            if (mathView != null) {
                mathView.setTextColor(color);
            }
            // Re-render
            if (isAttached && !latexString.isEmpty()) {
                String current = this.latexString;
                this.latexString = "";
                setLatex(current);
            }
        }
    }
    
    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        Log.d(TAG, "onMeasure - mathView measured: " + mathView.getMeasuredWidth() + "x" + mathView.getMeasuredHeight() +
                   ", latex: '" + mathView.getLatex() + "'");
    }
}
