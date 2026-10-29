package com.bharatfilmindustry.app1;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
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
    // Production Ad Unit ID: ca-app-pub-4822446012346358/8221974989
    private static final String AD_UNIT_ID = "ca-app-pub-4822446012346358/8221974989";

    private AppOpenAd appOpenAd = null;
    private boolean isLoadingAd = false;
    private boolean isShowingAd = false;
    private long loadTime = 0;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        EdgeToEdge.enable(this);
        super.onCreate(savedInstanceState);

        // Initialize Google Mobile Ads SDK
        MobileAds.initialize(this, initializationStatus -> {
            Log.d(TAG, "Google Mobile Ads SDK Initialized.");
            // Load and attempt to show the App Open Ad on launch
            loadAppOpenAd(true);
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        // If an ad is available, show it; otherwise pre-load for next return
        if (isAdAvailable()) {
            showAdIfAvailable(this);
        } else {
            loadAppOpenAd(false);
        }
    }

    /**
     * Request an App Open ad.
     */
    public void loadAppOpenAd(boolean showWhenLoaded) {
        if (isLoadingAd || isAdAvailable()) {
            if (showWhenLoaded && isAdAvailable()) {
                showAdIfAvailable(this);
            }
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
                    Log.d(TAG, "App Open Ad loaded successfully.");
                    appOpenAd = ad;
                    isLoadingAd = false;
                    loadTime = (new Date()).getTime();
                    if (showWhenLoaded) {
                        showAdIfAvailable(MainActivity.this);
                    }
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
     * Check if ad exists and is not expired (less than 4 hours old).
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
     * Shows the ad if available.
     */
    public void showAdIfAvailable(@NonNull final Activity activity) {
        if (isShowingAd) {
            return;
        }

        if (!isAdAvailable()) {
            loadAppOpenAd(false);
            return;
        }

        appOpenAd.setFullScreenContentCallback(
            new FullScreenContentCallback() {
                @Override
                public void onAdDismissedFullScreenContent() {
                    Log.d(TAG, "App Open Ad dismissed.");
                    appOpenAd = null;
                    isShowingAd = false;
                    // Pre-load the next ad
                    loadAppOpenAd(false);
                }

                @Override
                public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                    Log.e(TAG, "App Open Ad failed to show: " + adError.getMessage());
                    appOpenAd = null;
                    isShowingAd = false;
                    loadAppOpenAd(false);
                }

                @Override
                public void onAdShowedFullScreenContent() {
                    Log.d(TAG, "App Open Ad showing full screen.");
                    isShowingAd = true;
                }
            }
        );

        isShowingAd = true;
        appOpenAd.show(activity);
    }
}
