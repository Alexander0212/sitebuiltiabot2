import { DistrictMarquee } from "@/components/sections/district-marquee";
import { BudgetCalculator } from "@/components/sections/budget-calculator";
import { ContactForm } from "@/components/sections/contact-form";
import { Hero } from "@/components/sections/hero";
import { InvestmentCalculator } from "@/components/sections/investment-calculator";
import { PropertyGrid } from "@/components/sections/property-grid";
import { Testimonials } from "@/components/sections/testimonials";
import { ValueProposition } from "@/components/sections/value-proposition";

export default function Home() {
  return (
    <>
      <Hero />
      <DistrictMarquee />
      <BudgetCalculator />
      <PropertyGrid />
      <ValueProposition />
      <InvestmentCalculator />
      <Testimonials />
      <ContactForm />
    </>
  );
}
