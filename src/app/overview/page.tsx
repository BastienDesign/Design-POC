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

// Placeholders for future atomic components
const ProgramView = () => (
  <div className="w-full h-64 border border-dashed border-neutral-200 rounded-xl flex items-center justify-center text-sm text-neutral-400 mt-6 bg-neutral-50/50">
    [Program View Content: Aggregated KPIs &amp; Comparison Tables]
  </div>
);

const OrganizationView = () => (
  <div className="w-full h-64 border border-dashed border-neutral-200 rounded-xl flex items-center justify-center text-sm text-neutral-400 mt-6 bg-neutral-50/50">
    [Organization View Content: Single Brand Deep-Dive &amp; Charts]
  </div>
);

export default function OverviewPage() {
  return (
    <div className="h-[calc(100vh-72px)] w-full overflow-auto bg-white">
      <div className="max-w-[1600px] mx-auto px-6 py-8 md:px-8 w-full">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
              Overview
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Monitor your program&apos;s performance and dive into organization
              details.
            </p>
          </div>

          {/* Top-level actions placeholder */}
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm">
            <RiDownloadCloud2Line className="size-4" />
            Export Report
          </button>
        </div>

        {/* Tab Navigation */}
        <Tabs defaultValue="program" className="w-full">
          <TabsList className="bg-neutral-100/80 p-1 rounded-lg">
            <TabsTrigger
              value="program"
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm text-neutral-500 rounded-md transition-all"
            >
              <RiFolder3Line className="size-4" />
              Program
            </TabsTrigger>
            <TabsTrigger
              value="organization"
              className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm text-neutral-500 rounded-md transition-all"
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
