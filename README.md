# Domain Details - Chrome Extension

Get instant, private domain lookups right in your browser. View RDAP/WHOIS data, expiration dates, nameservers, and registrar details without leaving your current tab.

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-blue?logo=google-chrome)](https://chromewebstore.google.com/detail/domain-details-rdap-whois/ceoknmdcolcpjnadklohkhjgoghnafmm)
[![Version](https://img.shields.io/badge/version-1.2.0-green)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

## Features

### 🔍 Instant Domain Lookups
- **RDAP-First Approach**: Fast, structured data from official registries
- **Smart WHOIS Fallback**: Automatic fallback for TLDs without RDAP
- **1,500+ TLDs Supported**: Universal coverage via IANA RDAP bootstrap

### 🌐 Intelligent URL Handling
- **Auto-Detection**: Automatically detects the domain of your current tab
- **Subdomain Support**: Smart detection and toggle between subdomain and root domain
- **URL Normalization**: Handles complex URLs with ports, paths, and query parameters
- **Multi-Level TLD Support**: Properly handles `.co.uk`, `.com.au`, `.co.nz`, and more

### 🚀 Performance Optimized
- **Hardcoded Top 25 TLDs**: Zero-latency lookups for popular TLDs
- **Smart Caching**: IANA bootstrap data cached for 7 days
- **Three-Tier Lookup Strategy**:
  1. Hardcoded servers (instant)
  2. Cached IANA data (fast)
  3. Dynamic IANA fetch (comprehensive)

### 🔐 Privacy-Focused
- **No Tracking**: Your lookups are private
- **Direct to Source**: RDAP queries go straight to registries
- **Local-First**: Processing happens in your browser

## Installation

### From Chrome Web Store
1. Visit the [Domain Details extension page](https://chromewebstore.google.com/detail/domain-details-rdap-whois/ceoknmdcolcpjnadklohkhjgoghnafmm)
2. Click "Add to Chrome"
3. Start looking up domains!

### Manual Installation (Developer Mode)
1. Download the latest release from [Releases](../../releases)
2. Extract the ZIP file
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" in the top-right corner
5. Click "Load unpacked"
6. Select the extracted extension folder
7. The extension icon should appear in your toolbar

## Usage

### Basic Lookup
1. Click the extension icon while on any website
2. The domain is automatically detected and looked up
3. View comprehensive domain information instantly

### Subdomain Toggle
When on a subdomain (e.g., `blog.example.com`):
1. Extension displays: **blog.**example.com
   - Blue text = subdomain
   - Black text = root domain
2. Click "Switch to example.com" to lookup the root domain
3. Click again to switch back to full subdomain lookup

### Examples

**Example 1: Simple Domain**
- Visit `https://google.com`
- Extension auto-lookups `google.com`
- View registrar, expiration date, nameservers, etc.

**Example 2: Subdomain**
- Visit `https://mail.google.com`
- Extension shows: **mail.**google.com
- Toggle to lookup `google.com` instead

**Example 3: Complex URL**
- Visit `https://www.support.example.co.uk:8080/help?id=123`
- Extension normalizes to: **support.**example.co.uk
- Correctly identifies root domain as `example.co.uk`

## Technical Details

### Architecture

#### Lookup Flow
```
User clicks extension
    ↓
Extract current tab URL
    ↓
Normalize domain (remove www, protocol, port, path)
    ↓
Detect subdomain vs root domain
    ↓
Check TLD RDAP support (3-tier strategy)
    ↓
1. Hardcoded bootstrap (instant) → RDAP lookup
2. Cached IANA data (fast) → RDAP lookup
3. Dynamic IANA fetch (comprehensive) → RDAP lookup
    ↓
If RDAP unavailable → WHOIS API fallback
    ↓
Parse and display results
```

#### RDAP Support Detection
The extension uses the official IANA RDAP bootstrap service:
- **Top 25 TLDs**: Hardcoded servers for instant lookups
- **Cached TLDs**: Previously queried TLDs stored for 7 days
- **Dynamic TLDs**: Fetches IANA data for new TLDs on-demand

### Key Components

- **DomainNormalizer**: URL parsing and domain extraction
- **RegistryDetector**: RDAP support detection via IANA bootstrap
- **RdapClient**: RDAP query execution
- **WhoisApiClient**: Fallback WHOIS API integration

### Supported TLDs

#### Top 25 Hardcoded TLDs (Instant Lookup)
- **Generic**: `.com`, `.net`, `.org`, `.info`, `.biz`
- **New gTLDs**: `.io`, `.ai`, `.co`, `.me`, `.xyz`, `.online`, `.dev`, `.app`, `.cloud`, `.tech`
- **Country Codes**: `.uk`, `.de`, `.cn`, `.nl`, `.fr`, `.au`, `.ca`, `.jp`, `.br`, `.it`, `.es`, `.ru`, `.in`

#### Multi-Level TLDs
- **UK**: `.co.uk`, `.org.uk`, `.me.uk`, `.ltd.uk`, `.plc.uk`, `.net.uk`, `.ac.uk`
- **Australia**: `.com.au`, `.net.au`, `.org.au`, `.edu.au`, `.gov.au`
- **New Zealand**: `.co.nz`, `.net.nz`, `.org.nz`, `.govt.nz`
- **South Africa**: `.co.za`, `.org.za`, `.net.za`
- And many more!

## API Integration

The extension uses the DomainDetails.com API as a fallback for WHOIS lookups when RDAP is unavailable:

- **Endpoint**: `https://api.domaindetails.com/api/whois?domain=<domain>`
- **Method**: GET
- **Purpose**: WHOIS data for TLDs without RDAP support
- **No API Key Required**: Public endpoint

## Development

### Project Structure
```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.css             # Styling
├── popup.js              # Main logic
├── icons/                # Extension icons
└── CHANGELOG.md          # Version history
```

### Building
No build step required - this is a vanilla JavaScript extension.

### Testing
1. Load the extension in developer mode
2. Visit various websites with different domain structures
3. Test subdomain detection, multi-level TLDs, and edge cases
4. Check console for debug logs

### Making Changes
1. Edit the relevant files (`popup.js`, `popup.html`, `popup.css`)
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

**Latest**: v1.2.0 (2025-10-25)
- IANA RDAP bootstrap integration
- Smart caching system
- Support for 1,500+ TLDs
- Performance optimizations

## Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs**: Open an issue with details about the problem
2. **Suggest Features**: Share ideas for improvements
3. **Submit PRs**: Fork, make changes, and submit a pull request
4. **Improve Docs**: Help us make documentation better

### Guidelines
- Follow existing code style
- Test thoroughly before submitting
- Update CHANGELOG.md for new features
- Keep commits focused and descriptive

## Support

- **Website**: [domaindetails.com](https://domaindetails.com)
- **Issues**: [GitHub Issues](../../issues)
- **Email**: support@domaindetails.com

## License

MIT License - see LICENSE file for details

## Credits

- Built with ❤️ by the DomainDetails team
- Uses official IANA RDAP bootstrap service
- RDAP data from official TLD registries
- WHOIS fallback via DomainDetails.com API

---

**Privacy Notice**: This extension does not track your activity. RDAP queries go directly to official registries. WHOIS fallback queries are sent to DomainDetails.com but are not logged or stored.
