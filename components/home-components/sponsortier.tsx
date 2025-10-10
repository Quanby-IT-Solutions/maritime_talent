"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Award, Star, Trophy } from "lucide-react";

export default function SponsorTier() {
  const sponsorTiers = [
    {
      tier: "Bronze",
      icon: Star,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      borderColor: "border-orange-200 dark:border-orange-800",
      sponsors: [
        "Coast Guard Alliance",
        "Marine Safety Plus",
        "Dock Systems Pro",
        "Sea Navigator Ltd",
      ],
    },
    {
      tier: "Silver",
      icon: Award,
      color: "text-slate-500",
      bgColor: "bg-slate-50 dark:bg-slate-950/20",
      borderColor: "border-slate-200 dark:border-slate-800",
      sponsors: ["Nautical Solutions", "Harbor Tech Co", "Wave Dynamics"],
    },
    {
      tier: "Gold",
      icon: Trophy,
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      borderColor: "border-amber-200 dark:border-amber-800",
      sponsors: ["SeaTech Industries", "Maritime Excellence Ltd"],
    },
    {
      tier: "Platinum",
      icon: Crown,
      color: "text-blue-400",
      bgColor: "bg-blue-50 dark:bg-yellow-950/20",
      borderColor: "border-slate-300 dark:border-yellow-800",
      sponsors: ["Premium Maritime Corp", "Ocean Elite Solutions"],
    },
  ];

  return (
    <section className="w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="mb-4">
            Partnership & Support
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Our Valued Sponsors
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Supporting maritime excellence through strategic partnerships and
            industry collaboration
          </p>
        </div>

        {/* Sponsor Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sponsorTiers.map((tier) => {
            const IconComponent = tier.icon;
            return (
              <Card
                key={tier.tier}
                className={`${tier.bgColor} ${tier.borderColor} border-2 hover:shadow-lg transition-all duration-300 hover:scale-105`}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <IconComponent className={`h-6 w-6 ${tier.color}`} />
                    <CardTitle className="text-xl">{tier.tier}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    {tier.tier === "Platinum" && "Premier Partnership Level"}
                    {tier.tier === "Gold" && "Strategic Alliance Level"}
                    {tier.tier === "Silver" && "Supporting Partner Level"}
                    {tier.tier === "Bronze" && "Community Partner Level"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tier.sponsors.map((sponsor, index) => (
                    <div
                      key={index}
                      className="p-3 bg-background/50 rounded-lg border border-border/50"
                    >
                      <p className="text-sm font-medium text-center">
                        {sponsor}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Partnership CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20">
          <CardContent className="text-center py-8">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4">
              Become a Partner
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join our community of industry leaders and support the future of
              maritime excellence. Partnership opportunities available at all
              levels.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors">
                Partnership Information
              </button>
              <button className="px-6 py-3 border border-border text-foreground rounded-md font-medium hover:bg-accent transition-colors">
                Contact Sponsorship Team
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
