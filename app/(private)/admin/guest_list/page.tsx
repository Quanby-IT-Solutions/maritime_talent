"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/talent-datatables/talent-data-table";
import { createColumns, GuestData, safeParseGuestData } from "@/components/guest-column-def";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Users,
  CheckCircle,
  RefreshCw,
  Download,
  UserPlus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function GuestListPage() {
  const [guests, setGuests] = useState<GuestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<"all" | "Male" | "Female">("all");
  const [stats, setStats] = useState({
    total: 0,
    male: 0,
    female: 0,
    withOrganization: 0,
  });

  useEffect(() => {
    const fetchGuests = async () => {
      setLoading(true);

      try {
        const supabase = createClient();

        // Fetch guests from Supabase
        const { data: guestsData, error } = await supabase
          .from('guests')
          .select('*')
          .order('guest_id', { ascending: false });

        if (error) {
          console.error('Error fetching guests:', error);
          setValidationErrors([`Database error: ${error.message}`]);
          return;
        }

        console.log('Fetched guests from database:', guestsData);

        // Check if we have data
        if (!guestsData || guestsData.length === 0) {
          console.log('No guests found in database');
          setGuests([]);
          setStats({ total: 0, male: 0, female: 0, withOrganization: 0 });
          return;
        }

        // Validate with Zod and collect errors
        const validatedData: GuestData[] = [];
        const errors: string[] = [];

        guestsData.forEach((item: unknown, index: number) => {
          const result = safeParseGuestData(item);
          if (result.success) {
            validatedData.push(result.data);
          } else {
            errors.push(
              `Guest ${index + 1}: ${result.error.issues
                .map((i: { message: string }) => i.message)
                .join(", ")}`
            );
          }
        });

        if (errors.length > 0) {
          setValidationErrors(errors);
        }

        setGuests(validatedData);

        // Calculate statistics
        const total = validatedData.length;
        const male = validatedData.filter(g => g.gender === "Male").length;
        const female = validatedData.filter(g => g.gender === "Female").length;
        const withOrganization = validatedData.filter(g => g.organization).length;

        setStats({ total, male, female, withOrganization });
      } catch (error) {
        console.error("Error:", error);
        setValidationErrors([`Unexpected error: ${error instanceof Error ? error.message : String(error)}`]);
      } finally {
        setLoading(false);
      }
    };

    fetchGuests();
  }, []);

  // Handle guest updates
  const handleGuestUpdate = (updatedGuest: GuestData) => {
    setGuests(prevGuests => {
      const updatedGuests = prevGuests.map(guest =>
        guest.guest_id === updatedGuest.guest_id ? updatedGuest : guest
      );

      // Recalculate statistics
      const total = updatedGuests.length;
      const male = updatedGuests.filter(g => g.gender === "Male").length;
      const female = updatedGuests.filter(g => g.gender === "Female").length;
      const withOrganization = updatedGuests.filter(g => g.organization).length;

      setStats({ total, male, female, withOrganization });
      return updatedGuests;
    });
  };

  // Filter guests based on search and gender
  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.contact_number?.includes(searchQuery);

    const matchesGender = genderFilter === "all" || guest.gender === genderFilter;

    return matchesSearch && matchesGender;
  });

  return (
    <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Guest List</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Maritime Talent Quest - Guest registrations and information
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Validation Errors Alert */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-semibold">Validation Errors:</p>
              {validationErrors.map((error, index) => (
                <p key={index} className="text-sm">
                  • {error}
                </p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-3 grid-cols-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Registered guests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Male</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.male}
            </div>
            <p className="text-xs text-muted-foreground">
              Male guests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Female</CardTitle>
            <UserPlus className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">
              {stats.female}
            </div>
            <p className="text-xs text-muted-foreground">
              Female guests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">With Organization</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.withOrganization}
            </div>
            <p className="text-xs text-muted-foreground">
              From organizations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Guest List with Search, Filter, and Pagination */}
      <Card>
        <CardHeader>
          <CardTitle>Guest Registrations</CardTitle>
          <CardDescription>
            {filteredGuests.length} of {stats.total} guests shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading guests...</span>
              </div>
            </div>
          ) : (
            <DataTable
              columns={createColumns(handleGuestUpdate)}
              data={filteredGuests}
              searchPlaceholder="Search by name, email, organization, or phone..."
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={genderFilter}
              onStatusFilterChange={(value) =>
                setGenderFilter(value as "all" | "Male" | "Female")
              }
              showFilters={true}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
