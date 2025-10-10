"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  QrCode,
  CreditCard,
  Upload,
  Phone,
  Mail,
  MapPin,
  DollarSign,
} from "lucide-react";

export default function Donate() {
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");

  // const donationTiers = [
  //   // {
  //   //   amount: 50,
  //   //   level: "Supporter",
  //   //   benefits: ["Event updates", "Certificate of appreciation"],
  //   // },
  //   // {
  //   //   amount: 100,
  //   //   level: "Contributor",
  //   //   benefits: ["Event updates", "Certificate", "Event merchandise"],
  //   // },
  //   // {
  //   //   amount: 250,
  //   //   level: "Patron",
  //   //   benefits: ["All above", "VIP event access", "Recognition on website"],
  //   // },
  //   // {
  //   //   amount: 500,
  //   //   level: "Champion",
  //   //   benefits: ["All above", "Networking dinner invitation", "Logo placement"],
  //   // },
  // ];

  return (
    <section className="w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="mb-4">
            <Heart className="h-3 w-3 mr-1" />
            Support Maritime Excellence
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Make a Donation
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Support the future of maritime excellence by contributing to our
            scholarship fund and event development
          </p>
        </div>

        {/* Donation Tiers
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {donationTiers.map((tier) => (
            <Card
              key={tier.level}
              className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg relative"
            >
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">${tier.amount}</CardTitle>
                <Badge variant="secondary">{tier.level}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {tier.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span>{benefit}</span>
                  </div>
                ))}
                <Button className="w-full mt-4" variant="outline">
                  Select ${tier.amount}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div> */}

        {/* Donation Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Card */}
          <Card className="border-2 border-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-secondary" />
                Donation Information
              </CardTitle>
              <CardDescription>
                Please provide your details for donation acknowledgment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Organization (Optional)</Label>
                  <Input
                    id="organization"
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Enter your organization name"
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Payment Methods</h4>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <QrCode className="h-6 w-6" />
                    <span className="text-sm">QR Code</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <CreditCard className="h-6 w-6" />
                    <span className="text-sm">Bank Transfer</span>
                  </Button>
                </div>
              </div>

              <Button className="w-full" size="lg">
                <Upload className="h-4 w-4 mr-2" />
                Upload Payment Screenshot
              </Button>
            </CardContent>
          </Card>

          {/* Contact & Impact Card */}
          <div className="flex flex-col space-y-6 h-full">
            {/* Impact Card */}
            <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/20 flex-1">
              <CardHeader>
                <CardTitle>Your Impact</CardTitle>
                <CardDescription>
                  How your donation makes a difference
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 h-full flex flex-col justify-center">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Event Development</p>
                      <p className="text-xs text-muted-foreground">
                        Improve competition facilities and safety equipment
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Industry Growth</p>
                      <p className="text-xs text-muted-foreground">
                        Support maritime industry research and innovation
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Card */}
            <Card className="border-2 border-accent/20 flex-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-accent-foreground" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  Get in touch with our donation team
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 h-full flex flex-col justify-center">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>donations@maritimetalent.org</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>Manila Bay Maritime Center</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
