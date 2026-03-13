import type { Metadata } from 'next'
import AlertsSection from "@/app/[locale]/(dashboard)/dashboard/AlertsSection";
import ChartsSection from "@/app/[locale]/(dashboard)/dashboard/ChartsSection";
import Kpicards from "@/app/[locale]/(dashboard)/dashboard/Kpicards";
import TablesSection from "@/app/[locale]/(dashboard)/dashboard/TablesSection";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Overview of key performance indicators, appointments, and business metrics for your spa.',
}

export default function Home() {
  return (
    <div className="space-y-6 pb-6 animate-fade-in-up">
      <PageHeader
        title="Dashboard"
        subtitle="Key performance indicators for your spa business"
      />

      {/* KPI Cards */}
      <div className="stagger-children">
        <Kpicards />
      </div>

      {/* Analytics */}
      <section className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <h2
          className="text-xl font-semibold text-foreground mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Analytics
        </h2>
        <ChartsSection />
      </section>

      {/* Alerts & Activity */}
      <section className="animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
        <h2
          className="text-xl font-semibold text-foreground mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Alerts &amp; Activity
        </h2>
        <AlertsSection />
      </section>

      {/* Performance Tables */}
      <section className="animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
        <h2
          className="text-xl font-semibold text-foreground mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Performance
        </h2>
        <TablesSection />
      </section>
    </div>
  );
}
