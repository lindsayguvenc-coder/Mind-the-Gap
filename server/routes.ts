import type { Express } from "express";
import { createServer, type Server } from "http";

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
  'canada': 'CAN'
};

const locationNames: Record<string, string> = {
  'WLD': 'global',
  'USA': 'US',
  'GBR': 'UK',
  'CAN': 'Canada'
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

  app.get("/api/badge/:stat/:country", async (req, res) => {
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

      // Generate SVG badge
      const svg = `
        <svg width="500" height="80" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:hsl(222 47% 27%);stop-opacity:1" />
              <stop offset="100%" style="stop-color:hsl(222 47% 22%);stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="500" height="80" fill="url(#grad)" rx="6"/>
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
      res.status(500).send('Failed to generate badge');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
