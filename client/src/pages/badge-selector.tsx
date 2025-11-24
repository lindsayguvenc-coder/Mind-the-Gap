import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingDown, Users, Heart, AlertCircle, Briefcase, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import type { AllStats, CountryCode, StatType } from '@shared/schema';
import type { LucideIcon } from 'lucide-react';

interface StatConfig {
  title: string;
  icon: LucideIcon;
  color: string;
  lightColor: string;
}

const statConfigs: Record<StatType, StatConfig> = {
  paygap: {
    title: 'Gender Pay Gap',
    icon: TrendingDown,
    color: '#5271bf',
    lightColor: '#e8ecf7',
  },
  leadership: {
    title: 'Leadership Representation',
    icon: Users,
    color: '#b573c3',
    lightColor: '#f5eef7',
  },
  maternal: {
    title: 'Maternal Mortality Rate',
    icon: Heart,
    color: '#fa7aab',
    lightColor: '#fef0f5',
  },
  healthcare: {
    title: 'Contraceptive Access',
    icon: AlertCircle,
    color: '#ff9686',
    lightColor: '#fff3f1',
  },
  workforce: {
    title: 'Workforce Participation',
    icon: Briefcase,
    color: '#ffc569',
    lightColor: '#fff8eb',
  },
};

const countryLabels: Record<CountryCode, string> = {
  global: 'Global',
  us: 'United States',
  uk: 'United Kingdom',
  canada: 'Canada',
  mexico: 'Mexico',
};

// Location options for comparison (excluding global)
const comparisonCountries: Exclude<CountryCode, 'global'>[] = ['us', 'uk', 'canada', 'mexico'];

export default function BadgeSelector() {
  const [selectedStat, setSelectedStat] = useState<StatType>('paygap');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('us');
  const [badgeFormat, setBadgeFormat] = useState<'png' | 'svg'>('png');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Fetch global stats
  const { data: globalStats, isLoading: globalLoading } = useQuery<AllStats>({
    queryKey: ['/api/stats', 'global'],
    queryFn: async () => {
      const response = await fetch(`/api/stats/global`);
      if (!response.ok) {
        throw new Error('Failed to fetch global statistics');
      }
      return response.json();
    },
  });

  // Fetch selected country stats
  const { data: localStats, isLoading: localLoading, refetch, isFetching } = useQuery<AllStats>({
    queryKey: ['/api/stats', selectedCountry],
    queryFn: async () => {
      const response = await fetch(`/api/stats/${selectedCountry}`);
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      return response.json();
    },
  });

  const currentStatConfig = statConfigs[selectedStat];
  const globalData = globalStats?.[selectedStat] || { value: '...', detail: 'Loading...' };
  const localData = localStats?.[selectedStat] || { value: '...', detail: 'Loading...' };
  const Icon = currentStatConfig.icon;
  const isLoading = globalLoading || localLoading;

  const generateEmbedCode = () => {
    const endpoint = badgeFormat === 'png' ? 'badge-png' : 'badge';
    const badgeUrl = `${window.location.origin}/api/${endpoint}/${selectedStat}/global/${selectedCountry}`;
    const dashboardUrl = `${window.location.origin}/dashboard`;
    const titleText = `${currentStatConfig.title}: Global vs ${countryLabels[selectedCountry]} - Data from World Bank API, updates daily. Click to view Mind the Gap dashboard.`;
    return `<a href="${dashboardUrl}" style="text-decoration:none;"><img src="${badgeUrl}" alt="Mind the Gap - ${currentStatConfig.title}" title="${titleText}" /></a>`;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateEmbedCode());
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Embed code copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = async () => {
    try {
      await refetch();
      toast({
        title: 'Data refreshed',
        description: 'Statistics have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Refresh failed',
        description: 'Failed to refresh data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-8 lg:px-8 lg:py-12">
        <header className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-2" data-testid="text-badge-selector-title">Mind the Gap</h1>
          <p className="text-lg text-muted-foreground italic mb-4" data-testid="text-tagline">Mind it. Measure it. Move it.</p>
          <p className="text-xl text-muted-foreground">Create your email signature badge</p>
          {localStats?.lastUpdated && (
            <p className="text-sm text-muted-foreground mt-2" data-testid="text-last-updated">
              Data last updated: {new Date(localStats.lastUpdated).toLocaleString()}
            </p>
          )}
        </header>

        <Card className="p-8">
          <div className="space-y-8">
            <div className="p-6 bg-primary/10 rounded-lg border border-primary/20">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Badge className="w-8 h-8 flex items-center justify-center font-bold p-0">1</Badge>
                Choose Which Statistic to Display
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click on one of the boxes below to select what information you want to show in your email signature.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.entries(statConfigs) as [StatType, StatConfig][]).map(([key, config]) => {
                const StatIcon = config.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedStat(key)}
                    className={`p-4 rounded-lg border-2 transition-all text-left hover-elevate ${
                      selectedStat === key
                        ? 'border-primary bg-accent'
                        : 'border-border'
                    }`}
                    data-testid={`button-select-stat-${key}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: config.color }}>
                        <StatIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold">{config.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-6 bg-primary/10 rounded-lg border border-primary/20">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Badge className="w-8 h-8 flex items-center justify-center font-bold p-0">2</Badge>
                Choose Comparison Location
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your badge will show Global data compared to your selected location.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              {comparisonCountries.map((code) => (
                <button
                  key={code}
                  onClick={() => setSelectedCountry(code)}
                  className={`p-4 rounded-lg border-2 transition-all hover-elevate ${
                    selectedCountry === code
                      ? 'border-primary bg-accent'
                      : 'border-border'
                  }`}
                  data-testid={`button-select-country-${code}`}
                >
                  <span className="font-semibold">{countryLabels[code]}</span>
                </button>
              ))}
            </div>

            <div className="p-6 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Badge className="w-8 h-8 flex items-center justify-center font-bold p-0">3</Badge>
                  Preview Your Badge
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRefresh}
                  disabled={isFetching}
                  className="gap-1"
                  data-testid="button-refresh-preview"
                >
                  <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                This is what your badge will look like. It will appear in your email signature and updates automatically.
              </p>
            </div>
            
            <div 
              className={`p-6 rounded-lg ${isLoading || isFetching ? 'opacity-50' : ''}`}
              style={{ backgroundColor: currentStatConfig.color }}
              data-testid="badge-preview"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-6 h-6 text-white" />
                  <div className="text-white/90 text-sm font-semibold">MIND THE GAP</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-white/80 text-xs font-semibold mb-1">GLOBAL</div>
                    <div className="text-white font-bold text-2xl font-mono" data-testid="badge-value-global">
                      {globalData.value}
                    </div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-white/80 text-xs font-semibold mb-1 uppercase">{countryLabels[selectedCountry]}</div>
                    <div className="text-white font-bold text-2xl font-mono" data-testid="badge-value-local">
                      {localData.value}
                    </div>
                  </div>
                </div>
                
                <div className="text-white/90 text-sm font-medium">
                  {currentStatConfig.title}
                </div>
              </div>
            </div>

            <div className="p-6 bg-primary/10 rounded-lg border border-primary/20">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Badge className="w-8 h-8 flex items-center justify-center font-bold p-0">4</Badge>
                Choose Format
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                PNG works in email signatures (Gmail, Outlook, etc.). SVG is better for websites and blogs.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setBadgeFormat('png')}
                className={`p-6 rounded-lg border-2 transition-all text-left hover-elevate ${
                  badgeFormat === 'png'
                    ? 'border-primary bg-accent'
                    : 'border-border'
                }`}
                data-testid="button-select-format-png"
              >
                <div className="font-bold text-lg mb-2">PNG</div>
                <div className="text-sm text-muted-foreground">For Email Signatures</div>
                <div className="text-xs text-muted-foreground mt-1">Gmail, Outlook, Apple Mail</div>
              </button>
              <button
                onClick={() => setBadgeFormat('svg')}
                className={`p-6 rounded-lg border-2 transition-all text-left hover-elevate ${
                  badgeFormat === 'svg'
                    ? 'border-primary bg-accent'
                    : 'border-border'
                }`}
                data-testid="button-select-format-svg"
              >
                <div className="font-bold text-lg mb-2">SVG</div>
                <div className="text-sm text-muted-foreground">For Websites & Blogs</div>
                <div className="text-xs text-muted-foreground mt-1">WordPress, GitHub, etc.</div>
              </button>
            </div>

            <div className="p-6 bg-primary/10 rounded-lg border border-primary/20">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Badge className="w-8 h-8 flex items-center justify-center font-bold p-0">5</Badge>
                Copy the Code
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click the "Copy Embed Code" button below. This will copy the code you need to paste into your email signature settings.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={copyToClipboard}
                className="flex-1 gap-2 text-lg py-6"
                data-testid="button-copy-code"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Code Copied to Clipboard!' : 'Copy Embed Code'}
              </Button>
              
              <Link href="/dashboard">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto py-6"
                  data-testid="button-view-all-stats"
                >
                  View All Statistics
                </Button>
              </Link>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg border font-mono text-xs overflow-x-auto" data-testid="embed-code-preview">
              <code className="text-muted-foreground break-all">
                {generateEmbedCode()}
              </code>
            </div>
          </div>
        </Card>

        <Card className="mt-8 p-8 bg-muted/30">
          <h2 className="text-xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground mb-4">
            Mind the Gap exists to make women's issues impossible to ignore.
          </p>
          <p className="text-muted-foreground mb-4">
            We believe that progress requires measurement, and measurement requires visibility. By transforming critical statistics into shareable badges, we empower individuals and organizations to keep gender inequality in focus—in email signatures, on websites, in social media, and everywhere voices are heard.
          </p>
          <p className="text-muted-foreground italic font-medium">
            Mind it. Measure it. Move it.
          </p>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Statistics update automatically every 24 hours with fresh data from official sources.
          </p>
        </div>
      </div>
    </div>
  );
}
