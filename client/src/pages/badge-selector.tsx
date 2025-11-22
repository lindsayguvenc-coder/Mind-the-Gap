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
}

const statConfigs: Record<StatType, StatConfig> = {
  paygap: {
    title: 'Gender Pay Gap',
    icon: TrendingDown,
  },
  leadership: {
    title: 'Leadership Representation',
    icon: Users,
  },
  maternal: {
    title: 'Maternal Mortality Rate',
    icon: Heart,
  },
  healthcare: {
    title: 'Contraceptive Access',
    icon: AlertCircle,
  },
  workforce: {
    title: 'Workforce Participation',
    icon: Briefcase,
  },
};

const countryLabels: Record<CountryCode, string> = {
  global: 'Global',
  us: 'US',
  uk: 'UK',
  canada: 'Canada',
  france: 'France',
  germany: 'Germany',
  japan: 'Japan',
  australia: 'Australia',
  india: 'India',
  brazil: 'Brazil',
  mexico: 'Mexico',
  'south-africa': 'South Africa',
  sweden: 'Sweden',
  norway: 'Norway',
};

export default function BadgeSelector() {
  const [selectedStat, setSelectedStat] = useState<StatType>('paygap');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('global');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const { data: stats, isLoading, refetch, isFetching } = useQuery<AllStats>({
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
  const currentData = stats?.[selectedStat] || { value: '...', detail: 'Loading...' };
  const Icon = currentStatConfig.icon;

  const generateEmbedCode = () => {
    const badgeUrl = `${window.location.origin}/api/badge/${selectedStat}/${selectedCountry}`;
    const dashboardUrl = `${window.location.origin}/dashboard`;
    return `<a href="${dashboardUrl}" style="text-decoration:none;"><img src="${badgeUrl}" alt="Mind the Gap - ${currentStatConfig.title}" /></a>`;
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
          <h1 className="text-6xl font-bold mb-4" data-testid="text-badge-selector-title">Mind the Gap</h1>
          <p className="text-xl text-muted-foreground">Create your email signature badge</p>
          {stats?.lastUpdated && (
            <p className="text-sm text-muted-foreground mt-2" data-testid="text-last-updated">
              Data last updated: {new Date(stats.lastUpdated).toLocaleString()}
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
                      <div className="p-2 bg-primary rounded-lg">
                        <StatIcon className="w-5 h-5 text-primary-foreground" />
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
                Choose Your Location
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click on the location you want statistics for. "Global" shows worldwide data.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(Object.entries(countryLabels) as [CountryCode, string][]).map(([code, label]) => (
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
                  <span className="font-semibold uppercase">{label}</span>
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
              className={`p-6 rounded-lg bg-primary ${isLoading || isFetching ? 'opacity-50' : ''}`}
              data-testid="badge-preview"
            >
              <div className="flex items-center gap-4">
                <Icon className="w-8 h-8 text-primary-foreground" />
                <div className="flex-1">
                  <div className="text-primary-foreground/90 text-sm font-semibold mb-1">MIND THE GAP</div>
                  <div className="text-primary-foreground font-bold text-lg">{currentData.detail}</div>
                </div>
                <div className="text-4xl font-bold font-mono text-primary-foreground" data-testid="badge-value">
                  {currentData.value}
                </div>
              </div>
            </div>

            <div className="p-6 bg-primary/10 rounded-lg border border-primary/20">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Badge className="w-8 h-8 flex items-center justify-center font-bold p-0">4</Badge>
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

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Statistics update automatically every 24 hours with fresh data from official sources.
          </p>
        </div>
      </div>
    </div>
  );
}
