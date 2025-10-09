"use client";
import Link from "next/link";
import TitleOfEvent from "./components/titleofevent";
import SponsorTier from "./components/sponsortier";
import RegistrationButton from "./components/registrationbutton";
import Donate from "./components/donate";
import Mechanics from "./components/mechanics";
import Iridescence from "@/components/Iridescence";
import { SparklesText } from "@/components/ui/sparkles-text";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  ArrowUp,
  Waves,
  Anchor,
  Calendar,
  Clock,
  MapPin,
  Award,
} from "lucide-react";
import SimpleHeader from "./components/simple-header";

export default function LandingPage() {
  return (
    <div className="relative w-full min-h-screen overflow-x-hidden">
      {/* Hero Section with Iridescence Background */}
      <section className="relative w-full min-h-screen flex flex-col">
        {/* Iridescence Background - Hero Section */}
        <div className="absolute inset-0 w-full h-full z-0">
          <Iridescence
            color={[0.1, 0.3, 0.5]}
            mouseReact={true}
            amplitude={0.15}
            speed={0.5}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col">
          {/* Header at top */}
          <SimpleHeader />

          {/* Main hero content - centered */}
          <div className="flex-1 flex items-center justify-center">
            <TitleOfEvent />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-primary-foreground/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-primary-foreground/50 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <main className="relative w-full max-w-full bg-background overflow-x-hidden">
        {/* Event Details Section */}
        <section id="event-details" className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4">
                Event Information
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Competition Details
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to know about the Maritime Talent Quest 2025
              </p>
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Event Information Card */}
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">Event Information</CardTitle>
                  </div>
                  <CardDescription>
                    Key details about the Maritime Talent Quest
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Date:</span>
                    <span>December 15-17, 2025</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Duration:</span>
                    <span>3 Days Competition</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Location:</span>
                    <span>Manila Bay Maritime Center</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Participants:</span>
                    <span>500+ Maritime Professionals</span>
                  </div>
                </CardContent>
              </Card>

              {/* Competition Categories Card */}
              <Card className="border-2 border-secondary/20 hover:border-secondary/40 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-secondary" />
                    <CardTitle className="text-xl">
                      Competition Categories
                    </CardTitle>
                  </div>
                  <CardDescription>
                    Various skill-based maritime competitions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Navigation Skills</Badge>
                    <Badge variant="secondary">Safety Protocols</Badge>
                    <Badge variant="outline">Technical Knowledge</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Seamanship</Badge>
                    <Badge variant="secondary">Leadership</Badge>
                    <Badge variant="outline">Emergency Response</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Communication</Badge>
                    <Badge variant="secondary">Team Coordination</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Event Highlights */}
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-2 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl sm:text-3xl">
                  Event Highlights
                </CardTitle>
                <CardDescription className="text-base">
                  What makes this maritime competition extraordinary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">Excellence Awards</h3>
                    <p className="text-sm text-muted-foreground">
                      Recognition for outstanding maritime performance
                    </p>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto">
                      <Users className="h-6 w-6 text-secondary" />
                    </div>
                    <h3 className="font-semibold">Networking</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect with maritime industry leaders
                    </p>
                  </div>

                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto">
                      <Waves className="h-6 w-6 text-accent-foreground" />
                    </div>
                    <h3 className="font-semibold">Career Opportunities</h3>
                    <p className="text-sm text-muted-foreground">
                      Discover new paths in maritime careers
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="max-w-7xl mx-auto" />

        {/* Registration Section */}
        <div id="registration">
          <RegistrationButton />
        </div>

        <Separator className="max-w-7xl mx-auto" />

        {/* Sponsors Section */}
        <div id="sponsors">
          <SponsorTier />
        </div>

        <Separator className="max-w-7xl mx-auto" />

        {/* Guidelines & Mechanics Section */}
        <Mechanics />

        <Separator className="max-w-7xl mx-auto" />

        {/* Support & Donation Section */}
        <div id="support">
          <Donate />
        </div>

        {/* Footer Section */}
        <footer className="bg-muted/30 border-t border-border/50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Anchor className="h-6 w-6 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Maritime Talent Quest
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Empowering maritime excellence through competition, education,
                  and industry collaboration.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Quick Links</h4>
                <div className="space-y-2 text-sm">
                  <Link
                    href="/registration"
                    className="block text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Registration
                  </Link>
                  <Link
                    href="/competition"
                    className="block text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Competition Details
                  </Link>
                  <Link
                    href="/sponsors"
                    className="block text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sponsor Information
                  </Link>
                  <Link
                    href="/contact"
                    className="block text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Event Information</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>December 15-17, 2025</p>
                  <p>Manila Bay Maritime Center</p>
                  <p>info@maritimetalent.org</p>
                  <p>+1 (555) 123-4567</p>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
              <p>&copy; 2025 Maritime Talent Quest. All rights reserved.</p>
              <p>Powered by Maritime Excellence Initiative</p>
            </div>
          </div>
        </footer>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 space-y-3">
        {/* Main Registration Button */}
        <Link href="/registration/contestant" className="block">
          <Button
            size="lg"
            className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-pulse hover:animate-none bg-primary hover:bg-primary/90"
          >
            <SparklesText
              className="text-sm font-medium text-primary-foreground"
              colors={{ first: "#FFFFFF", second: "#6b71b3" }}
            >
              Register Now
            </SparklesText>
          </Button>
        </Link>
      </div>
    </div>
  );
}
