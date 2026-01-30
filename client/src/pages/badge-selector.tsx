import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingDown, Users, Heart, AlertCircle, Briefcase, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
    color: '#6e6cbf',
    lightColor: '#ececf7',
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
    color: '#ffc569',
    lightColor: '#fff8eb',
  },
  workforce: {
    title: 'Workforce Participation',
    icon: Briefcase,
    color: '#ff9686',
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
    const homepageUrl = `${window.location.origin}/`;
    const titleText = `${currentStatConfig.title}: Global vs ${countryLabels[selectedCountry]} - Data from World Bank API, updates daily. Click to visit Mind the Gap.`;
    return `<a href="${homepageUrl}" style="text-decoration:none;"><img src="${badgeUrl}" alt="Mind the Gap - ${currentStatConfig.title}" title="${titleText}" /></a>`;
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
          <h1 className="text-6xl font-bold mb-2 tracking-wide" data-testid="text-badge-selector-title">
            Mind the <span style={{ color: '#ff9686' }}>Gap</span>
          </h1>
          <p className="text-2xl font-bold italic tracking-wide mb-4" data-testid="text-tagline">
            <span style={{ color: '#5271bf' }}>Mind it.</span>{' '}
            <span style={{ color: '#b573c3' }}>Measure it.</span>{' '}
            <span style={{ color: '#fa7aab' }}>Move it.</span>
          </p>
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
              className={`rounded-lg overflow-hidden ${isLoading || isFetching ? 'opacity-50' : ''}`}
              data-testid="badge-preview"
            >
              {/* Colored top section - matches actual badge */}
              <div 
                className="p-5 pb-6"
                style={{ backgroundColor: currentStatConfig.color }}
              >
                {/* Header with branding */}
                <div className="text-white/90 text-xs font-semibold tracking-widest mb-4">
                  MIND THE <span style={{ color: '#ff9686' }}>GAP</span>
                </div>
                
                {/* Two-column comparison */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/15 rounded p-3">
                    <div className="text-white/80 text-xs font-semibold mb-1">GLOBAL</div>
                    <div className="text-white font-bold text-2xl font-mono" data-testid="badge-value-global">
                      {globalData.value}
                    </div>
                  </div>
                  
                  <div className="bg-white/15 rounded p-3">
                    <div className="text-white/80 text-xs font-semibold mb-1 uppercase">{countryLabels[selectedCountry]}</div>
                    <div className="text-white font-bold text-2xl font-mono" data-testid="badge-value-local">
                      {localData.value}
                    </div>
                  </div>
                </div>
                
                {/* Statistic title and source */}
                <div className="space-y-1">
                  <div className="text-white/90 text-sm font-medium">
                    {currentStatConfig.title}
                  </div>
                  <div className="text-white/60 text-xs">
                    Source: {globalData.source || 'Various'}
                  </div>
                </div>
              </div>

              {/* White background section with tagline */}
              <div className="bg-white py-2 text-center">
                <div className="text-white text-xs font-bold italic tracking-wide">
                  Mind it. Measure it. Move it.
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

        <Card className="mt-8 p-8">
          <h2 className="text-2xl font-bold mb-6">How to Use Your Badge</h2>
          <p className="text-muted-foreground mb-6">
            Follow these platform-specific instructions to add your badge to email signatures, websites, and more.
          </p>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="gmail" data-testid="accordion-gmail">
              <AccordionTrigger className="text-lg font-semibold">
                Gmail Signature
              </AccordionTrigger>
              <AccordionContent className="text-sm space-y-4 pt-4">
                <div>
                  <p className="font-semibold mb-2">Step 1: Access Gmail Settings</p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Open Gmail and click the <strong>Settings gear icon</strong> in the top-right</li>
                    <li>Select <strong>See all settings</strong></li>
                    <li>Under the <strong>General tab</strong>, scroll to the <strong>Signature section</strong></li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-2">Step 2: Copy the Badge Embed Code</p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Use PNG format (selected by default above) for best email client compatibility</li>
                    <li>Click the <strong>Copy Embed Code</strong> button above</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-2">Step 3: Add to Your Signature</p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>In the signature editor, position your cursor where you want the badge</li>
                    <li>Click the <strong>Insert Image icon</strong> in the toolbar</li>
                    <li>Paste the badge URL from the embed code (the URL between the src attribute quotes)</li>
                    <li>Click <strong>Insert</strong></li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-2">Step 4: Make it Clickable</p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Click to select the badge image in your signature</li>
                    <li>Click the <strong>Link icon</strong> in the toolbar</li>
                    <li>Paste the homepage URL from the embed code</li>
                    <li>Click <strong>OK</strong>, then <strong>Save Changes</strong> at the bottom</li>
                  </ul>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Pro Tip:</strong> PNG format ensures your badge displays correctly in Gmail, Apple Mail, and other email clients that don't support SVG.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="outlook" data-testid="accordion-outlook">
              <AccordionTrigger className="text-lg font-semibold">
                Outlook Signature
              </AccordionTrigger>
              <AccordionContent className="text-sm space-y-4 pt-4">
                <div>
                  <p className="font-semibold mb-2">Step 1: Get Your Badge Image</p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Copy the badge URL from the embed code above (the long URL in the src attribute)</li>
                    <li>Open that URL in a new browser tab - the PNG badge will display</li>
                    <li>Right-click the badge image and select <strong>Save image as</strong></li>
                    <li>Save it to your computer (for example, mind-the-gap-badge.png)</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-2">Step 2: For Outlook Web / Microsoft 365</p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Click the <strong>Settings gear icon</strong> then <strong>View all Outlook settings</strong></li>
                    <li>Go to <strong>Mail then Compose and reply then Email signature</strong></li>
                    <li>Click <strong>Insert pictures inline</strong> button in signature editor</li>
                    <li>Upload your saved PNG badge file</li>
                    <li>Select the image, click the <strong>Link icon</strong>, and paste the homepage URL from the embed code</li>
                    <li>Click <strong>Save</strong></li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-2">Step 3: For Outlook Desktop (Windows/Mac)</p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Go to <strong>File then Options then Mail then Signatures</strong></li>
                    <li>Select your signature or create a new one</li>
                    <li>Click the <strong>Insert Picture icon</strong> in the signature editor</li>
                    <li>Browse and select your saved PNG badge file</li>
                    <li>Highlight the image, click the <strong>Link button</strong>, paste homepage URL from embed code</li>
                    <li>Click <strong>OK</strong> to save</li>
                  </ul>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Size Recommendation:</strong> The badge is 500x150 pixels. If it appears too large, right-click and resize to 250x75 or 200x60 pixels for email signatures.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="website" data-testid="accordion-website">
              <AccordionTrigger className="text-lg font-semibold">
                Website or Blog
              </AccordionTrigger>
              <AccordionContent className="text-sm space-y-4 pt-4">
                <div>
                  <p className="font-semibold mb-2">General HTML Websites</p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Copy the embed code using the button above</li>
                    <li>Paste it directly into your HTML where you want the badge (footer, sidebar, etc.)</li>
                    <li>The badge will automatically link to the dashboard when clicked</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-2">WordPress</p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Go to <strong>Appearance then Widgets</strong></li>
                    <li>Add a <strong>Custom HTML</strong> widget to your footer or sidebar</li>
                    <li>Paste the embed code and save</li>
                    <li><em>Alternative:</em> Use the block editor and insert a Custom HTML block</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-2">Other Platforms (Squarespace, Wix, Shopify)</p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Look for Embed Code or Custom HTML blocks in your editor</li>
                    <li>Paste the badge embed code</li>
                    <li>Most platforms support standard HTML img and link tags</li>
                  </ul>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>SVG or PNG?</strong> For websites, SVG provides better quality at any size and smaller file sizes. For email signatures, always use PNG format.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="tips" data-testid="accordion-tips">
              <AccordionTrigger className="text-lg font-semibold">
                Best Practices & Tips
              </AccordionTrigger>
              <AccordionContent className="text-sm space-y-4 pt-4">
                <div>
                  <p className="font-semibold mb-2">Format Selection</p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li><strong>PNG</strong> (Default): Best for email signatures - works in Gmail, Outlook, Apple Mail</li>
                    <li><strong>SVG</strong>: Best for websites - scales perfectly, smaller file size, crisp on all displays</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-2">Size Guidelines</p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Default: 500x150 pixels (500px wide, 150px tall)</li>
                    <li>Email signatures: Consider resizing to 250x75 or 200x60 for a more subtle appearance</li>
                    <li>Website footer: Full size (500x150) or customize with CSS width property</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-2">Accessibility</p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>The embed code includes descriptive alt text for screen readers</li>
                    <li>The badge automatically updates with fresh data every 24 hours</li>
                    <li>Clicking the badge takes visitors to Mind the Gap homepage</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold mb-2">Mobile Compatibility</p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Badges display correctly on mobile email clients</li>
                    <li>For responsive websites, consider adding CSS: <code className="bg-muted px-1 py-0.5 rounded">max-width: 100%; height: auto;</code></li>
                  </ul>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Data Updates:</strong> Your badge automatically fetches the latest statistics every 24 hours - no need to update the code!
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>

        <Card className="mt-8 p-8 bg-muted/30">
          <h2 className="text-xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground mb-4">
            Mind the Gap exists to make women's issues impossible to ignore.
          </p>
          <p className="text-muted-foreground mb-4">
            We believe that progress requires measurement, and measurement requires visibility. By transforming critical statistics into shareable badges, we empower individuals and organizations to keep gender inequality in focus—in email signatures, on websites, in social media, and everywhere voices are heard.
          </p>
          <p className="italic font-medium">
            <span style={{ color: '#5271bf' }}>Mind it.</span>{' '}
            <span style={{ color: '#b573c3' }}>Measure it.</span>{' '}
            <span style={{ color: '#fa7aab' }}>Move it.</span>
          </p>
        </Card>

        <div className="mt-8 text-center pb-8">
          <p className="text-sm text-muted-foreground mb-4">
            Statistics update automatically every 24 hours with fresh data from official sources.
          </p>
          <p className="text-sm text-muted-foreground mb-2">
            Learn more about the creator
          </p>
          <a 
            href="https://manif3stportfolio.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
            data-testid="link-portfolio"
          >
            View Portfolio →
          </a>
        </div>
      </div>
    </div>
  );
}
