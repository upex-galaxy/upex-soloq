import { SiteHeader } from '@/components/layout/site-header';
import { Footer } from '@/components/landing';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1 py-16 md:py-24">
        <div className="container max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Ultima actualizacion: {lastUpdated}
            </p>
          </div>

          <div className="prose-legal space-y-8 text-muted-foreground [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mb-4 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-foreground [&_h3]:mb-3 [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_li]:leading-relaxed">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
