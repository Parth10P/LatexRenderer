package com.latexrenderer.latex;

import android.graphics.Color;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.agog.mathdisplay.MTMathView;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

/**
 * LatexViewManager - React Native ViewManager for MTMathView directly.
 * 
 * This exposes the AndroidMath MTMathView directly to React Native
 * without wrapping it in a custom view.
 */
public class LatexViewManager extends SimpleViewManager<MTMathView> {
    
    private static final String TAG = "LatexViewManager";
    public static final String REACT_CLASS = "NativeLatexView";
    
    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }
    
    @NonNull
    @Override
    protected MTMathView createViewInstance(@NonNull ThemedReactContext reactContext) {
        Log.d(TAG, "Creating MTMathView instance");
        MTMathView view = new MTMathView(reactContext);
        // Set default size
        view.setFontSize(20f);
        return view;
    }
    
    /**
     * Set the LaTeX string to render.
     */
    @ReactProp(name = "latex")
    public void setLatex(MTMathView view, @Nullable String latex) {
        Log.d(TAG, "setLatex: " + latex);
        if (latex != null && !latex.isEmpty()) {
            view.setLatex(latex);
            Log.d(TAG, "After setLatex, getLatex(): " + view.getLatex());
        } else {
            view.setLatex("");
        }
        view.requestLayout();
        view.invalidate();
    }
    
    /**
     * Set the font size for rendering.
     */
    @ReactProp(name = "fontSize", defaultFloat = 20f)
    public void setFontSize(MTMathView view, float fontSize) {
        Log.d(TAG, "setFontSize: " + fontSize);
        view.setFontSize(fontSize);
        view.requestLayout();
        view.invalidate();
    }
    
    /**
     * Set the text color.
     * Accepts a color string (e.g., "#000000" or "black").
     */
    @ReactProp(name = "textColor")
    public void setTextColor(MTMathView view, @Nullable String color) {
        Log.d(TAG, "setTextColor: " + color);
        if (color != null && !color.isEmpty()) {
            try {
                int parsedColor = Color.parseColor(color);
                view.setTextColor(parsedColor);
            } catch (IllegalArgumentException e) {
                view.setTextColor(Color.BLACK);
            }
        } else {
            view.setTextColor(Color.BLACK);
        }
        view.invalidate();
    }
}
