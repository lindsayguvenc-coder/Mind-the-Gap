import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingDown, Users, Heart, AlertCircle, Briefcase, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
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
  us: 'United States',
  uk: 'United Kingdom',
  canada: 'Canada',
};

export default function Dashboard() {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>('global');
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
      <div className="max-w-7xl mx-auto px-6 py-8 lg:px-8 lg:py-12">
        <header className="mb-12 border-b pb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2" data-testid="text-dashboard-title">Mind the Gap</h1>
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
                
                return (
                  <Card 
                    key={key} 
                    className="p-8 hover-elevate"
                    data-testid={`card-stat-${key}`}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-primary rounded-lg">
                        <Icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold">{config.title}</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <div 
                        className="text-6xl font-bold font-mono mb-4" 
                        data-testid={`text-value-${key}`}
                      >
                        {data.value}
                      </div>
                      <p className="text-sm" data-testid={`text-detail-${key}`}>
                        {data.detail}
                      </p>
                      {data.source && (
                        <p className="text-xs text-muted-foreground opacity-70" data-testid={`text-source-${key}`}>
                          Source: {data.source}
                        </p>
                      )}
                    </div>
                  </Card>
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
