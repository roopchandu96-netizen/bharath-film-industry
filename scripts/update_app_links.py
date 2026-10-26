import re

# 1. Update App.tsx
with open('App.tsx', 'r', encoding='utf-8') as f:
    app_code = f.read()

old_get_route = """  // Clean URL helper: Extracts path and strips any hash symbol automatically
  const getRouteFromUrl = (): string => {
    if (window.location.hash) {
      const hashClean = window.location.hash.replace(/^#\\/?/, '').toLowerCase();
      if (hashClean) {
        const cleanPath = (hashClean === 'explore' || hashClean === 'booking') ? '/' : `/${hashClean}`;
        window.history.replaceState(null, '', cleanPath);
        return hashClean;
      } else {
        window.history.replaceState(null, '', '/');
      }
    }
    const path = window.location.pathname.replace(/^\\/|\\/$/g, '').toLowerCase();
    return path || '';
  };"""

new_get_route = """  // Clean URL helper: Extracts path and strips any hash symbol automatically
  const getRouteFromUrl = (): string => {
    let clean = '';
    if (window.location.hash) {
      const hashClean = window.location.hash.replace(/^#\\/?/, '').toLowerCase();
      if (hashClean) {
        clean = hashClean;
        const cleanPath = (clean === 'explore' || clean === 'booking') ? '/' : `/${clean}`;
        window.history.replaceState(null, '', cleanPath);
      } else {
        window.history.replaceState(null, '', '/');
      }
    } else {
      clean = window.location.pathname.replace(/^\\/|\\/$/g, '').toLowerCase();
    }
    // Normalize aliases so both clean and legacy routes work seamlessly
    if (clean === 'privacy-policy' || clean === 'privacy-policy.html' || clean === 'privacy.html') return 'privacy';
    if (clean === 'terms-of-service' || clean === 'terms-of-service.html' || clean === 'terms.html') return 'terms';
    if (clean === 'delete-account' || clean === 'delete-account.html' || clean === 'data-deletion.html') return 'data-deletion';
    return clean || '';
  };"""

# Replace normalizing CRLF/LF
app_code_norm = app_code.replace('\r\n', '\n')
old_get_route_norm = old_get_route.replace('\r\n', '\n')
new_get_route_norm = new_get_route.replace('\r\n', '\n')

if old_get_route_norm in app_code_norm:
    app_code_norm = app_code_norm.replace(old_get_route_norm, new_get_route_norm)
    print("Replaced getRouteFromUrl in App.tsx")
else:
    print("Warning: old_get_route not found in App.tsx")

# Replace links in App.tsx
app_code_norm = app_code_norm.replace('href="/terms-of-service"', 'href="/terms"')
app_code_norm = app_code_norm.replace('href="/privacy-policy"', 'href="/privacy"')
app_code_norm = app_code_norm.replace('href="/delete-account"', 'href="/data-deletion"')

with open('App.tsx', 'w', encoding='utf-8', newline='') as f:
    f.write(app_code_norm)
print("Updated App.tsx")

# 2. Update components/Layout.tsx
with open('components/Layout.tsx', 'r', encoding='utf-8') as f:
    layout_code = f.read()

layout_code = layout_code.replace('href="/terms-of-service"', 'href="/terms"')
layout_code = layout_code.replace('href="/privacy-policy"', 'href="/privacy"')
layout_code = layout_code.replace('href="/delete-account"', 'href="/data-deletion"')

with open('components/Layout.tsx', 'w', encoding='utf-8', newline='') as f:
    f.write(layout_code)
print("Updated components/Layout.tsx")

# 3. Update views/AuthView.tsx
with open('views/AuthView.tsx', 'r', encoding='utf-8') as f:
    auth_code = f.read()

auth_code = auth_code.replace('https://www.bfiiy.com/terms-of-service', 'https://www.bfiiy.com/terms')
auth_code = auth_code.replace('https://www.bfiiy.com/privacy-policy', 'https://www.bfiiy.com/privacy')
auth_code = auth_code.replace('https://www.bfiiy.com/delete-account', 'https://www.bfiiy.com/data-deletion')

with open('views/AuthView.tsx', 'w', encoding='utf-8', newline='') as f:
    f.write(auth_code)
print("Updated views/AuthView.tsx")

# 4. Update views/mobile/MobileAuthView.tsx
with open('views/mobile/MobileAuthView.tsx', 'r', encoding='utf-8') as f:
    m_auth_code = f.read()

m_auth_code = m_auth_code.replace('https://www.bfiiy.com/terms-of-service', 'https://www.bfiiy.com/terms')
m_auth_code = m_auth_code.replace('https://www.bfiiy.com/privacy-policy', 'https://www.bfiiy.com/privacy')
m_auth_code = m_auth_code.replace('https://www.bfiiy.com/delete-account', 'https://www.bfiiy.com/data-deletion')

with open('views/mobile/MobileAuthView.tsx', 'w', encoding='utf-8', newline='') as f:
    f.write(m_auth_code)
print("Updated views/mobile/MobileAuthView.tsx")

# 5. Update views/ProfileView.tsx
with open('views/ProfileView.tsx', 'r', encoding='utf-8') as f:
    prof_code = f.read()

prof_code = prof_code.replace('https://www.bfiiy.com/terms-of-service', 'https://www.bfiiy.com/terms')
prof_code = prof_code.replace('https://www.bfiiy.com/privacy-policy', 'https://www.bfiiy.com/privacy')
prof_code = prof_code.replace('https://www.bfiiy.com/delete-account', 'https://www.bfiiy.com/data-deletion')

with open('views/ProfileView.tsx', 'w', encoding='utf-8', newline='') as f:
    f.write(prof_code)
print("Updated views/ProfileView.tsx")

# 6. Update views/PrivacyView.tsx
with open('views/PrivacyView.tsx', 'r', encoding='utf-8') as f:
    privacy_code = f.read()

privacy_code = privacy_code.replace('https://www.bfiiy.com/privacy-policy', 'https://www.bfiiy.com/privacy')
privacy_code = privacy_code.replace('https://www.bfiiy.com/delete-account', 'https://www.bfiiy.com/data-deletion')

with open('views/PrivacyView.tsx', 'w', encoding='utf-8', newline='') as f:
    f.write(privacy_code)
print("Updated views/PrivacyView.tsx")
