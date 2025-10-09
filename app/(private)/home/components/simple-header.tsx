"use client";

import { Button } from "@/components/ui/button";
import { Anchor, Menu, Phone } from "lucide-react";

export default function SimpleHeader() {
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
    </header>
  );
}
