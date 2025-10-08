import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Users, Award, Waves } from "lucide-react";

export default function TitleOfEvent() {
  return (
    <section className="w-full py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Event Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Waves className="h-8 w-8 text-primary" />
            <Badge variant="secondary" className="text-sm font-medium">
              Maritime Excellence Event
            </Badge>
            <Waves className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            Maritime Talent Quest
            <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-muted-foreground font-normal mt-2">
              2025 Championship
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover exceptional maritime talent and showcase your skills in the
            ultimate seafaring competition
          </p>
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Call to Action */}
        <div className="text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
            Ready to Showcase Your Maritime Excellence?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-base">
              Register Now
            </Button>
            <Button variant="outline" size="lg" className="text-base">
              View Program Details
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
