/**
 * Zero-Trust SSRF Protection & Hostname Validator
 * Edge-compatible (100% Web Standards compliant, no Node.js built-ins)
 */

export interface SSRFValidationResult {
  safe: boolean;
  error?: string;
  parsedUrl?: URL;
}

// RFC 1918, RFC 3927, RFC 6598, Loopback, Multicast and Reserved IPv4 Subnets
interface IPv4Subnet {
  network: number; // 32-bit unsigned int
  mask: number;    // 32-bit unsigned int
  name: string;
}

function ipToNumber(a: number, b: number, c: number, d: number): number {
  return (((a << 24) >>> 0) + ((b << 16) >>> 0) + ((c << 8) >>> 0) + (d >>> 0)) >>> 0;
}

function cidrToSubnet(ipStr: string, prefixLen: number, name: string): IPv4Subnet {
  const parts = ipStr.split('.').map(p => parseInt(p, 10));
  const network = ipToNumber(parts[0], parts[1], parts[2], parts[3]);
  const mask = prefixLen === 0 ? 0 : (~0 << (32 - prefixLen)) >>> 0;
  return { network, mask, name };
}

const BLOCKED_IPV4_SUBNETS: IPv4Subnet[] = [
  cidrToSubnet('0.0.0.0', 8, 'Current Network (RFC 1122)'),
  cidrToSubnet('10.0.0.0', 8, 'Private Network (RFC 1918)'),
  cidrToSubnet('100.64.0.0', 10, 'Carrier-Grade NAT (RFC 6598)'),
  cidrToSubnet('127.0.0.0', 8, 'Loopback (RFC 1122)'),
  cidrToSubnet('169.254.0.0', 16, 'Link-Local / Cloud Metadata (RFC 3927)'),
  cidrToSubnet('172.16.0.0', 12, 'Private Network (RFC 1918)'),
  cidrToSubnet('192.0.0.0', 24, 'IETF Protocol Assignments (RFC 6890)'),
  cidrToSubnet('192.0.2.0', 24, 'TEST-NET-1 (RFC 5737)'),
  cidrToSubnet('192.88.99.0', 24, '6to4 Relay Anycast (RFC 7526)'),
  cidrToSubnet('192.168.0.0', 16, 'Private Network (RFC 1918)'),
  cidrToSubnet('198.18.0.0', 15, 'Network Interconnect Benchmark (RFC 2544)'),
  cidrToSubnet('198.51.100.0', 24, 'TEST-NET-2 (RFC 5737)'),
  cidrToSubnet('203.0.113.0', 24, 'TEST-NET-3 (RFC 5737)'),
  cidrToSubnet('224.0.0.0', 4, 'Multicast (RFC 5771)'),
  cidrToSubnet('240.0.0.0', 4, 'Reserved for Future Use (RFC 1112)'),
  cidrToSubnet('255.255.255.255', 32, 'Broadcast (RFC 919)')
];

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
  'metadata.internal',
  'instance-data',
  'metadata',
  '169.254.169.254',
  '100.100.100.200',
  '169.254.170.2',
  'kubernetes.default.svc'
]);

const BLOCKED_TLD_SUFFIXES = [
  '.local',
  '.internal',
  '.lan',
  '.corp',
  '.home',
  '.intranet',
  '.arpa',
  '.onion',
  '.localhost',
  '.invalid',
  '.test'
];

/**
 * Attempts to parse numeric/octal/hex/dotted-quad IPv4 representations
 * and returns the 32-bit unsigned integer if valid.
 */
function tryParseIPv4(host: string): number | null {
  // Check if string is pure integer (e.g. 2130706433 or 0x7f000001)
  if (/^0x[0-9a-f]+$/i.test(host)) {
    const val = parseInt(host, 16);
    if (!isNaN(val) && val >= 0 && val <= 0xffffffff) {
      return val >>> 0;
    }
  }

  if (/^\d+$/.test(host)) {
    const val = parseInt(host, 10);
    if (!isNaN(val) && val >= 0 && val <= 0xffffffff) {
      return val >>> 0;
    }
  }

  // Dotted notation: 1 to 4 parts
  const parts = host.split('.');
  if (parts.length >= 1 && parts.length <= 4) {
    const nums: number[] = [];
    for (const part of parts) {
      let partVal: number;
      if (/^0x[0-9a-f]+$/i.test(part)) {
        partVal = parseInt(part, 16);
      } else if (/^0\d+$/.test(part)) {
        partVal = parseInt(part, 8); // Octal
      } else if (/^\d+$/.test(part)) {
        partVal = parseInt(part, 10);
      } else {
        return null; // Contains non-numeric characters, likely a domain name
      }

      if (isNaN(partVal) || partVal < 0) return null;
      nums.push(partVal);
    }

    if (parts.length === 4) {
      if (nums.every(n => n <= 255)) {
        return ipToNumber(nums[0], nums[1], nums[2], nums[3]);
      }
    } else if (parts.length === 3) {
      if (nums[0] <= 255 && nums[1] <= 255 && nums[2] <= 0xffff) {
        return (((nums[0] << 24) >>> 0) + ((nums[1] << 16) >>> 0) + (nums[2] >>> 0)) >>> 0;
      }
    } else if (parts.length === 2) {
      if (nums[0] <= 255 && nums[1] <= 0xffffff) {
        return (((nums[0] << 24) >>> 0) + (nums[1] >>> 0)) >>> 0;
      }
    } else if (parts.length === 1) {
      if (nums[0] <= 0xffffffff) {
        return nums[0] >>> 0;
      }
    }
  }

  return null;
}

/**
 * Validates whether an IPv6 host represents loopback, link-local, or private ranges
 */
function isBlockedIPv6(rawHost: string): boolean {
  // Strip brackets if present
  let host = rawHost.replace(/^\[|\]$/g, '').toLowerCase();

  // Check IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1 or WHATWG canonical ::ffff:7f00:1)
  if (host.startsWith('::ffff:')) {
    const rest = host.slice(7);
    let ipv4Val: number | null = null;

    if (rest.includes('.')) {
      ipv4Val = tryParseIPv4(rest);
    } else if (rest.includes(':')) {
      const parts = rest.split(':');
      if (parts.length === 2) {
        const h1 = parseInt(parts[0], 16);
        const h2 = parseInt(parts[1], 16);
        if (!isNaN(h1) && !isNaN(h2)) {
          ipv4Val = (((h1 & 0xffff) << 16) + (h2 & 0xffff)) >>> 0;
        }
      }
    } else {
      const val = parseInt(rest, 16);
      if (!isNaN(val)) ipv4Val = val >>> 0;
    }

    if (ipv4Val !== null) {
      for (const subnet of BLOCKED_IPV4_SUBNETS) {
        if (((ipv4Val & subnet.mask) >>> 0) === subnet.network) {
          return true;
        }
      }
    }
  }

  // Loopback (::1) or Unspecified (::)
  if (host === '::1' || host === '::') return true;

  // Unique local addresses (fc00::/7 -> fc.. or fd..)
  if (host.startsWith('fc') || host.startsWith('fd')) return true;

  // Link-local addresses (fe80::/10)
  if (host.startsWith('fe8') || host.startsWith('fe9') || host.startsWith('fea') || host.startsWith('feb')) return true;

  // Multicast (ff00::/8)
  if (host.startsWith('ff')) return true;

  return false;
}

/**
 * Validates a feed URL against comprehensive SSRF attack vectors.
 * Returns safe: true if the URL passes all security gates.
 */
export function validateSafeFeedUrl(urlStr: string): SSRFValidationResult {
  if (!urlStr || typeof urlStr !== 'string') {
    return { safe: false, error: 'Feed URL must be a non-empty string.' };
  }

  const trimmed = urlStr.trim();
  if (trimmed.length > 2048) {
    return { safe: false, error: 'Feed URL exceeds maximum permitted length (2048 characters).' };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { safe: false, error: 'Invalid URL format. Please provide a well-formed URL.' };
  }

  // Gate 1: Strict HTTPS Protocol Requirement
  if (parsed.protocol !== 'https:') {
    return { 
      safe: false, 
      error: `Insecure protocol "${parsed.protocol}". Custom feeds must strictly use HTTPS (https://).` 
    };
  }

  // Gate 2: Disallow embedded user credentials (user:pass@)
  if (parsed.username || parsed.password) {
    return { safe: false, error: 'URL authentication credentials are not permitted in feed URLs.' };
  }

  // Gate 3: Port Restriction (strictly 443 or default HTTPS)
  if (parsed.port && parsed.port !== '443') {
    return { 
      safe: false, 
      error: `Non-standard port ":${parsed.port}" blocked. External feeds must use standard HTTPS (port 443).` 
    };
  }

  const rawHost = parsed.hostname.toLowerCase();

  // Gate 4: Empty or Malformed Host
  if (!rawHost || rawHost === '.' || rawHost.includes('..')) {
    return { safe: false, error: 'Malformed hostname in feed URL.' };
  }

  // Gate 5: Blacklisted Hostnames & Cloud Metadata
  if (BLOCKED_HOSTNAMES.has(rawHost) || BLOCKED_HOSTNAMES.has(rawHost.replace(/\.$/, ''))) {
    return { safe: false, error: 'Access to internal infrastructure or cloud metadata endpoints is prohibited.' };
  }

  // Gate 6: Blocked Internal / Reserved TLD Suffixes
  for (const suffix of BLOCKED_TLD_SUFFIXES) {
    if (rawHost.endsWith(suffix)) {
      return { 
        safe: false, 
        error: `Host with private/internal TLD "${suffix}" is prohibited.` 
      };
    }
  }

  // Gate 7: IPv6 Subnet and Mapping Inspection
  if (rawHost.includes(':')) {
    if (isBlockedIPv6(rawHost)) {
      return { 
        safe: false, 
        error: 'Target host resolves to a loopback, link-local, or private IPv6 range.' 
      };
    }
  }

  // Gate 8: IPv4 Numerical / Subnet Filtering
  const ipv4Num = tryParseIPv4(rawHost);
  if (ipv4Num !== null) {
    for (const subnet of BLOCKED_IPV4_SUBNETS) {
      if (((ipv4Num & subnet.mask) >>> 0) === subnet.network) {
        return { 
          safe: false, 
          error: `Target IP address falls within prohibited range: ${subnet.name}.` 
        };
      }
    }
  }

  // Gate 9: Domain structure validation (must have a valid domain dot if not an IP)
  if (ipv4Num === null && !rawHost.includes(':')) {
    if (!rawHost.includes('.')) {
      return { 
        safe: false, 
        error: 'Single-label internal hostnames are prohibited.' 
      };
    }
  }

  return { safe: true, parsedUrl: parsed };
}
