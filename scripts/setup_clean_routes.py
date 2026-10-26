import os
import re

def update_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated {path}")

# 1. Base files
privacy_src = open('public/privacy-policy/index.html', 'r', encoding='utf-8').read()
terms_src = open('public/terms-of-service/index.html', 'r', encoding='utf-8').read()
delete_src = open('public/delete-account/index.html', 'r', encoding='utf-8').read()

# 2. Generate public/privacy/index.html
privacy_content = privacy_src
privacy_content = privacy_content.replace(
    '<link rel="canonical" href="https://www.bfiiy.com/privacy-policy" />',
    '<link rel="canonical" href="https://www.bfiiy.com/privacy" />'
)
privacy_content = privacy_content.replace('href="/terms-of-service"', 'href="/terms"')
privacy_content = privacy_content.replace('href="/privacy-policy"', 'href="/privacy"')
privacy_content = privacy_content.replace('href="/delete-account"', 'href="/data-deletion"')
privacy_content = privacy_content.replace('https://www.bfiiy.com/terms-of-service', 'https://www.bfiiy.com/terms')
privacy_content = privacy_content.replace('https://www.bfiiy.com/privacy-policy', 'https://www.bfiiy.com/privacy')
privacy_content = privacy_content.replace('https://www.bfiiy.com/delete-account', 'https://www.bfiiy.com/data-deletion')

os.makedirs('public/privacy', exist_ok=True)
with open('public/privacy/index.html', 'w', encoding='utf-8') as f:
    f.write(privacy_content)
with open('public/privacy.html', 'w', encoding='utf-8') as f:
    f.write(privacy_content)
print("Created public/privacy/index.html & public/privacy.html")

# 3. Generate public/terms/index.html
terms_content = terms_src
terms_content = terms_content.replace(
    '<link rel="canonical" href="https://www.bfiiy.com/terms-of-service" />',
    '<link rel="canonical" href="https://www.bfiiy.com/terms" />'
)
terms_content = terms_content.replace('href="/terms-of-service"', 'href="/terms"')
terms_content = terms_content.replace('href="/privacy-policy"', 'href="/privacy"')
terms_content = terms_content.replace('href="/delete-account"', 'href="/data-deletion"')
terms_content = terms_content.replace('https://www.bfiiy.com/terms-of-service', 'https://www.bfiiy.com/terms')
terms_content = terms_content.replace('https://www.bfiiy.com/privacy-policy', 'https://www.bfiiy.com/privacy')
terms_content = terms_content.replace('https://www.bfiiy.com/delete-account', 'https://www.bfiiy.com/data-deletion')

os.makedirs('public/terms', exist_ok=True)
with open('public/terms/index.html', 'w', encoding='utf-8') as f:
    f.write(terms_content)
with open('public/terms.html', 'w', encoding='utf-8') as f:
    f.write(terms_content)
print("Created public/terms/index.html & public/terms.html")

# 4. Generate public/data-deletion/index.html
delete_content = delete_src
delete_content = delete_content.replace(
    '<link rel="canonical" href="https://www.bfiiy.com/delete-account" />',
    '<link rel="canonical" href="https://www.bfiiy.com/data-deletion" />'
)
delete_content = delete_content.replace('href="/terms-of-service"', 'href="/terms"')
delete_content = delete_content.replace('href="/privacy-policy"', 'href="/privacy"')
delete_content = delete_content.replace('href="/delete-account"', 'href="/data-deletion"')
delete_content = delete_content.replace('https://www.bfiiy.com/terms-of-service', 'https://www.bfiiy.com/terms')
delete_content = delete_content.replace('https://www.bfiiy.com/privacy-policy', 'https://www.bfiiy.com/privacy')
delete_content = delete_content.replace('https://www.bfiiy.com/delete-account', 'https://www.bfiiy.com/data-deletion')

os.makedirs('public/data-deletion', exist_ok=True)
with open('public/data-deletion/index.html', 'w', encoding='utf-8') as f:
    f.write(delete_content)
with open('public/data-deletion.html', 'w', encoding='utf-8') as f:
    f.write(delete_content)
print("Created public/data-deletion/index.html & public/data-deletion.html")

# 5. Also update public/privacy-policy/index.html, terms-of-service, and delete-account
with open('public/privacy-policy/index.html', 'w', encoding='utf-8') as f:
    f.write(privacy_content.replace('https://www.bfiiy.com/privacy', 'https://www.bfiiy.com/privacy-policy'))
with open('public/privacy-policy.html', 'w', encoding='utf-8') as f:
    f.write(privacy_content.replace('https://www.bfiiy.com/privacy', 'https://www.bfiiy.com/privacy-policy'))

with open('public/terms-of-service/index.html', 'w', encoding='utf-8') as f:
    f.write(terms_content.replace('https://www.bfiiy.com/terms', 'https://www.bfiiy.com/terms-of-service'))
with open('public/terms-of-service.html', 'w', encoding='utf-8') as f:
    f.write(terms_content.replace('https://www.bfiiy.com/terms', 'https://www.bfiiy.com/terms-of-service'))

with open('public/delete-account/index.html', 'w', encoding='utf-8') as f:
    f.write(delete_content.replace('https://www.bfiiy.com/data-deletion', 'https://www.bfiiy.com/delete-account'))
with open('public/delete-account.html', 'w', encoding='utf-8') as f:
    f.write(delete_content.replace('https://www.bfiiy.com/data-deletion', 'https://www.bfiiy.com/delete-account'))

print("All static route files synchronized successfully.")
