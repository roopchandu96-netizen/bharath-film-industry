# Add project specific ProGuard / R8 rules here.

-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keepattributes JavascriptInterface

# Keep Capacitor Core & Plugins
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin { *; }
-keepclassmembers class * extends com.getcapacitor.Plugin {
    public <methods>;
}
-keep class * implements com.getcapacitor.PluginMethod { *; }

# Keep WebKit JavaScript Interfaces
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Google Mobile Ads (AdMob)
-keep class com.google.android.gms.ads.** { *; }
-keep interface com.google.android.gms.ads.** { *; }
-keep class com.google.ads.** { *; }

# Keep App Classes
-keep class com.bharatfilmindustry.app1.** { *; }
