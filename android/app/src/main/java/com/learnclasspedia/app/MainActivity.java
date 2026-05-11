package com.learnclasspedia.app;

import android.os.Bundle;
import android.webkit.WebView;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);

        // Smoothness: Set WebView background to match splash to avoid white flashes
        // and enable hardware acceleration optimization if needed.
        WebView webView = getBridge().getWebView();
        webView.setBackgroundColor(android.graphics.Color.TRANSPARENT);
        webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
    }
}
