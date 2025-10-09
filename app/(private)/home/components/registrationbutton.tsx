"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Trophy,
  QrCode,
  ArrowRight,
  Eye,
  UserCheck,
} from "lucide-react";

export default function RegistrationButton() {
  const registrationTypes = [
    {
      type: "guest",
      title: "Event Guest",
      description: "Attend and observe the competition",
      icon: Eye,
      features: [
        "Full event access",
        "Networking opportunities",
        "Awards ceremony viewing",
        "Industry showcase access",
      ],
      buttonText: "Register as Guest",
      color: "bg-secondary/10 border-secondary/20 hover:border-secondary/40",
      iconColor: "text-secondary",
    },
    {
      type: "contestant",
      title: "Competition Participant",
      description: "Compete in maritime skill challenges",
      icon: Trophy,
      features: [
        "Competition participation",
        "Skill assessment & certification",
        "Prize eligibility",
        "Professional recognition",
      ],
      buttonText: "Register as Contestant",
      color: "bg-primary/10 border-primary/20 hover:border-primary/40",
      iconColor: "text-primary",
    },
  ];

  return (
    <section className="w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="mb-4">
            <UserCheck className="h-3 w-3 mr-1" />
            Join the Event
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Choose Your Experience
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select your participation level and join hundreds of maritime
            professionals in this prestigious event
          </p>
        </div>

        {/* Registration Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {registrationTypes.map((regType) => {
            const IconComponent = regType.icon;
            return (
              <Card
                key={regType.type}
                className={`${regType.color} border-2 transition-all duration-300 hover:shadow-lg group`}
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={`w-16 h-16 ${regType.iconColor.replace(
                      "text-",
                      "bg-"
                    )}/10 rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <IconComponent className={`h-8 w-8 ${regType.iconColor}`} />
                  </div>
                  <CardTitle className="text-2xl mb-2">
                    {regType.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {regType.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Features List */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm uppercase tracking-wide">
                      What&apos;s Included:
                    </h4>
                    {regType.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 text-sm"
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${regType.iconColor.replace(
                            "text-",
                            "bg-"
                          )}`}
                        ></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* QR Code Info */}
                  <div
                    className={`p-4 rounded-lg ${regType.iconColor.replace(
                      "text-",
                      "bg-"
                    )}/5 border border-current/10`}
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <QrCode className={`h-4 w-4 ${regType.iconColor}`} />
                      <span className="font-medium">
                        Quick Registration Available
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Scan QR code for instant mobile registration
                    </p>
                  </div>

                  {/* Registration Button */}
                  <Link
                    href={`/registration?type=${regType.type}`}
                    className="block"
                  >
                    <Button
                      size="lg"
                      className={`w-full group-hover:scale-105 transition-transform ${
                        regType.type === "contestant"
                          ? "bg-primary hover:bg-primary/90"
                          : "bg-secondary hover:bg-secondary/90"
                      }`}
                    >
                      {regType.buttonText}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <Card className="bg-gradient-to-r from-accent/5 to-primary/5 border-2 border-accent/20 max-w-4xl mx-auto">
          <CardContent className="text-center py-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="h-5 w-5 text-accent-foreground" />
              <Badge variant="secondary">Registration Information</Badge>
            </div>
            <h3 className="text-xl font-semibold mb-4">Need Help Choosing?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Not sure which registration type is right for you? Our team is
              here to help you select the best participation level based on your
              experience and goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline">Contact Registration Team</Button>
              <Button variant="outline">View FAQ</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
