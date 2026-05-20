import { SiteHeader } from '@/components/layout/site-header';
import {
  HeroSection,
  FeaturesBento,
  BenefitsSection,
  RemindersSection,
  PricingSection,
  FAQSection,
  CTASection,
  Footer,
} from '@/components/landing';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero - El momento WOW */}
        <HeroSection />

        {/* Features Bento Grid - Con jerarquía visual */}
        <FeaturesBento />

        {/* Benefits - Por qué SoloQ */}
        <BenefitsSection />

        {/* Recordatorios Automáticos - Feature Pro */}
        <RemindersSection />

        {/* Pricing - Transparencia total */}
        <PricingSection />

        {/* FAQ - Preguntas frecuentes */}
        <FAQSection />

        {/* CTA Final - El empujón final */}
        <CTASection />
      </main>

      {/* Footer profesional */}
      <Footer />
    </div>
  );
}
