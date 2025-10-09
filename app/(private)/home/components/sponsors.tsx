"use client";

import SponsorMarquee from "./sponsor-marquee";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Anchor, Menu, Users, Trophy, Heart, Phone } from "lucide-react";

export default function Sponsors() {
  return (
    <header className="w-full">
      {/* Top Navigation Bar */}
      <div className="w-full py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-foreground/10 rounded-lg flex items-center justify-center">
              <Anchor className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-primary-foreground">
                Maritime TQ
              </h1>
              <p className="text-xs text-primary-foreground/80">
                2025 Championship
              </p>
            </div>
          </div>

          {/* Navigation Links - Hidden on mobile */}
          <nav className="hidden lg:flex items-center gap-6">
            <button
              onClick={() =>
                document
                  .getElementById("registration")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="text-primary-foreground/90 hover:text-primary-foreground transition-colors text-sm font-medium"
            >
              Registration
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("event-details")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="text-primary-foreground/90 hover:text-primary-foreground transition-colors text-sm font-medium"
            >
              Competition
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("sponsors")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="text-primary-foreground/90 hover:text-primary-foreground transition-colors text-sm font-medium"
            >
              Sponsors
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("support")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="text-primary-foreground/90 hover:text-primary-foreground transition-colors text-sm font-medium"
            >
              Support
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Phone className="h-3 w-3 mr-2" />
              Contact
            </Button>
            <Button
              size="sm"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            >
              Register
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Organizations Section */}
      <div className="w-full py-6 sm:py-8">
        {/* Title Section - Constrained */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="text-center">
            <Badge
              variant="secondary"
              className="mb-3 bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20"
            >
              Event Partners
            </Badge>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary-foreground mb-2">
              Supporting Organizations
            </h2>
            <p className="text-xs sm:text-sm text-primary-foreground/80">
              In collaboration with maritime industry leaders
            </p>
          </div>
        </div>

        {/* Marquee Section - Full Width */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <SponsorMarquee />
        </div>
      </div>

      {/* Quick Access Badges */}
      <div className="w-full py-4 border-t border-primary-foreground/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            <Badge
              variant="outline"
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 cursor-pointer transition-colors"
            >
              <Users className="h-3 w-3 mr-1" />
              500+ Participants
            </Badge>
            <Badge
              variant="outline"
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 cursor-pointer transition-colors"
            >
              <Trophy className="h-3 w-3 mr-1" />8 Categories
            </Badge>
            <Badge
              variant="outline"
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 cursor-pointer transition-colors"
            >
              <Heart className="h-3 w-3 mr-1" />3 Days Event
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
}
