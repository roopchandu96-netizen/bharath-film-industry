package com.bharatfilmindustry.app1;

import android.app.Activity;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import androidx.activity.EdgeToEdge;
import androidx.annotation.NonNull;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.appopen.AppOpenAd;
import java.util.Date;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "BFI_AdMob";
    // Production Ad Unit ID
    private static final String AD_UNIT_ID = "ca-app-pub-4822446012346358/8221974989";

    private AppOpenAd appOpenAd = null;
    private boolean isLoadingAd = false;
    private boolean isShowingAd = false;
    private long loadTime = 0;
    private long lastAdShownTimestamp = 0;

    // Minimum cooldown between App Open ads (at least 4 minutes to strictly comply with AdMob policy)
    private static final long AD_COOLDOWN_MS = 4 * 60 * 1000;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        setTheme(R.style.AppTheme_NoActionBar);
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);

        // Initialize Google Mobile Ads SDK without blocking startup
        MobileAds.initialize(this, initializationStatus -> {
            Log.d(TAG, "Google Mobile Ads SDK Initialized.");
            // Preload the ad in the background; do NOT interrupt cold launch
            loadAppOpenAd();
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        // Only show if the user is returning to the app and cooldown has passed
        long now = System.currentTimeMillis();
        if ((now - lastAdShownTimestamp) >= AD_COOLDOWN_MS) {
            if (isAdAvailable()) {
                showAdIfAvailable(this);
            } else {
                loadAppOpenAd();
            }
        }
    }

    /**
     * Preload App Open Ad silently in background
     */
    public void loadAppOpenAd() {
        if (isLoadingAd || isAdAvailable()) {
            return;
        }

        isLoadingAd = true;
        AdRequest request = new AdRequest.Builder().build();
        AppOpenAd.load(
            this,
            AD_UNIT_ID,
            request,
            new AppOpenAd.AppOpenAdLoadCallback() {
                @Override
                public void onAdLoaded(@NonNull AppOpenAd ad) {
                    Log.d(TAG, "App Open Ad cached successfully.");
                    appOpenAd = ad;
                    isLoadingAd = false;
                    loadTime = (new Date()).getTime();
                }

                @Override
                public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                    Log.e(TAG, "App Open Ad failed to load: " + loadAdError.getMessage());
                    isLoadingAd = false;
                    appOpenAd = null;
                }
            }
        );
    }

    /**
     * Check if ad exists and is valid (< 4 hours old)
     */
    private boolean isAdAvailable() {
        return appOpenAd != null && wasLoadTimeLessThanNHoursAgo(4);
    }

    private boolean wasLoadTimeLessThanNHoursAgo(long numHours) {
        long dateDifference = (new Date()).getTime() - this.loadTime;
        long numMilliSecondsPerHour = 3600000;
        return (dateDifference < (numMilliSecondsPerHour * numHours));
    }

    /**
     * Shows ad safely with full compliance
     */
    public void showAdIfAvailable(@NonNull final Activity activity) {
        if (isShowingAd || !isAdAvailable()) {
            loadAppOpenAd();
            return;
        }

        appOpenAd.setFullScreenContentCallback(
            new FullScreenContentCallback() {
                @Override
                public void onAdDismissedFullScreenContent() {
                    Log.d(TAG, "App Open Ad dismissed.");
                    appOpenAd = null;
                    isShowingAd = false;
                    lastAdShownTimestamp = System.currentTimeMillis();
                    // Preload next ad silently
                    loadAppOpenAd();
                }

                @Override
                public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                    Log.e(TAG, "App Open Ad failed to show: " + adError.getMessage());
                    appOpenAd = null;
                    isShowingAd = false;
                    loadAppOpenAd();
                }

                @Override
                public void onAdShowedFullScreenContent() {
                    Log.d(TAG, "App Open Ad displayed.");
                    isShowingAd = true;
                    lastAdShownTimestamp = System.currentTimeMillis();
                }
            }
        );

        isShowingAd = true;
        appOpenAd.show(activity);
    }
}
