import { Card } from '@/components/ui/card';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function DataSources() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8 lg:px-8 lg:py-12">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Data Sources</h1>
          <p className="text-xl text-muted-foreground">
            Transparency about where our statistics come from
          </p>
        </header>

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Our Approach</h2>
          <p className="text-muted-foreground mb-4">
            Mind the Gap combines real-time data from the World Bank Open Data API 
            with curated statistics from authoritative international organizations. 
            This hybrid approach ensures we always show the most accurate, up-to-date 
            information available.
          </p>
          <p className="text-muted-foreground">
            All data is cached for 24 hours and automatically refreshed. However, 
            the underlying source data updates on different schedules, so the year 
            shown represents when the data was collected by the original source.
          </p>
        </Card>

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Statistics & Sources</h2>
          
          <div className="space-y-6">
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="text-lg font-semibold mb-2">Gender Pay Gap</h3>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Source:</strong> ILO Global Wage Report, national statistics agencies
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Update Frequency:</strong> Annual
              </p>
              <p className="text-sm text-muted-foreground">
                The gender pay gap measures the difference in average earnings between 
                men and women. We use data from the International Labour Organization's 
                Global Wage Report and official national statistics agencies for the 
                most accurate country-specific figures.
              </p>
            </div>

            <div className="border-l-4 border-pink-500 pl-4">
              <h3 className="text-lg font-semibold mb-2">Leadership Representation</h3>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Source:</strong> World Bank / Inter-Parliamentary Union (IPU)
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Indicator Code:</strong> SG.GEN.PARL.ZS
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Update Frequency:</strong> Annual (after elections)
              </p>
              <p className="text-sm text-muted-foreground">
                This measures the proportion of seats held by women in national parliaments. 
                Data is collected by the Inter-Parliamentary Union and distributed through 
                the World Bank Open Data API.
              </p>
            </div>

            <div className="border-l-4 border-red-400 pl-4">
              <h3 className="text-lg font-semibold mb-2">Maternal Mortality Rate</h3>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Source:</strong> World Bank / WHO, UNICEF, UNFPA
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Indicator Code:</strong> SH.STA.MMRT
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Update Frequency:</strong> Every 2-3 years
              </p>
              <p className="text-sm text-muted-foreground">
                The maternal mortality ratio is the number of women who die from pregnancy-related 
                causes per 100,000 live births. This is a joint estimate produced by WHO, UNICEF, 
                UNFPA, and the World Bank Group.
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h3 className="text-lg font-semibold mb-2">Contraceptive Access</h3>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Source:</strong> UN Population Division, CDC, national health surveys
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Update Frequency:</strong> Every 1-3 years
              </p>
              <p className="text-sm text-muted-foreground">
                This shows the percentage of women (ages 15-49) using modern contraceptive 
                methods. Data comes from the UN Population Division's World Contraceptive Use 
                database and national health surveys.
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="text-lg font-semibold mb-2">Workforce Participation</h3>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Source:</strong> World Bank / International Labour Organization (ILO)
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Indicator Code:</strong> SL.TLF.CACT.FE.ZS
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Update Frequency:</strong> Annual
              </p>
              <p className="text-sm text-muted-foreground">
                The female labor force participation rate shows the percentage of women 
                (ages 15+) who are economically active. Data is collected by the ILO and 
                distributed through the World Bank Open Data API.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Data Quality & Timeliness</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              <strong>Real-time updates:</strong> Your badges automatically fetch the 
              latest available data every 24 hours. No need to update embed codes.
            </p>
            <p>
              <strong>Data lag:</strong> Most international statistics have a 1-2 year lag 
              from the current calendar year. This is normal and reflects the time needed 
              for data collection, validation, and publication by official sources.
            </p>
            <p>
              <strong>Quality assurance:</strong> All statistics come from official sources: 
              international organizations (World Bank, ILO, WHO, UN) or national statistics 
              agencies. We don't use estimates or projections.
            </p>
          </div>
        </Card>


      </div>
    </div>
  );
}
