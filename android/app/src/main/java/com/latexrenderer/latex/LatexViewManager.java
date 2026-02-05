package com.latexrenderer.latex;

import android.graphics.Color;
import android.util.Log;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.agog.mathdisplay.MTMathView;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.yoga.YogaMeasureFunction;
import com.facebook.yoga.YogaMeasureMode;
import com.facebook.yoga.YogaMeasureOutput;
import com.facebook.yoga.YogaNode;

/**
 * LatexViewManager - React Native ViewManager for MTMathView.
 * 
 * This exposes the AndroidMath MTMathView directly to React Native
 * with proper measurement for Yoga layout system.
 */
public class LatexViewManager extends SimpleViewManager<NativeLatexView> {
    
    private static final String TAG = "LatexViewManager";
    public static final String REACT_CLASS = "NativeLatexView";
    
    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }
    
    @NonNull
    @Override
    protected NativeLatexView createViewInstance(@NonNull ThemedReactContext reactContext) {
        Log.d(TAG, "Creating NativeLatexView instance");
        return new NativeLatexView(reactContext);
    }
    
    /**
     * Set the LaTeX string to render.
     */
    @ReactProp(name = "latex")
    public void setLatex(NativeLatexView view, @Nullable String latex) {
        Log.d(TAG, "setLatex: " + latex);
        view.setLatex(latex);
    }
    
    /**
     * Set the font size for rendering.
     */
    @ReactProp(name = "fontSize", defaultFloat = 20f)
    public void setFontSize(NativeLatexView view, float fontSize) {
        Log.d(TAG, "setFontSize: " + fontSize);
        view.setFontSize(fontSize);
    }
    
    /**
     * Set the text color.
     * Accepts a color string (e.g., "#000000" or "black").
     */
    @ReactProp(name = "textColor")
    public void setTextColor(NativeLatexView view, @Nullable String color) {
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
    }
}
