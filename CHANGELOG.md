# Domain Details Chrome Extension - Changelog

## Version 1.2.0 (2025-10-25)

### Major Improvements

#### 🌐 IANA RDAP Bootstrap Integration
- Implemented official IANA RDAP bootstrap service for universal TLD support
- Three-tier lookup strategy:
  1. **Hardcoded servers** for top 25 TLDs (instant lookup)
  2. **Cached IANA data** for previously queried TLDs (fast lookup)
  3. **Dynamic IANA fetch** for new TLDs (comprehensive coverage)

#### 📦 Smart Caching System
- IANA bootstrap data cached in localStorage for 7 days
- Automatic cache refresh when expired
- Reduces network requests and improves performance
- ~1,500+ TLDs supported automatically

#### 🚀 Performance Optimizations
- Top 25 most popular TLDs hardcoded for zero-latency lookups:
  - Generic: `.com`, `.net`, `.org`, `.info`, `.biz`
  - New gTLDs: `.io`, `.ai`, `.co`, `.me`, `.xyz`, `.online`, `.dev`, `.app`, `.cloud`, `.tech`
  - Country codes: `.uk`, `.de`, `.cn`, `.nl`, `.fr`, `.au`, `.ca`, `.jp`, `.br`, `.it`, `.es`, `.ru`, `.in`
- RDAP servers selected based on official IANA registry
- Console logging for debugging and transparency

### Technical Details

#### RDAP Lookup Priority
```
1. Check hardcoded bootstrap (instant)
   ↓ if not found
2. Check IANA cache (fast)
   ↓ if not found or expired
3. Fetch IANA bootstrap (comprehensive)
   ↓ if still not found
4. Fallback to WHOIS API
```

#### What Changed
- **RegistryDetector**: Now queries IANA's official RDAP bootstrap service
- **RdapClient**: Updated to use async RDAP URL resolution
- **Lookup Logic**: Properly awaits RDAP support checks before routing
- **Error Handling**: Improved fallback chain with better logging

### Why This Matters
- **Universal Coverage**: Supports virtually all TLDs with RDAP servers
- **Always Up-to-Date**: IANA registry is the authoritative source
- **Better Privacy**: More lookups use RDAP (faster, more private than WHOIS)
- **Reliability**: Smart fallback ensures lookups always work

---

## Version 1.1.0 (2025-10-20)

### New Features

#### 🎯 Smart Subdomain Detection
- Automatically detects when you're on a subdomain (e.g., `blog.example.com`)
- Visual indicator showing subdomain in blue and root domain in black
- One-click toggle button to switch between subdomain and root domain lookups

#### 🔄 URL Normalization
- Intelligent URL parsing that handles:
  - Full URLs with protocols (`https://example.com`, `http://example.com`)
  - URLs with `www.` prefix (automatically removed)
  - URLs with ports (`:8080`, `:3000`)
  - URLs with paths, query parameters, and fragments
  - Complex URLs with subdomains

#### 🌍 Multi-Level TLD Support
- Proper handling of country-specific TLDs:
  - UK domains: `.co.uk`, `.org.uk`, `.me.uk`, `.ltd.uk`, `.plc.uk`, `.net.uk`, `.ac.uk`
  - Australian domains: `.com.au`, `.net.au`, `.org.au`, `.edu.au`, `.gov.au`
  - New Zealand domains: `.co.nz`, `.net.nz`, `.org.nz`, `.govt.nz`
  - South African domains: `.co.za`, `.org.za`, `.net.za`
  - And many more!

### How to Use

#### Subdomain Lookups
1. Visit any website with a subdomain (e.g., `mail.google.com`, `support.github.com`)
2. Click the Domain Details extension icon
3. You'll see the domain displayed as: **mail.**google.com
   - Blue text = subdomain part
   - Black text = root domain
4. Click the "Switch to google.com" button to lookup the root domain instead
5. Click again to switch back to the full subdomain lookup

#### Examples

**Example 1: Blog subdomain**
- Visit `https://blog.medium.com`
- Extension shows: **blog.**medium.com
- Toggle to lookup `medium.com` instead

**Example 2: UK domain with subdomain**
- Visit `https://shop.example.co.uk`
- Extension shows: **shop.**example.co.uk
- Toggle to lookup `example.co.uk` (correctly identifies as root)

**Example 3: Complex URL**
- Visit `https://www.support.example.com:8080/help?id=123`
- Extension normalizes to: **support.**example.com
- All unnecessary parts removed automatically

### Technical Improvements

- Added `DomainNormalizer` class with static utility methods
- Improved domain parsing algorithm
- Better handling of edge cases
- More robust subdomain detection
- Enhanced CSS for subdomain UI elements

### Bug Fixes

- Fixed issue where `www.` wasn't being removed consistently
- Fixed incorrect domain extraction for complex URLs
- Improved handling of URLs with ports

---

## Version 1.0.0 (2025-07-21)

### Initial Release

- RDAP and WHOIS domain lookups
- Auto-detection of current tab domain
- Comprehensive domain information display
- Raw data view
- Privacy-focused design
- Fast RDAP-first approach with WHOIS fallback
