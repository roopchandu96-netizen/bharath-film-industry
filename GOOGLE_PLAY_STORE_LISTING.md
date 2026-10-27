# Google Play Store Listing & Metadata Compliance Guide

This document contains policy-compliant store listing metadata for the **Bharat Film Industry** app (`com.bharatfilmindustry.app1`), specifically structured to resolve the Google Play Console **Metadata Policy Violation** ("premier", ranking, or performance claims).

---

## 1. Identified Policy Violation & Reason

- **Violation**: Metadata policy (Claims about store performance, ranking, or awards).
- **Google's Flagged Evidence**: 
  > *"India's premier script investment marketplace and decentralized film production network."*
- **Why it was flagged**: Words like **"premier"**, **"best"**, **"#1"**, **"top"**, **"leading"**, or **"official"** are treated by Google Play automated and manual reviewers as unverified claims about ranking, store performance, or superiority.

---

## 2. Policy-Compliant Store Listing Metadata

Copy and paste the text below directly into your Google Play Console store listing fields.

### **App Name (Title)**
*(Limit: 30 characters)*
```text
Bharat Film Industry
```

---

### **Short Description**
*(Limit: 80 characters)*
```text
Explore film projects, connect with creators, and support Indian cinema.
```
*(Character count: 72 / 80)*

---

### **Full Description**
*(Limit: 4000 characters)*

```text
Welcome to Bharat Film Industry (BFI) — a digital platform connecting film enthusiasts, independent creators, and cinema supporters across India.

BFI provides a collaborative space to discover emerging cinema projects, follow production journeys from concept to screen, and participate in creative entertainment ventures.

Key Features:

• Discover Film Projects: Browse synopses, production timelines, and creative details of upcoming Indian feature films and independent cinema projects.
• Creator Hub: Directors and screenwriters can showcase project concepts, scripts, and production milestones to an engaged audience.
• Production Updates: Stay informed with real-time development updates, casting announcements, and behind-the-scenes progress.
• Community Participation: Engage with fellow cinema lovers, attend exclusive digital previews, and support creative storytelling.
• Transparent Records: Track project participation, supporter tiers, and official updates directly from your user dashboard.

Whether you are a filmmaker looking to bring your vision to life or a cinema enthusiast who loves being part of the creative process, Bharat Film Industry brings the world of Indian filmmaking closer to you.

---
Note: This application provides a platform for creative community participation, script discovery, and project networking. It does not offer financial guarantees or speculative return promises.
```

---

## 3. Checklist for Other Store Listing Assets

Google requires checking all store listing assets for similar violations. Verify that none of the following contain ranking or promotional claims:

1. **Screenshots & Promo Banners**:
   - Do NOT include text such as: *"#1 Film App"*, *"Best Script Platform"*, *"100% Guaranteed Return"*, *"5-Star Rated"*, or download statistics.
   - Screenshots should only display real in-app UI screens with clean, descriptive labels (e.g., "Browse Cinema Projects", "View Production Updates").

2. **App Icon**:
   - Must be your standard logo without badges like "New", "Top", "Free", or award stars.

3. **Developer Name**:
   - Must be your business or legal entity name, without ranking qualifiers.

---

## 4. How to Apply the Fix in Google Play Console

1. Open the [Google Play Console](https://play.google.com/console/).
2. Select your app: **Bharat Film Industry** (or navigate to Developer ID `7376948521792215626` / App ID `4972036266747548188`).
3. In the left navigation menu, go to **Grow** -> **Store presence** -> **Main store listing**.
4. Check if you have multiple languages enabled (e.g., **en-US**). Make sure you edit **English (United States)** or the default language.
5. In the **Full description** field, delete the line containing:
   `India's premier script investment marketplace and decentralized film production network.`
6. Paste the compliant **Short description** and **Full description** from Section 2 above.
7. Click **Save** at the bottom right.
8. Go to **Publishing overview** from the left-hand menu.
9. Click **Send changes for review** (or Submit changes).
   - *Note: If a release build was blocked solely due to this metadata issue, updating the store listing and sending for review will resume the review process.*
