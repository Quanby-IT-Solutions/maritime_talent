"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Waves, Users, Trophy, Heart } from "lucide-react";
import SponsorMarquee from "./sponsor-marquee";
import { Separator } from "@/components/ui/separator";
export default function TitleOfEvent() {
  return (
    <section className="w-full max-w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Event Header - Main Hero */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Waves className="h-8 w-8 text-primary-foreground" />
            <Badge
              variant="secondary"
              className="text-sm font-medium bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20"
            >
              Maritime Excellence Event
            </Badge>
            <Waves className="h-8 w-8 text-primary-foreground" />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight">
            Maritime Talent Quest
            <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary-foreground/80 font-normal mt-4">
              2025 Championship
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-primary-foreground/90 max-w-3xl mx-auto my-2 leading-relaxed">
            Discover exceptional maritime talent and showcase your skills in the
            ultimate seafaring competition
          </p>

          {/* Hero CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-12">
            <Button
              size="lg"
              className="text-base bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-4"
            >
              Register Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-4"
            >
              View Program Details
            </Button>
          </div>
        </div>

        {/* Supporting Organizations Section */}
        <Separator className="my-12 bg-primary-foreground/10" />
        <div className="w-full mt-16 pt-8 ">
          <div className="text-center mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold  text-primary-foreground mb-2">
              Event Partners
            </h2>
            <p className="text-xs sm:text-sm text-primary-foreground/80">
              In collaboration with maritime industry leaders
            </p>
          </div>

          {/* Sponsor Marquee - Properly contained */}
          <div className="w-full max-w-full overflow-hidden">
            <SponsorMarquee />
          </div>
        </div>
      </div>
    </section>
  );
}
