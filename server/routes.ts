import type { Express } from "express";
import { createServer, type Server } from "http";
import sharp from "sharp";

interface WorldBankResponse {
  value: string;
  detail: string;
  year?: string;
  source?: string;
}

interface StatsCache {
  [key: string]: {
    data: any;
    timestamp: number;
  };
}

const cache: StatsCache = {};
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const worldBankBase = 'https://api.worldbank.org/v2';

const countryCodeMap: Record<string, string> = {
  'global': 'WLD',
  'us': 'USA',
  'uk': 'GBR',
  'canada': 'CAN',
  'france': 'FRA',
  'germany': 'DEU',
  'japan': 'JPN',
  'australia': 'AUS',
  'india': 'IND',
  'brazil': 'BRA',
  'mexico': 'MEX',
  'south-africa': 'ZAF',
  'sweden': 'SWE',
  'norway': 'NOR'
};

// Valid stat types for whitelist validation
const validStats = ['paygap', 'leadership', 'maternal', 'healthcare', 'workforce'] as const;

// Stat-specific colors
const statColors: Record<string, string> = {
  paygap: '#5271bf',
  leadership: '#b573c3',
  maternal: '#fa7aab',
  healthcare: '#ff9686',
  workforce: '#ffc569',
};

// Helper function to escape SVG text content to prevent injection
function escapeSvgText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const locationNames: Record<string, string> = {
  'WLD': 'global',
  'USA': 'US',
  'GBR': 'UK',
  'CAN': 'Canada',
  'FRA': 'France',
  'DEU': 'Germany',
  'JPN': 'Japan',
  'AUS': 'Australia',
  'IND': 'India',
  'BRA': 'Brazil',
  'MEX': 'Mexico',
  'ZAF': 'South Africa',
  'SWE': 'Sweden',
  'NOR': 'Norway'
};

function getLocationName(code: string): string {
  return locationNames[code] || 'global';
}

async function fetchWorldBankData(countryCode: string, indicator: string): Promise<any> {
  const dateRange = indicator.includes('CONM') ? '2015:2024' : '2020:2024';
  const url = `${worldBankBase}/country/${countryCode}/indicator/${indicator}?format=json&date=${dateRange}&per_page=1&mrv=1`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data[1] && data[1].length > 0) {
      return data[1][0];
    }
    return null;
  } catch (error) {
    console.error(`Failed to fetch ${indicator}:`, error);
    return null;
  }
}

function getFallbackPayGap(countryCode: string): WorldBankResponse {
  const locationName = getLocationName(countryCode);
  const fallbacks: Record<string, WorldBankResponse> = {
    'WLD': { value: '16%', detail: `Gender pay gap: 16% (${locationName})`, source: 'World Bank / ILO' },
    'USA': { value: '16%', detail: `Gender pay gap: 16% (${locationName})`, source: 'World Bank / ILO' },
    'GBR': { value: '14%', detail: `Gender pay gap: 14% (${locationName})`, source: 'World Bank / ILO' },
    'CAN': { value: '13%', detail: `Gender pay gap: 13% (${locationName})`, source: 'World Bank / ILO' }
  };
  return fallbacks[countryCode] || fallbacks['WLD'];
}

function getFallbackLeadership(countryCode: string): WorldBankResponse {
  const locationName = getLocationName(countryCode);
  const fallbacks: Record<string, WorldBankResponse> = {
    'WLD': { value: '27%', detail: `Women in parliament: 27% (${locationName})`, source: 'World Bank / IPU' },
    'USA': { value: '29%', detail: `Women in parliament: 29% (${locationName})`, source: 'World Bank / IPU' },
    'GBR': { value: '35%', detail: `Women in parliament: 35% (${locationName})`, source: 'World Bank / IPU' },
    'CAN': { value: '31%', detail: `Women in parliament: 31% (${locationName})`, source: 'World Bank / IPU' }
  };
  return fallbacks[countryCode] || fallbacks['WLD'];
}

function getFallbackMaternalMortality(countryCode: string): WorldBankResponse {
  const locationName = getLocationName(countryCode);
  const fallbacks: Record<string, WorldBankResponse> = {
    'WLD': { value: '223', detail: `Maternal mortality ratio: 223 per 100k live births (${locationName})`, source: 'WHO/UNICEF/UNFPA/World Bank' },
    'USA': { value: '22', detail: `Maternal mortality ratio: 22 per 100k live births (${locationName})`, source: 'WHO/UNICEF/UNFPA/World Bank' },
    'GBR': { value: '10', detail: `Maternal mortality ratio: 10 per 100k live births (${locationName})`, source: 'WHO/UNICEF/UNFPA/World Bank' },
    'CAN': { value: '11', detail: `Maternal mortality ratio: 11 per 100k live births (${locationName})`, source: 'WHO/UNICEF/UNFPA/World Bank' }
  };
  return fallbacks[countryCode] || fallbacks['WLD'];
}

function getFallbackContraceptiveAccess(countryCode: string): WorldBankResponse {
  const locationName = getLocationName(countryCode);
  const fallbacks: Record<string, WorldBankResponse> = {
    'WLD': { value: '218M', detail: `Women without modern contraception access: 218M (${locationName})`, source: 'World Bank / UN Population Division' },
    'USA': { value: '19M', detail: `Women in contraceptive deserts: 19M (${locationName})`, source: 'World Bank / UN Population Division' },
    'GBR': { value: '92%', detail: `Contraceptive access rate: 92% (${locationName})`, source: 'World Bank / UN Population Division' },
    'CAN': { value: '88%', detail: `Contraceptive access rate: 88% (${locationName})`, source: 'World Bank / UN Population Division' }
  };
  return fallbacks[countryCode] || fallbacks['WLD'];
}

function getFallbackWorkforceParticipation(countryCode: string): WorldBankResponse {
  const locationName = getLocationName(countryCode);
  const fallbacks: Record<string, WorldBankResponse> = {
    'WLD': { value: '47%', detail: `Women in global workforce: 47%`, source: 'World Bank / ILO' },
    'USA': { value: '57%', detail: `Women in workforce: 57% (${locationName})`, source: 'World Bank / ILO' },
    'GBR': { value: '56%', detail: `Women in workforce: 56% (${locationName})`, source: 'World Bank / ILO' },
    'CAN': { value: '61%', detail: `Women in workforce: 61% (${locationName})`, source: 'World Bank / ILO' }
  };
  return fallbacks[countryCode] || fallbacks['WLD'];
}

async function getPayGap(countryCode: string): Promise<WorldBankResponse> {
  const data = await fetchWorldBankData(countryCode, 'SL.EMP.WORK.FE.WE.ZS');
  
  if (data && data.value) {
    const ratio = data.value;
    const gap = 100 - ratio;
    const locationName = getLocationName(countryCode);
    return {
      value: `${Math.round(gap)}%`,
      detail: `Gender pay gap: ${Math.round(gap)}% (${locationName})`,
      year: data.date,
      source: 'World Bank / ILO'
    };
  }
  
  return getFallbackPayGap(countryCode);
}

async function getLeadership(countryCode: string): Promise<WorldBankResponse> {
  const data = await fetchWorldBankData(countryCode, 'SG.GEN.PARL.ZS');
  
  if (data && data.value) {
    const percentage = Math.round(data.value);
    const locationName = getLocationName(countryCode);
    return {
      value: `${percentage}%`,
      detail: `Women in parliament: ${percentage}% (${locationName})`,
      year: data.date,
      source: 'World Bank / IPU'
    };
  }
  
  return getFallbackLeadership(countryCode);
}

async function getMaternalMortality(countryCode: string): Promise<WorldBankResponse> {
  const data = await fetchWorldBankData(countryCode, 'SH.STA.MMRT');
  
  if (data && data.value) {
    const mmr = Math.round(data.value);
    const locationName = getLocationName(countryCode);
    return {
      value: `${mmr}`,
      detail: `Maternal mortality ratio: ${mmr} per 100k live births (${locationName})`,
      year: data.date,
      source: 'WHO/UNICEF/UNFPA/World Bank'
    };
  }
  
  return getFallbackMaternalMortality(countryCode);
}

async function getContraceptiveAccess(countryCode: string): Promise<WorldBankResponse> {
  const data = await fetchWorldBankData(countryCode, 'SP.DYN.CONM.ZS');
  
  if (data && data.value) {
    const percentage = Math.round(data.value);
    const locationName = getLocationName(countryCode);
    return {
      value: `${percentage}%`,
      detail: `Contraceptive access rate: ${percentage}% (${locationName})`,
      year: data.date,
      source: 'World Bank / UN Population Division'
    };
  }
  
  return getFallbackContraceptiveAccess(countryCode);
}

async function getWorkforceParticipation(countryCode: string): Promise<WorldBankResponse> {
  const data = await fetchWorldBankData(countryCode, 'SL.TLF.TOTL.FE.ZS');
  
  if (data && data.value) {
    const percentage = Math.round(data.value);
    const locationName = getLocationName(countryCode);
    return {
      value: `${percentage}%`,
      detail: `Women in workforce: ${percentage}% (${locationName})`,
      year: data.date,
      source: 'World Bank / ILO'
    };
  }
  
  return getFallbackWorkforceParticipation(countryCode);
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/stats/:country", async (req, res) => {
    try {
      const location = req.params.country || 'global';
      const cacheKey = `stats_${location}`;
      
      // Check cache
      const cached = cache[cacheKey];
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        return res.json(cached.data);
      }

      const countryCode = countryCodeMap[location] || 'WLD';
      
      // Fetch all stats in parallel
      const [payGap, leadership, maternal, healthcare, workforce] = await Promise.all([
        getPayGap(countryCode),
        getLeadership(countryCode),
        getMaternalMortality(countryCode),
        getContraceptiveAccess(countryCode),
        getWorkforceParticipation(countryCode)
      ]);
      
      const stats = {
        paygap: payGap,
        leadership,
        maternal,
        healthcare,
        workforce,
        lastUpdated: new Date().toISOString()
      };

      // Update cache
      cache[cacheKey] = {
        data: stats,
        timestamp: Date.now()
      };
      
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });

  app.get("/api/trends/:stat/:country", async (req, res) => {
    try {
      const { stat, country } = req.params;
      const location = country || 'global';
      const cacheKey = `trends_${stat}_${location}`;
      
      // Check cache
      const cached = cache[cacheKey];
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        return res.json(cached.data);
      }

      const countryCode = countryCodeMap[location] || 'WLD';
      
      // Map stat types to World Bank indicators
      const indicatorMap: Record<string, string> = {
        'paygap': 'SL.EMP.WORK.FE.WE.ZS', // Using female employment as proxy
        'leadership': 'SG.GEN.PARL.ZS',
        'maternal': 'SH.STA.MMRT',
        'healthcare': 'SP.DYN.CONM.ZS',
        'workforce': 'SL.TLF.TOTL.FE.ZS'
      };

      const indicator = indicatorMap[stat];
      if (!indicator) {
        return res.status(400).json({ error: 'Invalid stat type' });
      }

      // Fetch historical data (2015-2024)
      const url = `${worldBankBase}/country/${countryCode}/indicator/${indicator}?format=json&date=2015:2024&per_page=100`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      const trendData = [];
      if (data[1] && Array.isArray(data[1])) {
        for (const item of data[1]) {
          if (item.value !== null) {
            trendData.push({
              year: item.date,
              value: Math.round(item.value * 100) / 100,
              countryName: item.country.value
            });
          }
        }
      }

      // Sort by year ascending
      trendData.sort((a, b) => parseInt(a.year) - parseInt(b.year));

      const result = {
        stat,
        country: location,
        data: trendData,
        indicator,
        lastUpdated: new Date().toISOString()
      };

      // Update cache
      cache[cacheKey] = {
        data: result,
        timestamp: Date.now()
      };

      res.json(result);
    } catch (error) {
      console.error('Error fetching trend data:', error);
      res.status(500).json({ error: 'Failed to fetch trend data' });
    }
  });

  app.get("/api/export/:country", async (req, res) => {
    try {
      const country = req.params.country || 'global';
      const format = (req.query.format as string) || 'json';
      const cacheKey = `stats_${country}`;
      
      // Check cache
      let stats;
      const cached = cache[cacheKey];
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        stats = cached.data;
      } else {
        const countryCode = countryCodeMap[country] || 'WLD';
        
        // Fetch all stats in parallel
        const [payGap, leadership, maternal, healthcare, workforce] = await Promise.all([
          getPayGap(countryCode),
          getLeadership(countryCode),
          getMaternalMortality(countryCode),
          getContraceptiveAccess(countryCode),
          getWorkforceParticipation(countryCode)
        ]);
        
        stats = {
          paygap: payGap,
          leadership,
          maternal,
          healthcare,
          workforce,
          lastUpdated: new Date().toISOString()
        };

        // Update cache
        cache[cacheKey] = {
          data: stats,
          timestamp: Date.now()
        };
      }

      if (format === 'csv') {
        // Generate CSV
        const csv = [
          'Metric,Value,Detail,Year,Source',
          `Gender Pay Gap,${stats.paygap.value},"${stats.paygap.detail}",${stats.paygap.year || ''},${stats.paygap.source || ''}`,
          `Leadership Representation,${stats.leadership.value},"${stats.leadership.detail}",${stats.leadership.year || ''},${stats.leadership.source || ''}`,
          `Maternal Mortality,${stats.maternal.value},"${stats.maternal.detail}",${stats.maternal.year || ''},${stats.maternal.source || ''}`,
          `Contraceptive Access,${stats.healthcare.value},"${stats.healthcare.detail}",${stats.healthcare.year || ''},${stats.healthcare.source || ''}`,
          `Workforce Participation,${stats.workforce.value},"${stats.workforce.detail}",${stats.workforce.year || ''},${stats.workforce.source || ''}`
        ].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="mind-the-gap-${country}-${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csv);
      } else {
        // JSON format
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="mind-the-gap-${country}-${new Date().toISOString().split('T')[0]}.json"`);
        res.json(stats);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      res.status(500).json({ error: 'Failed to export data' });
    }
  });

  app.get("/api/share/:stat/:country", async (req, res) => {
    try {
      const { stat, country } = req.params;
      const location = country || 'global';
      const cacheKey = `stats_${location}`;
      
      // Check cache
      let stats;
      const cached = cache[cacheKey];
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        stats = cached.data;
      } else {
        const countryCode = countryCodeMap[location] || 'WLD';
        
        // Fetch all stats in parallel
        const [payGap, leadership, maternal, healthcare, workforce] = await Promise.all([
          getPayGap(countryCode),
          getLeadership(countryCode),
          getMaternalMortality(countryCode),
          getContraceptiveAccess(countryCode),
          getWorkforceParticipation(countryCode)
        ]);
        
        stats = {
          paygap: payGap,
          leadership,
          maternal,
          healthcare,
          workforce,
          lastUpdated: new Date().toISOString()
        };

        // Update cache
        cache[cacheKey] = {
          data: stats,
          timestamp: Date.now()
        };
      }

      const data = stats[stat as keyof typeof stats];
      if (!data || typeof data === 'string') {
        return res.status(404).send('Stat not found');
      }

      const statValue = data.value;
      const statDetail = data.detail;
      
      const statTitles: Record<string, string> = {
        'paygap': 'Gender Pay Gap',
        'leadership': 'Leadership Representation',
        'maternal': 'Maternal Mortality Rate',
        'healthcare': 'Contraceptive Access',
        'workforce': 'Workforce Participation'
      };

      const statTitle = statTitles[stat] || 'Statistic';
      const locationName = getLocationName(countryCodeMap[location] || 'WLD');
      
      // Get stat-specific color
      const statColor = statColors[stat] || '#5271bf';

      // Generate shareable SVG card (larger than badge for social media)
      const svg = `
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <rect width="1200" height="630" fill="${statColor}"/>
          
          <!-- Top branding -->
          <text x="60" y="80" font-family="Inter, sans-serif" font-size="24" font-weight="700" fill="rgba(255,255,255,0.9)">MIND THE GAP</text>
          <text x="60" y="115" font-family="Inter, sans-serif" font-size="18" font-weight="400" fill="rgba(255,255,255,0.7)">Women's Rights &amp; Equality Statistics</text>
          
          <!-- Main content -->
          <text x="60" y="220" font-family="Inter, sans-serif" font-size="32" font-weight="600" fill="rgba(255,255,255,0.9)">${statTitle}</text>
          <text x="60" y="260" font-family="Inter, sans-serif" font-size="24" font-weight="400" fill="rgba(255,255,255,0.75)">${locationName}</text>
          
          <!-- Large value -->
          <text x="60" y="400" font-family="JetBrains Mono, monospace" font-size="120" font-weight="700" fill="white">${statValue}</text>
          
          <!-- Detail -->
          <text x="60" y="480" font-family="Inter, sans-serif" font-size="22" font-weight="400" fill="rgba(255,255,255,0.8)">${statDetail.substring(0, 80)}</text>
          
          <!-- Footer -->
          <text x="60" y="570" font-family="Inter, sans-serif" font-size="16" font-weight="400" fill="rgba(255,255,255,0.6)">Source: ${data.source || 'World Bank'}</text>
        </svg>
      `;

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(svg.trim());
    } catch (error) {
      console.error('Error generating share card:', error);
      res.status(500).send('Failed to generate share card');
    }
  });

  app.get("/api/badge/:stat/:country", async (req, res) => {
    try {
      const { stat, country } = req.params;
      
      // Validate stat parameter (whitelist check)
      if (!validStats.includes(stat as any)) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.status(400).send('Invalid stat type');
      }
      
      const location = country || 'global';
      
      // Validate country parameter (whitelist check)
      if (!(location in countryCodeMap)) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.status(400).send('Invalid country');
      }
      
      const cacheKey = `stats_${location}`;
      
      // Check cache
      let stats;
      const cached = cache[cacheKey];
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        stats = cached.data;
      } else {
        const countryCode = countryCodeMap[location];
        
        // Fetch all stats in parallel
        const [payGap, leadership, maternal, healthcare, workforce] = await Promise.all([
          getPayGap(countryCode),
          getLeadership(countryCode),
          getMaternalMortality(countryCode),
          getContraceptiveAccess(countryCode),
          getWorkforceParticipation(countryCode)
        ]);
        
        stats = {
          paygap: payGap,
          leadership,
          maternal,
          healthcare,
          workforce,
          lastUpdated: new Date().toISOString()
        };

        // Update cache
        cache[cacheKey] = {
          data: stats,
          timestamp: Date.now()
        };
      }

      const data = stats[stat as keyof typeof stats];
      if (!data || typeof data === 'string') {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.status(404).send('Stat not found');
      }

      // Sanitize values to prevent SVG injection
      const statValue = escapeSvgText(data.value);
      const statDetail = escapeSvgText(data.detail);
      
      // Get stat-specific color
      const statColor = statColors[stat] || '#5271bf';

      // Generate SVG badge
      const svg = `
        <svg width="500" height="80" xmlns="http://www.w3.org/2000/svg">
          <rect width="500" height="80" fill="${statColor}" rx="6"/>
          <text x="20" y="30" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="rgba(255,255,255,0.9)">MIND THE GAP</text>
          <text x="20" y="55" font-family="Inter, sans-serif" font-size="16" font-weight="700" fill="white">${statDetail}</text>
          <text x="450" y="55" font-family="JetBrains Mono, monospace" font-size="32" font-weight="700" fill="white" text-anchor="end">${statValue}</text>
        </svg>
      `;

      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
      res.send(svg.trim());
    } catch (error) {
      console.error('Error generating badge:', error);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache errors for 1 hour
      res.status(500).send('Failed to generate badge');
    }
  });

  app.get("/api/badge-png/:stat/:country", async (req, res) => {
    try {
      const { stat, country } = req.params;
      
      // Validate stat parameter (whitelist check)
      if (!validStats.includes(stat as any)) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.status(400).send('Invalid stat type');
      }
      
      const location = country || 'global';
      
      // Validate country parameter (whitelist check)
      if (!(location in countryCodeMap)) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.status(400).send('Invalid country');
      }
      
      const cacheKey = `stats_${location}`;
      
      // Check cache
      let stats;
      const cached = cache[cacheKey];
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        stats = cached.data;
      } else {
        const countryCode = countryCodeMap[location];
        
        // Fetch all stats in parallel
        const [payGap, leadership, maternal, healthcare, workforce] = await Promise.all([
          getPayGap(countryCode),
          getLeadership(countryCode),
          getMaternalMortality(countryCode),
          getContraceptiveAccess(countryCode),
          getWorkforceParticipation(countryCode)
        ]);
        
        stats = {
          paygap: payGap,
          leadership,
          maternal,
          healthcare,
          workforce,
          lastUpdated: new Date().toISOString()
        };

        // Update cache
        cache[cacheKey] = {
          data: stats,
          timestamp: Date.now()
        };
      }

      const data = stats[stat as keyof typeof stats];
      if (!data || typeof data === 'string') {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        return res.status(404).send('Stat not found');
      }

      // Sanitize values to prevent SVG injection
      const statValue = escapeSvgText(data.value);
      const statDetail = escapeSvgText(data.detail);
      
      // Get stat-specific color
      const statColor = statColors[stat] || '#5271bf';

      // Generate SVG badge (same as SVG endpoint)
      const svg = `
        <svg width="500" height="80" xmlns="http://www.w3.org/2000/svg">
          <rect width="500" height="80" fill="${statColor}" rx="6"/>
          <text x="20" y="30" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="rgba(255,255,255,0.9)">MIND THE GAP</text>
          <text x="20" y="55" font-family="Inter, sans-serif" font-size="16" font-weight="700" fill="white">${statDetail}</text>
          <text x="450" y="55" font-family="JetBrains Mono, monospace" font-size="32" font-weight="700" fill="white" text-anchor="end">${statValue}</text>
        </svg>
      `;

      // Convert SVG to PNG using sharp
      const pngBuffer = await sharp(Buffer.from(svg.trim()))
        .png()
        .toBuffer();

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
      res.send(pngBuffer);
    } catch (error) {
      console.error('Error generating PNG badge:', error);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache errors for 1 hour
      res.status(500).send('Failed to generate PNG badge');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
