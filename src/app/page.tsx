import AlertsSection from "@/components/dashboard/AlertsSection";
import ChartsSection from "@/components/dashboard/ChartsSection";
import Kpicards from "@/components/dashboard/Kpicards";
import TablesSection from "@/components/dashboard/TablesSection";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div
      className="grid grid-cols-1 
    lg:grid-cols-1 2xl:grid-cols-1 
    gap-4"
    >
      {/* Overview */}
      <div className="bg-primary-foreground p-4 rounded-lg">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground">Overview</h2>
          <p className="text-sm text-muted-foreground">
            Key performance indicators for your spa business
          </p>
        </div>
        <Kpicards />
      </div>

      {/* Analytics */}
      <div className="bg-primary-foreground p-4 rounded-lg">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground">Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Revenue and booking trends
          </p>
        </div>
        <ChartsSection />
      </div>

      {/* Alerts & Activity */}
      <div className="bg-primary-foreground p-4 rounded-lg border">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Alerts & Activity
          </h2>
          <p className="text-sm text-muted-foreground">
            Important notifications and today's activity
          </p>
        </div>
        <div className="grid">
          <AlertsSection />
        </div>
      </div>

      {/* Performance Tables */}
      <div className="bg-primary-foreground p-4 rounded-lg border">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Performance Tables
          </h2>
          <p className="text-sm text-muted-foreground">
            Detailed data for products, services, customers, and staff
          </p>
        </div>
        <TablesSection />
      </div>
      {/* <div className="bg-primary-foreground p-4 rounded-lg"> Test 5</div>
      <div className="bg-primary-foreground p-4 rounded-lg"> Test 6</div>
      <div className="bg-primary-foreground p-4 rounded-lg"> Test 7</div>
      <div className="bg-primary-foreground p-4 rounded-lg"> Test 8</div>
      <div className="bg-primary-foreground p-4 rounded-lg"> Test 9</div> */}
    </div>
  );
}
