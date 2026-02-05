package com.latexrenderer.latex;

import android.content.Context;
import android.graphics.Color;
import android.os.Handler;
import android.os.Looper;
import android.util.AttributeSet;
import android.util.Log;
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
        Log.d(TAG, "onAttachedToWindow");
        
        if (pendingLatex != null) {
            final String latex = pendingLatex;
            pendingLatex = null;
            handler.postDelayed(() -> {
                this.latexString = "";
                setLatex(latex);
            }, 50);
        }
    }
    
    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        isAttached = false;
    }
    
    public void setLatex(String latex) {
        if (latex == null) {
            latex = "";
        }
        
        Log.d(TAG, "setLatex called with: " + latex);
        
        if (!isAttached) {
            Log.d(TAG, "Not attached yet, queuing latex");
            pendingLatex = latex;
            return;
        }
        
        if (latex.equals(this.latexString)) {
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
        
        try {
            Log.d(TAG, "Rendering latex: " + latex);
            
            mathView.setTextColor(textColor);
            mathView.setFontSize(fontSize);
            
            mathView.setLatex(latex);
            
            scrollView.setVisibility(VISIBLE);
            errorView.setVisibility(GONE);
            
            Log.d(TAG, "MTMathView getLatex(): '" + mathView.getLatex() + "'");
            
            mathView.requestLayout();
            mathView.invalidate();
            requestLayout();
            invalidate();
            
            handler.postDelayed(() -> {
                Log.d(TAG, "After delay - mathView: " + 
                           "size=" + mathView.getWidth() + "x" + mathView.getHeight() +
                           ", measured=" + mathView.getMeasuredWidth() + "x" + mathView.getMeasuredHeight() +
                           ", visibility=" + mathView.getVisibility());
            }, 200);
            
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
        if (this.fontSize != size) {
            this.fontSize = size;
            if (mathView != null) {
                mathView.setFontSize(size);
            }

            if (isAttached && !latexString.isEmpty()) {
                String current = this.latexString;
                this.latexString = "";
                setLatex(current);
            }
        }
    }
    
    public void setTextColor(int color) {
        Log.d(TAG, "setTextColor: " + color);
        if (this.textColor != color) {
            this.textColor = color;
            if (mathView != null) {
                mathView.setTextColor(color);
            }

            if (isAttached && !latexString.isEmpty()) {
                String current = this.latexString;
                this.latexString = "";
                setLatex(current);
            }
        }
    }
    
    private int dpToPx(int dp) {
        float density = getResources().getDisplayMetrics().density;
        return Math.round(dp * density);
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);
        Log.d(TAG, "onMeasure - mathView measured: " + mathView.getMeasuredWidth() + "x" + mathView.getMeasuredHeight() +
                   ", latex: '" + mathView.getLatex() + "'");
    }
}
