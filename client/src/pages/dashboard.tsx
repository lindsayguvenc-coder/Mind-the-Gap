import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingDown, Users, Heart, AlertCircle, Briefcase, RefreshCw, ChevronDown, ChevronUp, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { AllStats, CountryCode, StatType } from '@shared/schema';
import type { LucideIcon } from 'lucide-react';

interface TrendDataPoint {
  year: string;
  value: number;
  countryName: string;
}

interface TrendResponse {
  stat: string;
  country: string;
  data: TrendDataPoint[];
  indicator: string;
  lastUpdated: string;
}

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

interface StatCardProps {
  statKey: StatType;
  config: StatConfig;
  data: { value: string; detail: string; year?: string; source?: string };
  Icon: LucideIcon;
  selectedCountry: CountryCode;
  isExpanded: boolean;
  onToggle: () => void;
}

function StatCard({ statKey, config, data, Icon, selectedCountry, isExpanded, onToggle }: StatCardProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { toast } = useToast();
  const { data: trendData, isLoading: trendLoading } = useQuery<TrendResponse>({
    queryKey: ['/api/trends', statKey, selectedCountry],
    queryFn: async () => {
      const response = await fetch(`/api/trends/${statKey}/${selectedCountry}`);
      if (!response.ok) {
        throw new Error('Failed to fetch trend data');
      }
      return response.json();
    },
    enabled: isExpanded,
  });

  const shareUrl = `${window.location.origin}/api/share/${statKey}/${selectedCountry}`;
  const dashboardUrl = `${window.location.origin}/dashboard`;
  
  const handleShare = (platform: 'twitter' | 'linkedin' | 'facebook' | 'copy') => {
    const text = `${config.title}: ${data.value} - Mind the Gap Gender Equality Statistics`;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(dashboardUrl)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(dashboardUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(dashboardUrl)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: 'Link copied!',
          description: 'Share card URL copied to clipboard.',
        });
        setShowShareDialog(false);
        break;
    }
  };

  return (
    <>
      <Card 
        className="p-8 hover-elevate"
        data-testid={`card-stat-${statKey}`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg" style={{ backgroundColor: config.color }}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold">{config.title}</h3>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowShareDialog(true)}
              data-testid={`button-share-${statKey}`}
            >
              <Share2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              data-testid={`button-toggle-trend-${statKey}`}
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      
      <div className="space-y-2">
        <div 
          className="text-6xl font-bold font-mono mb-4" 
          data-testid={`text-value-${statKey}`}
        >
          {data.value}
        </div>
        <p className="text-sm" data-testid={`text-detail-${statKey}`}>
          {data.detail}
        </p>
        {data.source && (
          <p className="text-xs text-muted-foreground opacity-70" data-testid={`text-source-${statKey}`}>
            Source: {data.source}
          </p>
        )}
      </div>

      {isExpanded && (
        <div className="mt-6 pt-6 border-t">
          <h4 className="text-sm font-semibold mb-4">Historical Trend (2015-2024)</h4>
          {trendLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          ) : trendData && trendData.data.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData.data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="year" 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis 
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={config.color} 
                  strokeWidth={2}
                  dot={{ fill: config.color }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>No historical data available</p>
            </div>
          )}
        </div>
      )}
      </Card>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share {config.title}</DialogTitle>
            <DialogDescription>
              Share this statistic on social media or copy the share card link
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="aspect-[1200/630] bg-muted rounded-lg overflow-hidden">
              <img src={shareUrl} alt="Share preview" className="w-full h-full object-cover" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => handleShare('twitter')} 
                variant="outline" 
                className="gap-2"
                data-testid={`button-share-twitter-${statKey}`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Twitter
              </Button>
              <Button 
                onClick={() => handleShare('linkedin')} 
                variant="outline" 
                className="gap-2"
                data-testid={`button-share-linkedin-${statKey}`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </Button>
              <Button 
                onClick={() => handleShare('facebook')} 
                variant="outline" 
                className="gap-2"
                data-testid={`button-share-facebook-${statKey}`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
              <Button 
                onClick={() => handleShare('copy')} 
                variant="outline" 
                className="gap-2"
                data-testid={`button-share-copy-${statKey}`}
              >
                <Download className="w-4 h-4" />
                Copy Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function Dashboard() {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('global');
  const [expandedCards, setExpandedCards] = useState<Set<StatType>>(new Set());
  const { toast } = useToast();

  const toggleCard = (stat: StatType) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stat)) {
        newSet.delete(stat);
      } else {
        newSet.add(stat);
      }
      return newSet;
    });
  };

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

  const handleExport = (format: 'json' | 'csv') => {
    const url = `/api/export/${selectedCountry}?format=${format}`;
    window.location.href = url;
    toast({
      title: 'Export started',
      description: `Downloading data as ${format.toUpperCase()}...`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8 lg:px-8 lg:py-12">
        <header className="mb-12 border-b pb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2" data-testid="text-dashboard-title">Mind the Gap</h1>
              <p className="text-lg text-muted-foreground italic" data-testid="text-tagline">Mind it. Measure it. Move it.</p>
              <p className="text-lg text-muted-foreground">
                Global & Local Women's Rights Statistics
              </p>
              {stats?.lastUpdated && (
                <p className="text-sm text-muted-foreground mt-2" data-testid="text-last-updated">
                  Last updated: {new Date(stats.lastUpdated).toLocaleString()}
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedCountry} onValueChange={(value) => setSelectedCountry(value as CountryCode)}>
                <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(countryLabels).map(([code, label]) => (
                    <SelectItem key={code} value={code} data-testid={`option-country-${code}`}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                onClick={handleRefresh}
                disabled={isFetching}
                className="gap-2"
                data-testid="button-refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh Data
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2" data-testid="button-export">
                    <Download className="w-4 h-4" />
                    Export Data
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport('json')} data-testid="button-export-json">
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('csv')} data-testid="button-export-csv">
                    Export as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link href="/badge">
                <Button variant="outline" data-testid="button-create-badge">
                  Create Badge
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="loading-skeleton">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <Skeleton className="h-6 w-48" />
                </div>
                <Skeleton className="h-16 w-32 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-3 w-3/4" />
              </Card>
            ))}
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(Object.entries(statConfigs) as [StatType, StatConfig][]).map(([key, config]) => {
                const Icon = config.icon;
                const data = stats[key];
                const isExpanded = expandedCards.has(key);
                
                return (
                  <StatCard
                    key={key}
                    statKey={key}
                    config={config}
                    data={data}
                    Icon={Icon}
                    selectedCountry={selectedCountry}
                    isExpanded={isExpanded}
                    onToggle={() => toggleCard(key)}
                  />
                );
              })}
            </div>

            <Card className="mt-12 p-8">
              <h2 className="text-2xl font-bold mb-4">About Mind the Gap</h2>
              <p className="text-muted-foreground mb-4">
                Mind the Gap is a real-time statistics tracker highlighting ongoing disparities in women's rights, 
                economic equality, and healthcare access worldwide. Data automatically refreshes every 24 hours.
              </p>
              <p className="text-sm text-muted-foreground">
                Data sourced from World Bank, WHO, ILO, and UN agencies. Statistics represent the most recent available data.
              </p>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}
