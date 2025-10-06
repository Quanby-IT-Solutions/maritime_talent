import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Sample data for the analytics
const data = [
  { name: "Jan", users: 400, revenue: 2400 },
  { name: "Feb", users: 300, revenue: 1398 },
  { name: "Mar", users: 200, revenue: 9800 },
  { name: "Apr", users: 278, revenue: 3908 },
  { name: "May", users: 189, revenue: 4800 },
  { name: "Jun", users: 239, revenue: 3800 },
];

export default function AnalyticPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full bg-gray-100 rounded flex items-center justify-center">
              <p>Chart would be displayed here</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full bg-gray-100 rounded flex items-center justify-center">
              <p>Chart would be displayed here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This analytics dashboard provides insights into user engagement and revenue trends over the past months.</p>
        </CardContent>
      </Card>
    </div>
  );
}