let currentDomain = null;
let rootDomain = null;
let isSubdomain = false;

// URL Normalization Utilities
class DomainNormalizer {
    /**
     * Extract and normalize domain from various URL formats
     * Handles: https://, http://, www., trailing slashes, paths, etc.
     */
    static normalizeDomain(url) {
        if (!url || typeof url !== 'string') {
            return null;
        }

        let domain = url.trim();

        // Remove protocol if present
        domain = domain.replace(/^(https?:\/\/)/i, '');

        // Remove port if present
        domain = domain.split(':')[0];

        // Remove path, query params, and fragments
        domain = domain.split('/')[0].split('?')[0].split('#')[0];

        // Remove www. prefix
        domain = domain.replace(/^www\./i, '');

        // Remove trailing dots
        domain = domain.replace(/\.+$/, '');

        return domain.toLowerCase();
    }

    /**
     * Extract root domain from a hostname
     * Handles subdomains and multi-level TLDs
     */
    static getRootDomain(hostname) {
        if (!hostname) return null;

        const normalized = this.normalizeDomain(hostname);
        if (!normalized) return null;

        const parts = normalized.split('.');

        // Common multi-level TLDs
        const multiLevelTLDs = new Set([
            'co.uk', 'org.uk', 'me.uk', 'ltd.uk', 'plc.uk', 'net.uk',
            'com.au', 'net.au', 'org.au', 'edu.au', 'gov.au',
            'co.nz', 'net.nz', 'org.nz', 'govt.nz',
            'co.za', 'org.za', 'net.za',
            'com.br', 'net.br', 'org.br',
            'co.jp', 'ne.jp', 'or.jp', 'go.jp',
            'ac.uk', 'sch.uk', 'police.uk',
            'com.cn', 'net.cn', 'org.cn', 'edu.cn',
            'com.mx', 'net.mx', 'org.mx'
        ]);

        // Check for multi-level TLD
        if (parts.length >= 3) {
            const possibleMultiTLD = parts.slice(-2).join('.');
            if (multiLevelTLDs.has(possibleMultiTLD)) {
                // Return domain.co.uk format
                return parts.slice(-3).join('.');
            }
        }

        // Regular TLD - return domain.com format
        if (parts.length >= 2) {
            return parts.slice(-2).join('.');
        }

        return normalized;
    }

    /**
     * Check if hostname is a subdomain
     */
    static isSubdomain(hostname) {
        if (!hostname) return false;

        const normalized = this.normalizeDomain(hostname);
        const root = this.getRootDomain(hostname);

        return normalized !== root;
    }

    /**
     * Get subdomain part
     */
    static getSubdomain(hostname) {
        if (!hostname) return null;

        const normalized = this.normalizeDomain(hostname);
        const root = this.getRootDomain(hostname);

        if (normalized === root) return null;

        // Return the subdomain part (everything before the root domain)
        return normalized.replace(`.${root}`, '');
    }
}

// Registry detector with IANA bootstrap support
class RegistryDetector {
    constructor() {
        // Top 25+ most popular TLDs (hardcoded for performance)
        this.rdapBootstrap = new Map([
            // Top generic TLDs
            ['com', 'https://rdap.verisign.com/com/v1/'],
            ['net', 'https://rdap.verisign.com/net/v1/'],
            ['org', 'https://rdap.publicinterestregistry.org/rdap/'],
            ['info', 'https://rdap.afilias-srs.net/rdap/info/'],
            ['biz', 'https://rdap.afilias-srs.net/rdap/biz/'],

            // Popular new gTLDs
            ['io', 'https://rdap.nic.io/'],
            ['ai', 'https://rdap.nic.ai/'],
            ['co', 'https://rdap.nic.co/'],
            ['me', 'https://rdap.nic.me/'],
            ['xyz', 'https://rdap.centralnic.com/xyz/'],
            ['online', 'https://rdap.centralnic.com/online/'],
            ['dev', 'https://rdap.nic.dev/'],
            ['app', 'https://rdap.nic.app/'],
            ['cloud', 'https://rdap.nic.cloud/'],
            ['tech', 'https://rdap.nic.tech/'],

            // Major country codes
            ['uk', 'https://rdap.nominet.uk/uk/'],
            ['de', 'https://rdap.denic.de/'],
            ['cn', 'https://rdap.cnnic.cn/'],
            ['nl', 'https://rdap.sidn.nl/'],
            ['fr', 'https://rdap.nic.fr/'],
            ['au', 'https://rdap.ausregistry.net.au/'],
            ['ca', 'https://rdap.cira.ca/'],
            ['jp', 'https://rdap.jprs.jp/'],
            ['br', 'https://rdap.registro.br/'],
            ['it', 'https://rdap.nic.it/'],
            ['es', 'https://rdap.nic.es/'],
            ['ru', 'https://rdap.tcinet.ru/'],
            ['in', 'https://rdap.registry.in/']
        ]);

        // IANA bootstrap cache (stored in memory and localStorage)
        this.ianaCache = null;
        this.ianaCacheExpiry = null;
        this.CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
        this.IANA_BOOTSTRAP_URL = 'https://data.iana.org/rdap/dns.json';

        // Load IANA cache from localStorage
        this.loadIanaCache();
    }

    loadIanaCache() {
        try {
            const cached = localStorage.getItem('iana_rdap_bootstrap');
            const expiry = localStorage.getItem('iana_rdap_expiry');

            if (cached && expiry) {
                const expiryTime = parseInt(expiry, 10);
                if (Date.now() < expiryTime) {
                    this.ianaCache = JSON.parse(cached);
                    this.ianaCacheExpiry = expiryTime;
                    console.log('[RDAP] Loaded IANA cache from localStorage');
                }
            }
        } catch (error) {
            console.error('[RDAP] Failed to load IANA cache:', error);
        }
    }

    saveIanaCache(data) {
        try {
            const expiry = Date.now() + this.CACHE_TTL;
            localStorage.setItem('iana_rdap_bootstrap', JSON.stringify(data));
            localStorage.setItem('iana_rdap_expiry', expiry.toString());
            this.ianaCache = data;
            this.ianaCacheExpiry = expiry;
            console.log('[RDAP] Saved IANA cache to localStorage');
        } catch (error) {
            console.error('[RDAP] Failed to save IANA cache:', error);
        }
    }

    async fetchIanaBootstrap() {
        try {
            console.log('[RDAP] Fetching IANA bootstrap...');
            const response = await fetch(this.IANA_BOOTSTRAP_URL, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                cache: 'no-cache'
            });

            if (!response.ok) {
                throw new Error(`IANA bootstrap fetch failed: ${response.status}`);
            }

            const data = await response.json();

            // Transform IANA services array into a lookup map
            const bootstrapMap = new Map();
            if (data.services && Array.isArray(data.services)) {
                for (const service of data.services) {
                    const [tlds, servers] = service;
                    if (Array.isArray(tlds) && Array.isArray(servers) && servers.length > 0) {
                        // Use first server for each TLD
                        const server = servers[0];
                        for (const tld of tlds) {
                            bootstrapMap.set(tld.toLowerCase(), server);
                        }
                    }
                }
            }

            this.saveIanaCache({
                services: data.services,
                bootstrapMap: Array.from(bootstrapMap.entries()),
                publication: data.publication
            });

            console.log(`[RDAP] IANA bootstrap loaded: ${bootstrapMap.size} TLDs`);
            return bootstrapMap;
        } catch (error) {
            console.error('[RDAP] Failed to fetch IANA bootstrap:', error);
            return null;
        }
    }

    getRdapUrlFromIana(tld) {
        if (!this.ianaCache || !this.ianaCache.bootstrapMap) {
            return null;
        }

        // Convert back to Map if needed
        const map = this.ianaCache.bootstrapMap instanceof Map
            ? this.ianaCache.bootstrapMap
            : new Map(this.ianaCache.bootstrapMap);

        return map.get(tld.toLowerCase()) || null;
    }

    getTLD(domain) {
        const parts = domain.toLowerCase().split('.');
        if (parts.length < 2) return null;

        // Handle second-level domains
        const commonSecondLevel = new Set([
            'co.uk', 'org.uk', 'me.uk', 'ltd.uk', 'plc.uk',
            'com.au', 'net.au', 'org.au', 'edu.au'
        ]);

        if (parts.length >= 3) {
            const secondLevel = parts.slice(-2).join('.');
            if (commonSecondLevel.has(secondLevel)) {
                return secondLevel;
            }
        }

        return parts[parts.length - 1];
    }

    async getRdapUrl(domain) {
        const tld = this.getTLD(domain);
        if (!tld) return null;

        // 1. Check hardcoded bootstrap (fastest)
        const hardcoded = this.rdapBootstrap.get(tld);
        if (hardcoded) {
            console.log(`[RDAP] Using hardcoded server for .${tld}`);
            return hardcoded;
        }

        // 2. Check IANA cache
        let ianaUrl = this.getRdapUrlFromIana(tld);
        if (ianaUrl) {
            console.log(`[RDAP] Using cached IANA server for .${tld}`);
            return ianaUrl;
        }

        // 3. Fetch IANA bootstrap if cache is expired or missing
        if (!this.ianaCache || Date.now() >= this.ianaCacheExpiry) {
            const bootstrapMap = await this.fetchIanaBootstrap();
            if (bootstrapMap) {
                ianaUrl = bootstrapMap.get(tld);
                if (ianaUrl) {
                    console.log(`[RDAP] Using fresh IANA server for .${tld}`);
                    return ianaUrl;
                }
            }
        }

        console.log(`[RDAP] No RDAP server found for .${tld}`);
        return null;
    }

    async hasRdapSupport(domain) {
        const url = await this.getRdapUrl(domain);
        return url !== null;
    }
}

// RDAP Client similar to MCP server
class RdapClient {
    constructor() {
        this.registryDetector = new RegistryDetector();
        this.timeout = 10000;
    }

    async lookupDomain(domain) {
        const cleanDomain = domain.toLowerCase().trim();

        try {
            // Get RDAP URL (may fetch IANA bootstrap if needed)
            const rdapUrl = await this.registryDetector.getRdapUrl(cleanDomain);

            if (!rdapUrl) {
                throw new Error(`No RDAP server found for domain: ${cleanDomain}`);
            }

            const queryUrl = `${rdapUrl}domain/${cleanDomain}`;
            console.log(`[RDAP] Querying: ${queryUrl}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            try {
                const response = await fetch(queryUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/rdap+json,application/json',
                        'User-Agent': 'DomainDetails-Extension/1.0'
                    },
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    if (response.status === 404) {
                        return {
                            domain: cleanDomain,
                            found: false,
                            method: 'rdap',
                            message: 'Domain not found in registry'
                        };
                    }
                    throw new Error(`RDAP query failed: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                console.log('[RDAP] Query successful');
                return this.parseRdapResponse(data, cleanDomain);

            } catch (error) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    throw new Error(`RDAP query timed out after ${this.timeout}ms`);
                }
                throw error;
            }

        } catch (error) {
            console.error('[RDAP] Lookup failed:', error.message);
            throw error;
        }
    }

    parseRdapResponse(data, domain) {
        const result = {
            domain,
            found: true,
            method: 'rdap',
            objectClassName: data.objectClassName,
            ldhName: data.ldhName || domain,
            status: data.status || [],
            events: [],
            entities: [],
            nameservers: [],
            rawData: data
        };

        // Parse events (dates)
        if (data.events) {
            result.events = data.events.map(event => ({
                eventAction: event.eventAction,
                eventDate: event.eventDate,
                eventActor: event.eventActor
            }));

            // Extract common dates
            const registrationEvent = data.events.find(e => e.eventAction === 'registration');
            const expirationEvent = data.events.find(e => e.eventAction === 'expiration');
            const lastChangedEvent = data.events.find(e => e.eventAction === 'last changed');

            if (registrationEvent) result.registrationDate = registrationEvent.eventDate;
            if (expirationEvent) result.expirationDate = expirationEvent.eventDate;
            if (lastChangedEvent) result.lastChangedDate = lastChangedEvent.eventDate;
        }

        // Parse entities (contacts)
        if (data.entities) {
            result.entities = data.entities.map(entity => this.parseEntity(entity));
            
            // Extract registrar
            const registrarEntity = data.entities.find(e => e.roles && e.roles.includes('registrar'));
            if (registrarEntity && registrarEntity.vcardArray) {
                const vcard = registrarEntity.vcardArray[1];
                const nameField = vcard?.find(item => item[0] === 'fn');
                if (nameField) {
                    result.registrar = nameField[3];
                }
            }
        }

        // Parse nameservers
        if (data.nameservers) {
            result.nameservers = data.nameservers.map(ns => ns.ldhName).filter(Boolean);
        }

        return result;
    }

    parseEntity(entity) {
        const parsed = {
            handle: entity.handle,
            roles: entity.roles || [],
            contact: null
        };

        // Parse vCard if available
        if (entity.vcardArray && entity.vcardArray.length > 1) {
            const vcard = entity.vcardArray[1];
            parsed.contact = this.parseVCard(vcard);
        }

        return parsed;
    }

    parseVCard(vcard) {
        const contact = {};
        
        if (!Array.isArray(vcard)) return contact;

        for (const field of vcard) {
            if (!Array.isArray(field) || field.length < 4) continue;

            const [property, params, type, value] = field;

            switch (property.toLowerCase()) {
                case 'fn':
                    contact.name = value;
                    break;
                case 'org':
                    contact.organization = Array.isArray(value) ? value[0] : value;
                    break;
                case 'email':
                    if (!contact.emails) contact.emails = [];
                    contact.emails.push(value);
                    break;
                case 'tel':
                    if (!contact.phones) contact.phones = [];
                    contact.phones.push(value);
                    break;
            }
        }

        return contact;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const domainEl = document.getElementById('domain');
    const lookupBtn = document.getElementById('lookup-btn');
    const resultsContainer = document.getElementById('results-container');
    const resultEl = document.getElementById('result');
    const rawDataEl = document.getElementById('raw-data');
    const footerLink = document.getElementById('footer-link');

    const registryDetector = new RegistryDetector();
    const rdapClient = new RdapClient();

    // Function to update footer link with current domain
    function updateFooterLink(domain) {
        if (domain && footerLink) {
            footerLink.href = `https://domaindetails.com/?domain=${encodeURIComponent(domain)}`;
        }
    }
    
    // Tab switching
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding content
            tabContents.forEach(content => {
                if (content.id === `${tabName}-tab`) {
                    content.style.display = 'block';
                    content.classList.add('active');
                } else {
                    content.style.display = 'none';
                    content.classList.remove('active');
                }
            });
        });
    });
    
    // Get current tab URL and extract domain
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        const currentTab = tabs[0];

        // Extract domain with normalization
        try {
            const url = new URL(currentTab.url);
            const hostname = url.hostname;

            // Normalize and extract domains
            currentDomain = DomainNormalizer.normalizeDomain(hostname);
            rootDomain = DomainNormalizer.getRootDomain(hostname);
            isSubdomain = DomainNormalizer.isSubdomain(hostname);

            // Display domain with subdomain indicator
            if (isSubdomain) {
                const subdomainPart = DomainNormalizer.getSubdomain(hostname);
                domainEl.innerHTML = `
                    <span class="subdomain-part">${subdomainPart}.</span><span class="root-part">${rootDomain}</span>
                    <button id="toggle-root" class="toggle-domain-btn" title="Switch to root domain">
                        Switch to ${rootDomain}
                    </button>
                `;

                // Add toggle handler
                setTimeout(() => {
                    const toggleBtn = document.getElementById('toggle-root');
                    if (toggleBtn) {
                        toggleBtn.addEventListener('click', function() {
                            if (currentDomain === rootDomain) {
                                // Switch back to full subdomain
                                currentDomain = DomainNormalizer.normalizeDomain(hostname);
                                domainEl.innerHTML = `
                                    <span class="subdomain-part">${subdomainPart}.</span><span class="root-part">${rootDomain}</span>
                                    <button id="toggle-root" class="toggle-domain-btn" title="Switch to root domain">
                                        Switch to ${rootDomain}
                                    </button>
                                `;
                                // Re-attach handler
                                setTimeout(() => document.getElementById('toggle-root').addEventListener('click', arguments.callee), 0);
                            } else {
                                // Switch to root domain
                                currentDomain = rootDomain;
                                domainEl.innerHTML = `
                                    <span class="root-part">${rootDomain}</span>
                                    <button id="toggle-root" class="toggle-domain-btn" title="Switch to full domain">
                                        Switch to ${DomainNormalizer.normalizeDomain(hostname)}
                                    </button>
                                `;
                                // Re-attach handler
                                setTimeout(() => document.getElementById('toggle-root').addEventListener('click', arguments.callee), 0);
                            }
                            // Update footer link
                            updateFooterLink(currentDomain);
                            // Trigger new lookup
                            lookupBtn.click();
                        });
                    }
                }, 0);
            } else {
                domainEl.innerHTML = `<span class="root-part">${currentDomain}</span>`;
            }

            lookupBtn.disabled = false;

            // Update footer link
            updateFooterLink(currentDomain);

            // Auto-trigger lookup
            lookupBtn.click();
        } catch (e) {
            domainEl.textContent = 'Invalid URL';
            lookupBtn.disabled = true;
        }
    });
    
    // Lookup button
    lookupBtn.addEventListener('click', async function() {
        if (!currentDomain) {
            resultEl.innerHTML = '<div class="error-message">No domain to lookup</div>';
            return;
        }
        
        // Show loading state
        lookupBtn.disabled = true;
        const btnText = lookupBtn.querySelector('.btn-text');
        const btnLoading = lookupBtn.querySelector('.btn-loading');
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        
        resultEl.innerHTML = '<div class="loading-skeleton"></div>'.repeat(4);
        rawDataEl.textContent = '';
        resultsContainer.style.display = 'flex';
        
        let lookupResult = null;
        let method = 'unknown';
        let fallbackUsed = false;

        try {
            // Try RDAP first if supported
            const hasRdap = await registryDetector.hasRdapSupport(currentDomain);
            if (hasRdap) {
                try {
                    console.log('[Lookup] Attempting RDAP lookup...');
                    lookupResult = await rdapClient.lookupDomain(currentDomain);
                    method = 'rdap';
                } catch (rdapError) {
                    console.warn('[Lookup] RDAP failed, falling back to WHOIS:', rdapError.message);
                    fallbackUsed = true;
                }
            } else {
                console.log('[Lookup] No RDAP support, using WHOIS');
            }

            // Fallback to WHOIS if RDAP failed or not supported
            if (!lookupResult) {
                const apiUrl = `https://api.domaindetails.com/api/whois?domain=${encodeURIComponent(currentDomain)}`;

                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'DomainDetails-Extension/1.0'
                    }
                });

                if (!response.ok) {
                    throw new Error(`WHOIS API responded with status ${response.status}: ${response.statusText}`);
                }

                const whoisData = await response.json();
                
                // Transform WHOIS data to match our format
                lookupResult = {
                    domain: currentDomain,
                    found: whoisData.parsedData && whoisData.parsedData.domainName ? true : false,
                    method: 'whois',
                    registrar: whoisData.parsedData?.registrar,
                    registrationDate: whoisData.parsedData?.creationDate,
                    expirationDate: whoisData.parsedData?.expirationDate,
                    lastChangedDate: whoisData.parsedData?.updatedDate,
                    status: whoisData.parsedData?.status,
                    nameservers: whoisData.parsedData?.nameservers,
                    rawData: whoisData
                };
                
                method = 'whois';
            }

            // Add metadata
            lookupResult.fallbackUsed = fallbackUsed;
            lookupResult.timestamp = new Date().toISOString();
            
            // Display results
            displayResults(lookupResult, method);

        } catch (error) {
            resultEl.innerHTML = `<div class="error-message">Lookup failed: ${error.message}</div>`;
        } finally {
            // Reset button
            lookupBtn.disabled = false;
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
        }
    });
    
    function displayResults(data, method) {
        if (!data.found) {
            resultEl.innerHTML = `
                <div class="not-found">
                    <h4>Domain Not Found</h4>
                    <p>This domain is not registered or not found in the registry.</p>
                    <span class="method-badge ${method}">${method.toUpperCase()}</span>
                </div>
            `;
            rawDataEl.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
            return;
        }

        // Display key information with enhanced formatting
        let html = `
            <span class="method-badge ${method === 'whois' ? 'whois' : ''}">
                ${method.toUpperCase()}${data.fallbackUsed ? ' (FALLBACK)' : ''}
            </span>
            <h4>Domain Information</h4>
        `;
        
        if (data.domain) {
            html += `<p><strong>Domain</strong><span>${data.domain}</span></p>`;
        }
        
        if (data.registrar) {
            html += `<p><strong>Registrar</strong><span>${data.registrar}</span></p>`;
        }
        
        if (data.registrationDate) {
            const date = new Date(data.registrationDate).toLocaleDateString();
            html += `<p><strong>Created</strong><span>${date}</span></p>`;
        }
        
        if (data.expirationDate) {
            const date = new Date(data.expirationDate).toLocaleDateString();
            const daysUntil = Math.floor((new Date(data.expirationDate) - new Date()) / (1000 * 60 * 60 * 24));
            html += `<p><strong>Expires</strong><span>${date} (${daysUntil} days)</span></p>`;
        }
        
        if (data.lastChangedDate) {
            const date = new Date(data.lastChangedDate).toLocaleDateString();
            html += `<p><strong>Updated</strong><span>${date}</span></p>`;
        }
        
        if (data.status) {
            const statusStr = Array.isArray(data.status) ? data.status.join(', ') : data.status;
            html += `<p><strong>Status</strong><span>${statusStr}</span></p>`;
        }
        
        if (data.nameservers && data.nameservers.length > 0) {
            const nsStr = Array.isArray(data.nameservers) ? data.nameservers.join(', ') : data.nameservers;
            html += `<p><strong>Nameservers</strong><span>${nsStr}</span></p>`;
        }

        // Show additional RDAP-specific information
        if (method === 'rdap' && data.entities && data.entities.length > 0) {
            const contacts = data.entities.filter(e => e.contact && e.contact.name);
            if (contacts.length > 0) {
                html += '<h5>Contacts</h5>';
                contacts.forEach(entity => {
                    if (entity.contact && entity.contact.name) {
                        const roleStr = entity.roles?.join(', ').toUpperCase() || 'CONTACT';
                        html += `<p><strong>${roleStr}</strong><span>${entity.contact.name}`;
                        if (entity.contact.organization) {
                            html += ` - ${entity.contact.organization}`;
                        }
                        html += '</span></p>';
                    }
                });
            }
        }
        
        resultEl.innerHTML = html;
        
        // Show raw data with better formatting
        rawDataEl.innerHTML = `
            <h4>RAW ${method.toUpperCase()} DATA</h4>
            <div class="timestamp">Timestamp: ${new Date(data.timestamp).toLocaleString()}</div>
            <pre>${JSON.stringify(data.rawData, null, 2)}</pre>
        `;
    }
});