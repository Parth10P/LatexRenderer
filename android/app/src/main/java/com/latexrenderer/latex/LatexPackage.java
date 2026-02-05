package com.latexrenderer.latex;

import androidx.annotation.NonNull;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * LatexPackage - React Native package for registering the LaTeX view manager.
 * 
 * This package needs to be added to the packages list in MainApplication.
 */
public class LatexPackage implements ReactPackage {
    
    @NonNull
    @Override
    public List<NativeModule> createNativeModules(@NonNull ReactApplicationContext reactContext) {

        return Collections.emptyList();
    }
    
    @NonNull
    @Override
    public List<ViewManager> createViewManagers(@NonNull ReactApplicationContext reactContext) {
        List<ViewManager> viewManagers = new ArrayList<>();
        viewManagers.add(new LatexViewManager());
        return viewManagers;
    }
}
