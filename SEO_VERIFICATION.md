# SEO Improvements Verification Guide

This document provides step-by-step verification commands for the SEO improvements implemented in PR #1.

## 1. Apex to WWW Redirect

**Goal:** Verify that `gd-bot.com` redirects to `www.gd-bot.com` with 301 status.

```bash
# Test apex redirect - should return 301 Location: https://www.gd-bot.com/
curl -I https://gd-bot.com/

# Test www (canonical) - should return 200 OK
curl -I https://www.gd-bot.com/

# Test apex with path - should redirect to www with same path
curl -I https://gd-bot.com/pricing.html
```

**Expected:**
- Apex domain returns `HTTP 301` or `HTTP 308` with `Location: https://www.gd-bot.com/`
- WWW domain returns `HTTP 200 OK`

## 2. No Tailwind CDN

**Goal:** Confirm production site uses built CSS, not CDN.

```bash
# Should NOT contain "cdn.tailwindcss.com"
curl -s https://www.gd-bot.com/ | grep -i "cdn.tailwindcss"

# Should contain reference to built CSS
curl -s https://www.gd-bot.com/ | grep "css/tailwind.css"
```

**Expected:**
- First command returns **nothing** (no CDN reference)
- Second command shows: `<link href="css/tailwind.css" rel="stylesheet">`

## 3. Sitemap Cleanup

**Goal:** Sitemap lists only canonical URLs without query parameters or mobile duplicates.

```bash
# View sitemap
curl https://www.gd-bot.com/sitemap.xml

# Count URLs (should be 1)
curl -s https://www.gd-bot.com/sitemap.xml | grep -c "<loc>"
```

**Expected:**
- Only one `<loc>`: `https://www.gd-bot.com/`
- No `index.html?lang=...` entries
- No `mobile.html` or `pricing-mobile.html` entries
- `lastmod` shows `2026-10-27`

## 4. Robots.txt Simplification

**Goal:** Clean robots.txt without redundant directives.

```bash
curl https://www.gd-bot.com/robots.txt
```

**Expected:**
```
# robots.txt for GameHub Bot (www.gd-bot.com)

User-agent: *
Disallow: /mp4/

Sitemap: https://www.gd-bot.com/sitemap.xml
```

**Should NOT contain:**
- Multiple `Allow:` directives
- `Crawl-delay:` directive
- Multiple User-agent sections

## 5. Structured Data (JSON-LD)

**Goal:** Rich structured data with Organization, WebSite, and AggregateOffer.

### Manual Verification:
1. Visit [Google Rich Results Test](https://search.google.com/test/rich-results)
2. Enter: `https://www.gd-bot.com/`
3. Click "Test URL"

**Expected to see:**
- ✅ Organization entity (GameHub Bot)
- ✅ WebSite entity
- ✅ SoftwareApplication with AggregateOffer
- Price range: 100-200 CNY
- Billing duration: P30D (30 days)

### Command Line Check:
```bash
curl -s https://www.gd-bot.com/ | grep -A 50 'application/ld+json' | head -60
```

**Expected:**
```json
{
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Organization",
            "name": "GameHub Bot",
            ...
        },
        {
            "@type": "WebSite",
            ...
        },
        {
            "@type": "SoftwareApplication",
            "offers": {
                "@type": "AggregateOffer",
                "lowPrice": "100",
                "highPrice": "200",
                ...
            }
        }
    ]
}
```

## 6. Open Graph Meta Tags

**Goal:** OG image has dimensions and alt text.

```bash
curl -s https://www.gd-bot.com/ | grep -A 3 'og:image'
```

**Expected:**
```html
<meta property="og:image" content="https://www.gd-bot.com/images/82b91715850941.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="GameHub Bot - 多平台游戏交易自动化系统">
```

### Social Media Preview Test:
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- Enter: `https://www.gd-bot.com/`

**Expected:**
- Image displays correctly (1200×630px)
- Title and description show properly

## 7. Redirect Pages Have Noindex

**Goal:** Redirect-only pages don't appear in search results.

```bash
# Check mobile.html
curl -s https://www.gd-bot.com/mobile.html | grep -i "noindex"

# Check pricing.html
curl -s https://www.gd-bot.com/pricing.html | grep -i "noindex"

# Check pricing-mobile.html
curl -s https://www.gd-bot.com/pricing-mobile.html | grep -i "noindex"

# Check changelog.html
curl -s https://www.gd-bot.com/changelog.html | grep -i "noindex"
```

**Expected for all:**
```html
<meta name="robots" content="noindex, follow">
```

## 8. Visual Design Unchanged

**Goal:** Site looks identical to before; only under-the-hood changes.

### Manual Check:
1. Visit `https://www.gd-bot.com/`
2. Compare with production (if old version is still cached)

**Expected:**
- Same gradient background
- Same fonts (Sora, Noto Sans SC)
- Same layout, colors, spacing
- Pricing calculator works
- Mobile menu works

## 9. HTML File Redirects

**Goal:** Accessing `.html` files redirects to clean URLs.

```bash
# index.html should redirect to /
curl -I https://www.gd-bot.com/index.html

# pricing.html should redirect to /#pricing
curl -I https://www.gd-bot.com/pricing.html
```

**Expected:**
- `HTTP 308` redirect to clean URL
- Or immediate redirect via meta refresh + JavaScript

## Summary Checklist

After deployment, verify:

- [ ] `gd-bot.com` → `www.gd-bot.com` (301/308)
- [ ] No `cdn.tailwindcss.com` in HTML
- [ ] Sitemap has only canonical URL(s)
- [ ] Robots.txt is clean (no Allow clutter, no Crawl-delay)
- [ ] JSON-LD passes Rich Results Test
- [ ] OG image has width/height/alt
- [ ] Redirect pages have `noindex`
- [ ] Visual design unchanged
- [ ] All pages load correctly (200 OK)

## Search Console (Post-Deployment)

After changes are live, submit in Google Search Console:
1. Request indexing for `https://www.gd-bot.com/`
2. Submit updated sitemap
3. Monitor for crawl errors
4. Check Coverage report for removed pages (mobile.html variants)

---

**Note:** The `_redirects` file requires Cloudflare Pages deployment to take effect. Local testing won't show the apex→www redirect unless using a local server with redirect support.
