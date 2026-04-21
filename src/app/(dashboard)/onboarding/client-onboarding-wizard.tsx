"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  RiFlag2Line,
  RiNodeTree,
  RiSearchEyeLine,
  RiShieldCheckLine,
  RiThunderstormsLine,
  RiCheckLine,
  RiUploadCloud2Line,
  RiCloseLine,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiDraftLine,
  RiAddLine,
  RiDeleteBinLine,
  RiAlertLine,
} from "@remixicon/react";
import { useAuth } from "@/lib/auth-context";
import { saveOnboardingData } from "./actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

/* ─── Phase definitions ─── */
const PHASES = [
  {
    num: 1,
    title: "Brand & Project Scope",
    sub: "Org, Identity, IP, Access",
    icon: RiFlag2Line,
    description:
      "Define who the client is and what they are protecting. This sets the north star for the crawling engines and downstream moderation logic.",
  },
  {
    num: 2,
    title: "Product Classification",
    sub: "Categories, Hierarchy, Visual DNA",
    icon: RiNodeTree,
    description:
      "Before finding infringements, the system needs to categorize what it finds. Map the product taxonomy so detection engines know what genuine goods look like.",
  },
  {
    num: 3,
    title: "Scraping Landscape",
    sub: "Target Zones, Search Terms",
    icon: RiSearchEyeLine,
    description:
      "Configure where and how the crawlers search — marketplaces, social platforms, geographic scopes, and seed keywords.",
  },
  {
    num: 4,
    title: "Auto-Moderation Rules",
    sub: "Labels, Detection Engines",
    icon: RiShieldCheckLine,
    description:
      "Set up the labelling taxonomy, confidence thresholds, and AI detection engines that auto-classify incoming content.",
  },
  {
    num: 5,
    title: "Action & Enforcement",
    sub: "Infrastructure, Channels, Automation",
    icon: RiThunderstormsLine,
    description:
      "Define the takedown channels, escalation paths, and automated enforcement rules that close the loop on violations.",
  },
] as const;

/* ─── Types ─── */
interface AccessUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

/* ─── Main Wizard ─── */
export function ClientOnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signupEmail = searchParams.get("email");
  const { user, login } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [activePhase, setActivePhase] = useState(0);

  /* Phase 1 — Controlled fields */
  const [programName, setProgramName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgDescription, setOrgDescription] = useState("");
  const [brandNames, setBrandNames] = useState("");
  const [projectScope, setProjectScope] = useState("");

  /* Exit Setup — toast confirmation */
  const handleExitSetup = () => {
    toast("Exit the Setup Wizard?", {
      description: "You can resume from where you left off later.",
      action: { label: "Exit", onClick: () => router.push("/explore") },
      cancel: { label: "Stay", onClick: () => {} },
      duration: 6000,
    });
  };

  /* Save as Draft — toast only */
  const handleSaveDraft = () => {
    toast.success("Draft saved", {
      description: "You can resume this setup from the Getting Started page.",
    });
  };

  /* Complete Setup — persist to DB, refresh auth, redirect */
  const handleCompleteSetup = () => {
    startTransition(async () => {
      try {
        const result = await saveOnboardingData({
          programName,
          orgName,
          orgDescription,
          brandNames,
          projectScope,
          currentUserId: user?.id ?? null,
          signupEmail: user ? null : signupEmail,
        });

        const emailToLogin = user?.email ?? result.userEmail;
        if (emailToLogin) {
          await login(emailToLogin);
        }

        toast.success(`Setup complete — welcome to ${result.orgName}!`);
        router.push("/explore");
      } catch (err) {
        console.error(err);
        toast.error("Setup failed", {
          description: "Could not save your configuration. Please try again.",
        });
      }
    });
  };

  /* Phase 1.4 — Access Control */
  const [accessUsers, setAccessUsers] = useState<AccessUser[]>([
    { id: 1, name: "Sarah Chen", email: "sarah.chen@acme.com", role: "Admin" },
    { id: 2, name: "Marcus Lee", email: "m.lee@acme.com", role: "Analyst" },
    { id: 3, name: "Priya Sharma", email: "p.sharma@acme.com", role: "Viewer" },
  ]);

  const handleUserChange = (id: number, field: string, value: string) => {
    setAccessUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [field]: value } : u))
    );
  };

  const handleAddUser = () => {
    setAccessUsers((prev) => [
      ...prev,
      { id: Date.now(), name: "", email: "", role: "Viewer" },
    ]);
  };

  const handleRemoveUser = (id: number) => {
    setAccessUsers((prev) => prev.filter((u) => u.id !== id));
  };

  /* Phase 2 — Categories */
  const [categories, setCategories] = useState([
    "Luxury Handbags",
    "Timepieces",
    "Apparel",
  ]);
  const [newCategory, setNewCategory] = useState("");

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories((prev) => prev.filter((c) => c !== cat));
  };

  /* ─── Derived ─── */
  const current = PHASES[activePhase];
  const isFirst = activePhase === 0;
  const isLast = activePhase === PHASES.length - 1;
  const nextPhase = !isLast ? PHASES[activePhase + 1] : null;

  /* ─── Phase renderers (plain functions, NOT components) ─── */

  const renderPhase1 = () => (
    <div className="space-y-8">
      {/* 1.1 Program & Organization Setup */}
      <Card className="shadow-sm border-border/80">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">1.1</span>
            <CardTitle className="text-base">
              Program & Organization Setup
            </CardTitle>
          </div>
          <CardDescription>
            A program is the parent entity (e.g. Unilever) that owns one or more
            organizations (e.g. Dove, Vaseline, Knorr). Define both to scope the
            deployment correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Program section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="size-1.5 rounded-full bg-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Program
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Program Name</Label>
                <Input
                  placeholder="e.g. Unilever"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Program Admin Email</Label>
                <Input type="email" placeholder="admin@unilever.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Industry Vertical</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="luxury">Luxury & Fashion</SelectItem>
                    <SelectItem value="pharma">Pharmaceuticals</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="fmcg">FMCG</SelectItem>
                    <SelectItem value="automotive">Automotive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Region</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="emea">EMEA</SelectItem>
                    <SelectItem value="apac">APAC</SelectItem>
                    <SelectItem value="americas">Americas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Organization section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-violet-600" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Organization
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Belongs to the program above
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Organization Name</Label>
                <Input
                  placeholder="e.g. Dove"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Org Admin Email</Label>
                <Input type="email" placeholder="admin@dove.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Organization Description</Label>
              <Input
                placeholder="e.g. Personal care & beauty products"
                value={orgDescription}
                onChange={(e) => setOrgDescription(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Additional organizations can be added after onboarding from the
                Program settings.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 1.2 Brand Identity */}
      <Card className="shadow-sm border-border/80">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">1.2</span>
            <CardTitle className="text-base">Brand Identity</CardTitle>
          </div>
          <CardDescription>
            Define the brands and trademarks under protection scope.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Core Brand Name(s)</Label>
            <Input
              placeholder="Comma-separated, e.g. Acme, Acme Pro, AcmeWear"
              value={brandNames}
              onChange={(e) => setBrandNames(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Include all registered names, sub-brands, and common misspellings
              to monitor.
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Project Scope & Description</Label>
            <Textarea
              placeholder="Describe the focus of this protection program&#8230;"
              className="min-h-[100px] resize-none"
              value={projectScope}
              onChange={(e) => setProjectScope(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 1.3 Intellectual Property */}
      <Card className="shadow-sm border-border/80">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">1.3</span>
            <CardTitle className="text-base">Intellectual Property</CardTitle>
          </div>
          <CardDescription>
            Upload trademark certificates, patents, or other IP documentation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-lg p-10 flex flex-col items-center justify-center text-center hover:border-primary/40 hover:bg-primary/30 transition-colors cursor-pointer group">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
              <RiUploadCloud2Line className="size-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Upload IP Certificates
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Drag and drop PDF or image files, or{" "}
              <span className="text-primary font-medium">browse</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Max 25 MB per file &middot; PDF, PNG, JPG accepted
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 1.4 Access Control */}
      <Card className="shadow-sm border-border/80">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">1.4</span>
            <CardTitle className="text-base">Access Control</CardTitle>
          </div>
          <CardDescription>
            Assign initial user roles for this deployment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-accent border-b border-border">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Role
                  </th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {accessUsers.map((user, i) => (
                  <tr
                    key={user.id}
                    className={
                      i < accessUsers.length - 1
                        ? "border-b border-border"
                        : ""
                    }
                  >
                    <td className="px-3 py-2">
                      <Input
                        value={user.name || ""}
                        onChange={(e) =>
                          handleUserChange(user.id, "name", e.target.value)
                        }
                        className="h-8 text-sm border-transparent hover:border-border focus-visible:ring-1"
                        placeholder="Name..."
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Input
                        value={user.email || ""}
                        onChange={(e) =>
                          handleUserChange(user.id, "email", e.target.value)
                        }
                        className="h-8 text-sm border-transparent hover:border-border focus-visible:ring-1"
                        placeholder="Email..."
                      />
                    </td>
                    <td className="px-3 py-2">
                      <Select
                        value={user.role}
                        onValueChange={(val) =>
                          handleUserChange(user.id, "role", val)
                        }
                      >
                        <SelectTrigger className="h-8 w-[130px] text-sm border-transparent hover:border-border focus:ring-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Admin">Admin</SelectItem>
                          <SelectItem value="Analyst">Analyst</SelectItem>
                          <SelectItem value="Viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveUser(user.id)}
                      >
                        <RiDeleteBinLine className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddUser}
            className="mt-3 text-foreground gap-1.5 border-dashed"
          >
            <RiAddLine className="size-4" />
            Add User
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderPhase2 = () => (
    <div className="space-y-8">
      {/* 2.1 Product Hierarchy */}
      <Card className="shadow-sm border-border/80">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">2.1</span>
            <CardTitle className="text-base">Product Hierarchy</CardTitle>
          </div>
          <CardDescription>
            Define the top-level categories and product lines you want to
            protect. These drive how crawled content is classified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Label className="text-sm">Add Product Category</Label>
              <Input
                placeholder="e.g., Leather Goods, Watches, Cosmetics..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCategory();
                  }
                }}
              />
            </div>
            <Button
              onClick={handleAddCategory}
              className="bg-foreground text-primary-foreground hover:bg-foreground/90 gap-1.5 shrink-0"
            >
              <RiAddLine className="size-4" />
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 p-4 bg-accent border border-border rounded-lg min-h-[80px]">
            {categories.length === 0 && (
              <span className="text-sm text-muted-foreground my-auto">
                No categories added yet.
              </span>
            )}
            {categories.map((cat) => (
              <Badge
                key={cat}
                variant="secondary"
                className="px-3 py-1.5 text-sm bg-card border border-border shadow-sm flex items-center gap-2"
              >
                {cat}
                <button
                  onClick={() => handleRemoveCategory(cat)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <RiCloseLine className="size-3.5" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2.2 Visual DNA */}
      <Card className="shadow-sm border-border/80">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">2.2</span>
            <CardTitle className="text-base">
              Visual DNA Configuration
            </CardTitle>
          </div>
          <CardDescription>
            Upload reference images to train the computer vision models on
            authentic vs. counterfeit features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {/* Authentic zone */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-emerald-700 font-bold">
                <RiShieldCheckLine className="size-4" />
                Authentic References
              </Label>
              <div className="border-2 border-dashed border-emerald-200 bg-emerald-50/30 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-emerald-50/60 transition-colors cursor-pointer min-h-[200px]">
                <div className="size-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                  <RiUploadCloud2Line className="size-5 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-emerald-900">
                  Upload Authentic Images
                </p>
                <p className="text-xs text-emerald-600/70 mt-1">
                  High-res product shots, logos, tags
                </p>
                <p className="text-[11px] text-emerald-500/50 mt-2">
                  PNG, JPG &middot; Max 25 MB each
                </p>
              </div>
            </div>

            {/* Counterfeit zone */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-destructive font-bold">
                <RiAlertLine className="size-4" />
                Known Counterfeits
              </Label>
              <div className="border-2 border-dashed border-destructive/30 bg-destructive/10/30 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-destructive/10/60 transition-colors cursor-pointer min-h-[200px]">
                <div className="size-10 rounded-full bg-destructive/15 flex items-center justify-center mb-3">
                  <RiUploadCloud2Line className="size-5 text-destructive" />
                </div>
                <p className="text-sm font-medium text-red-900">
                  Upload Counterfeit Examples
                </p>
                <p className="text-xs text-destructive/70 mt-1">
                  Common fakes, cloned packaging
                </p>
                <p className="text-[11px] text-destructive/50 mt-2">
                  PNG, JPG &middot; Max 25 MB each
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPhase3 = () => (
    <div className="space-y-8">
      {/* 3.1 Target Zones */}
      <Card className="shadow-sm border-border/80">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">3.1</span>
            <CardTitle className="text-base">
              Target Zones (Crawling)
            </CardTitle>
          </div>
          <CardDescription>
            Select the platforms and regions the scraping engine should monitor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                Marketplaces
              </h4>
              <div className="space-y-3">
                {[
                  { name: "Amazon Global", on: true },
                  { name: "Shopee (APAC)", on: true },
                  { name: "AliExpress", on: false },
                  { name: "Mercado Libre", on: false },
                  { name: "eBay", on: false },
                  { name: "Wish", on: false },
                ].map((plat) => (
                  <div
                    key={plat.name}
                    className="flex items-center justify-between"
                  >
                    <Label className="text-sm font-medium text-foreground cursor-pointer">
                      {plat.name}
                    </Label>
                    <Switch defaultChecked={plat.on} />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
                Social Media & Web
              </h4>
              <div className="space-y-3">
                {[
                  { name: "Instagram", on: true },
                  { name: "TikTok", on: false },
                  { name: "Facebook Marketplace", on: false },
                  { name: "Pinterest", on: false },
                  { name: "Telegram Channels", on: false },
                  { name: "Standalone Domains (Web)", on: true },
                ].map((plat) => (
                  <div
                    key={plat.name}
                    className="flex items-center justify-between"
                  >
                    <Label className="text-sm font-medium text-foreground cursor-pointer">
                      {plat.name}
                    </Label>
                    <Switch defaultChecked={plat.on} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3.2 Search Terms */}
      <Card className="shadow-sm border-border/80">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">3.2</span>
            <CardTitle className="text-base">
              Search Terms & Keywords
            </CardTitle>
          </div>
          <CardDescription>
            Define the exact strings the crawlers will look for across the
            selected zones.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm">Target Keywords & Hashtags</Label>
            <Textarea
              placeholder="e.g. Acme Shoes, #AcmeReplica, Acme Fake, &quot;Acme Original&quot;..."
              className="min-h-[96px] resize-none"
            />
            <p className="text-xs text-muted-foreground">
              One term per line or comma-separated. Use quotes for exact match.
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Excluded Terms (Negative Keywords)
            </Label>
            <Textarea
              placeholder="e.g. used, vintage, second-hand, refurbished..."
              className="min-h-[64px] resize-none bg-accent"
            />
            <p className="text-xs text-muted-foreground">
              Listings matching these terms will be deprioritized in the crawl
              queue.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPhase4 = () => (
    <div className="space-y-8">
      {/* 4.1 Classification Labels */}
      <Card className="shadow-sm border-border/80">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">4.1</span>
            <CardTitle className="text-base">
              Classification Labels
            </CardTitle>
          </div>
          <CardDescription>
            Default tags available for manual and automated sorting. These labels
            power the moderation queue and enforcement triggers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2.5">
            {[
              {
                label: "Counterfeit",
                bg: "bg-destructive/15",
                text: "text-red-800",
                border: "border-destructive/30",
              },
              {
                label: "Suspicious",
                bg: "bg-orange-100",
                text: "text-orange-800",
                border: "border-orange-200",
              },
              {
                label: "Copyright Violation",
                bg: "bg-primary/15",
                text: "text-primary",
                border: "border-primary/30",
              },
              {
                label: "Grey Market",
                bg: "bg-amber-100",
                text: "text-amber-800",
                border: "border-amber-200",
              },
              {
                label: "Impersonation",
                bg: "bg-purple-100",
                text: "text-purple-800",
                border: "border-purple-200",
              },
              {
                label: "Legitimate",
                bg: "bg-emerald-100",
                text: "text-emerald-800",
                border: "border-emerald-200",
              },
            ].map((tag) => (
              <Badge
                key={tag.label}
                className={`${tag.bg} ${tag.text} ${tag.border} hover:opacity-80 px-3 py-1.5 text-sm border`}
              >
                {tag.label}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Custom labels can be configured after onboarding from the Moderation
            Settings page.
          </p>
        </CardContent>
      </Card>

      {/* 4.2 Detection Engines */}
      <Card className="shadow-sm border-border/80">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">4.2</span>
            <CardTitle className="text-base">Detection Engines</CardTitle>
          </div>
          <CardDescription>
            Enable specific AI modules for auto-moderation scoring. Each engine
            runs independently and contributes to the composite confidence score.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              title: "Counterfeit Recognition",
              desc: "Detects cloned logos, fake packaging, and unauthorized hardware features via computer vision.",
              on: true,
            },
            {
              title: "Copycat / IP Infringement",
              desc: "Flags products heavily inspired by your brand but avoiding direct logo usage — shape, color, and layout analysis.",
              on: true,
            },
            {
              title: "Impersonation & Phishing",
              desc: "Monitors for fake domains, lookalike storefronts, and social accounts mimicking your official presence.",
              on: true,
            },
            {
              title: "Grey Market Pricing",
              desc: "Alerts when authentic products are sold drastically below MSRP, indicating unauthorized distribution channels.",
              on: false,
            },
          ].map((engine) => (
            <div
              key={engine.title}
              className="flex items-start justify-between p-4 border border-border rounded-lg bg-muted/50 hover:bg-card transition-colors"
            >
              <div className="space-y-1 pr-6">
                <Label className="text-sm font-bold text-foreground">
                  {engine.title}
                </Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {engine.desc}
                </p>
              </div>
              <Switch defaultChecked={engine.on} className="shrink-0 mt-0.5" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderPhase5 = () => (
    <div className="space-y-8">
      {/* 5.1 Execution Channels */}
      <Card className="shadow-sm border-border/80">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">5.1</span>
            <CardTitle className="text-base">Execution Channels</CardTitle>
          </div>
          <CardDescription>
            Configure how takedown notices are delivered to hosts and platforms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-primary/30 bg-primary/50 rounded-lg p-4 cursor-pointer relative overflow-hidden hover:bg-primary/80 transition-colors">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-bl-lg">
                Active
              </div>
              <h4 className="font-bold text-sm text-primary">
                Direct API Integration
              </h4>
              <p className="text-xs text-primary/80 mt-1.5 leading-relaxed">
                Connects directly to major platform IP portals (Amazon Brand
                Registry, eBay VeRO, etc.) for instant submissions.
              </p>
            </div>
            <div className="border border-border bg-card rounded-lg p-4 cursor-pointer hover:border-border transition-colors">
              <h4 className="font-bold text-sm text-foreground">
                Automated Legal Emails
              </h4>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Sends standard C&D notices to hosting providers and domain
                abuse contacts via templated emails.
              </p>
            </div>
            <div className="border border-border bg-card rounded-lg p-4 cursor-pointer hover:border-border transition-colors">
              <h4 className="font-bold text-sm text-foreground">
                Manual Review Queue
              </h4>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Routes flagged items to the internal legal team for manual
                assessment before any action is taken.
              </p>
            </div>
            <div className="border border-border bg-card rounded-lg p-4 cursor-pointer hover:border-border transition-colors">
              <h4 className="font-bold text-sm text-foreground">
                External Law Firm Handoff
              </h4>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Exports case packages to designated external counsel for
                litigation-grade enforcement.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5.2 Automation Strategy */}
      <Card className="shadow-sm border-emerald-200/80 overflow-hidden">
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-600/60">
                5.2
              </span>
              <CardTitle className="text-base text-emerald-900">
                Automation Strategy
              </CardTitle>
            </div>
            <CardDescription className="text-emerald-700/70 mt-1">
              Enable &ldquo;hands-off&rdquo; enforcement for high-confidence
              threats.
            </CardDescription>
          </div>
          <Switch
            defaultChecked={true}
            className="data-[state=checked]:bg-emerald-600"
          />
        </div>
        <CardContent className="p-6 space-y-6 bg-card">
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <Label className="text-sm font-bold text-foreground">
                Auto-Enforcement Threshold
              </Label>
              <span className="text-xl font-black text-emerald-600 tabular-nums">
                90%
              </span>
            </div>
            <Slider defaultValue={[90]} max={100} step={1} className="w-full" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Any item flagged by the AI with a confidence score above this
              threshold will automatically trigger a takedown notice without
              human review. Lower values increase automation but may produce
              false positives.
            </p>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-start justify-between p-4 border border-border rounded-lg bg-muted/50">
              <div className="space-y-1 pr-6">
                <Label className="text-sm font-bold text-foreground">
                  Require Dual-Engine Agreement
                </Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Only auto-enforce when at least two detection engines agree on
                  the classification. Reduces false positives at the cost of
                  slower throughput.
                </p>
              </div>
              <Switch defaultChecked={true} className="shrink-0 mt-0.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPhaseContent = () => {
    switch (activePhase) {
      case 0:
        return renderPhase1();
      case 1:
        return renderPhase2();
      case 2:
        return renderPhase3();
      case 3:
        return renderPhase4();
      case 4:
        return renderPhase5();
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex h-screen w-full bg-accent overflow-hidden text-foreground">
      {/* ── LEFT SIDEBAR: STEPPER ── */}
      <aside className="w-[320px] bg-card border-r border-border flex flex-col z-10 shrink-0">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Setup Wizard
          </span>
          <h2 className="text-lg font-bold mt-1 text-foreground">
            {orgName.trim() || programName.trim() || "New Deployment"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Phase {current.num} of {PHASES.length}
          </p>
        </div>

        {/* Phase list */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {PHASES.map((phase, idx) => {
            const isActive = idx === activePhase;
            const isCompleted = idx < activePhase;

            return (
              <button
                key={phase.num}
                onClick={() => idx <= activePhase && setActivePhase(idx)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all relative ${
                  isActive
                    ? "bg-primary/80 border border-primary/30"
                    : isCompleted
                      ? "hover:bg-accent cursor-pointer border border-transparent"
                      : "opacity-50 cursor-default border border-transparent"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-primary rounded-full" />
                )}
                <div
                  className={`size-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                        ? "bg-emerald-100 text-emerald-600 border border-emerald-200"
                        : "bg-card text-muted-foreground border border-border"
                  }`}
                >
                  {isCompleted ? (
                    <RiCheckLine className="size-3.5" />
                  ) : (
                    phase.num
                  )}
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold truncate ${
                      isActive
                        ? "text-primary"
                        : isCompleted
                          ? "text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {phase.title}
                  </p>
                  <p
                    className={`text-xs mt-0.5 truncate ${
                      isActive ? "text-primary/70" : "text-muted-foreground"
                    }`}
                  >
                    {phase.sub}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Exit button */}
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground gap-2"
            onClick={handleExitSetup}
          >
            <RiCloseLine className="size-4" />
            Exit Setup
          </Button>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col min-w-0 bg-muted/50">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto w-full py-12 px-8 space-y-8">
            {/* Phase header */}
            <header>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                  <current.icon className="size-4 text-primary-foreground" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Phase {current.num}
                </span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {current.title}
              </h1>
              <p className="text-muted-foreground mt-2 text-[15px] leading-relaxed max-w-2xl">
                {current.description}
              </p>
            </header>

            {renderPhaseContent()}
          </div>
        </div>

        {/* ── STICKY FOOTER ── */}
        <div className="shrink-0 py-4 px-8 border-t border-border bg-card flex justify-between items-center shadow-[0_-4px_12px_rgba(0,0,0,0.03)] z-10">
          <div className="flex items-center gap-3">
            {!isFirst && (
              <Button
                variant="outline"
                className="text-foreground gap-2"
                onClick={() => setActivePhase((p) => p - 1)}
              >
                <RiArrowLeftLine className="size-4" />
                Previous
              </Button>
            )}
            <Button variant="ghost" className="text-muted-foreground gap-2" onClick={handleSaveDraft}>
              <RiDraftLine className="size-4" />
              Save as Draft
            </Button>
          </div>
          <Button
            className="bg-foreground text-primary-foreground hover:bg-foreground/90 gap-2 px-6 h-10 disabled:opacity-60"
            disabled={isPending}
            onClick={isLast ? handleCompleteSetup : () => setActivePhase((p) => p + 1)}
          >
            {isLast ? (
              <>
                {isPending ? "Saving…" : "Complete Setup"}
                <RiCheckLine className="size-4" />
              </>
            ) : (
              <>
                Next: {nextPhase!.title}
                <RiArrowRightLine className="size-4" />
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
