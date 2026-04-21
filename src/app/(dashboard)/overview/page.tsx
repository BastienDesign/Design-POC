import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  RiBuilding4Line,
  RiFolder3Line,
  RiDownloadCloud2Line,
} from "@remixicon/react";
import { OrganizationView } from "@/components/overview/organization-view";

// Placeholder for future atomic component
const ProgramView = () => (
  <div className="w-full h-64 border border-dashed border-border rounded-xl flex items-center justify-center text-sm text-muted-foreground mt-6 bg-muted/50">
    [Program View Content: Aggregated KPIs &amp; Comparison Tables]
  </div>
);

export default function OverviewPage() {
  return (
    <div className="h-[calc(100vh-72px)] w-full overflow-auto bg-card">
      <div className="max-w-[1600px] mx-auto px-6 py-8 md:px-8 w-full">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor your program&apos;s performance and dive into organization
              details.
            </p>
          </div>

          {/* Top-level actions placeholder */}
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-accent transition-colors shadow-sm">
            <RiDownloadCloud2Line className="size-4" />
            Export Report
          </button>
        </div>

        {/* Tab Navigation */}
        <Tabs defaultValue="program" className="w-full">
          <TabsList className="bg-muted/80 p-1 rounded-lg">
            <TabsTrigger
              value="program"
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground rounded-md transition-all"
            >
              <RiFolder3Line className="size-4" />
              Program
            </TabsTrigger>
            <TabsTrigger
              value="organization"
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground rounded-md transition-all"
            >
              <RiBuilding4Line className="size-4" />
              Organization
            </TabsTrigger>
          </TabsList>

          {/* Content Areas */}
          <TabsContent
            value="program"
            className="focus-visible:outline-none"
          >
            <ProgramView />
          </TabsContent>

          <TabsContent
            value="organization"
            className="focus-visible:outline-none"
          >
            {/* Note: In the future, this view will need an Organization Selector Dropdown at the top */}
            <OrganizationView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
