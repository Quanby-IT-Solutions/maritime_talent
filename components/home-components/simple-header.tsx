"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Anchor, Menu, Phone } from "lucide-react";
import Link from "next/link";

export default function SimpleHeader() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setIsSheetOpen(false);
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      console.log(`Looking for element with ID: ${sectionId}`, element);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      } else {
        console.warn(`Element with ID "${sectionId}" not found`);
      }
    }, 300); // Increased delay to ensure sheet closes completely
  };

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
              onClick={() => handleNavClick("mechanics")}
              className="text-primary-foreground/90 hover:text-primary-foreground transition-colors text-sm font-medium"
            >
              How to Participate
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
            <Link href="/registration/contestant">
              <Button
                size="sm"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                Register
              </Button>
            </Link>

            {/* Mobile Menu Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Anchor className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-base font-bold">Maritime TQ</div>
                      <div className="text-xs text-muted-foreground">
                        2025 Championship
                      </div>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-4 mt-8">
                  <button
                    onClick={() => handleNavClick("registration")}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <div>
                      <div className="font-medium">Registration</div>
                      <div className="text-sm text-muted-foreground">
                        Join the competition
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick("event-details")}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <div>
                      <div className="font-medium">Competition</div>
                      <div className="text-sm text-muted-foreground">
                        Event details & format
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick("sponsors")}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <div>
                      <div className="font-medium">Sponsors</div>
                      <div className="text-sm text-muted-foreground">
                        Our partners & supporters
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick("mechanics")}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <div>
                      <div className="font-medium">How to Participate</div>
                      <div className="text-sm text-muted-foreground">
                        Registration process & guidelines
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => handleNavClick("support")}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <div>
                      <div className="font-medium">Support</div>
                      <div className="text-sm text-muted-foreground">
                        Donate & get involved
                      </div>
                    </div>
                  </button>
                </nav>

                <div className="mt-8 pt-6 border-t">
                  <Link
                    href="/registration/contestant"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    <Button className="w-full" size="lg">
                      Register Now
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
