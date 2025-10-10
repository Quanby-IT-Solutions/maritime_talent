"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  ArrowRight,
  CheckCircle,
  FileText,
  Users,
  Clock,
  Guitar,
} from "lucide-react";

export default function Mechanics() {
  const registrationSteps = [
    {
      step: "1",
      title: "Performance Details",
      description: "Choose your preferred competition category and skill area.",
      icon: Guitar,
      duration: "5 minutes",
    },
    {
      step: "2",
      title: "Personal Information",
      description:
        "Complete your profile with contact details and your group members.",
      icon: Users,
      duration: "10 minutes",
    },
    {
      step: "3",
      title: "Upload Document Requirements",
      description: "Upload the required documents.",
      icon: FileText,
      duration: "3 minutes",
    },
    {
      step: "4",
      title: "Consent and Agreement",
      description: "Acknowledge safety protocols and competition guidelines.",
      icon: CheckCircle,
      duration: "2 minutes",
    },
  ];

  const requirements = [
    "Certificate of Enrollment from School/University",
    "Copy of valid school ID",
    "Student signature of consent",
    "Parent signature of consent",
  ];

  return (
    <section
      id="mechanics"
      className="w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-4">
          <Badge variant="outline" className="mb-4">
            Registration Process
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            How to Participate
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Follow our streamlined registration process to join the Maritime
            Talent Quest competition
          </p>
        </div>

        {/* Registration Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {registrationSteps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <Card
                key={step.step}
                className="relative border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg"
              >
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary-foreground font-bold text-lg">
                      {step.step}
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg mb-3">{step.title}</CardTitle>
                  <Badge variant="secondary" className="text-xs mb-2">
                    <Clock className="h-3 w-3 mr-1" />
                    {step.duration}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    {step.description}
                  </p>
                </CardContent>
                {index < registrationSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-6 top-1/2 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-primary/40" />
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Requirements & Guidelines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Requirements Card */}
          <Card className="border-2 border-secondary/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5  text-primary" />
                Registration Requirements
              </CardTitle>
              <CardDescription>
                Essential qualifications needed for participation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {requirements.map((requirement, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{requirement}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Competition Guidelines Card */}
          <Card className="border-2 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-accent-foreground" />
                Competition Guidelines
              </CardTitle>
              <CardDescription>
                Important information about the competition format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Competition Format</h4>
                <p className="text-sm text-muted-foreground">
                  Multi-stage assessment including practical demonstrations,
                  theoretical examinations, and real-world scenario simulations.
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Evaluation Criteria</h4>
                <p className="text-sm text-muted-foreground">
                  Technical proficiency (40%), Safety awareness (30%),
                  Leadership skills (20%), Innovation (10%).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
