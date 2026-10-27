package com.billdna.mobile;

import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup.MarginLayoutParams;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WaSharePlugin.class);
        super.onCreate(savedInstanceState);
        // Same behaviour on every Android version: draw edge to edge, then keep the app view
        // between the status bar and either the navigation bar or the keyboard, whichever is taller.
        // This makes the app shrink above the keypad instead of the keypad covering it.
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        WindowInsetsControllerCompat wc = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        wc.setAppearanceLightStatusBars(true);
        wc.setAppearanceLightNavigationBars(true);
        getWindow().getDecorView().setBackgroundColor(0xFFF6F5F2);
        final View web = getBridge().getWebView();
        ViewCompat.setOnApplyWindowInsetsListener(web, (v, insets) -> {
            Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            Insets ime = insets.getInsets(WindowInsetsCompat.Type.ime());
            MarginLayoutParams mlp = (MarginLayoutParams) v.getLayoutParams();
            mlp.leftMargin = bars.left;
            mlp.rightMargin = bars.right;
            mlp.topMargin = bars.top;
            mlp.bottomMargin = Math.max(bars.bottom, ime.bottom);
            v.setLayoutParams(mlp);
            return WindowInsetsCompat.CONSUMED;
        });
        ViewCompat.requestApplyInsets(web);
    }
}
