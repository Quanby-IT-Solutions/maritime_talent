import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Sample data for talents
const talentsData = [
  { id: 1, name: "John Smith", position: "Maritime Engineer", experience: "8 years", rating: 4.8 },
  { id: 2, name: "Maria Garcia", position: "Naval Architect", experience: "6 years", rating: 4.9 },
  { id: 3, name: "Robert Johnson", position: "Ship Captain", experience: "12 years", rating: 4.7 },
  { id: 4, name: "Emily Chen", position: "Maritime Consultant", experience: "5 years", rating: 4.6 },
  { id: 5, name: "Michael Brown", position: "Port Manager", experience: "10 years", rating: 4.5 },
];

export default function TalentsDetailsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Talent Details</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Maritime Professionals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {talentsData.map((talent) => (
                <TableRow key={talent.id}>
                  <TableCell>{talent.id}</TableCell>
                  <TableCell>{talent.name}</TableCell>
                  <TableCell>{talent.position}</TableCell>
                  <TableCell>{talent.experience}</TableCell>
                  <TableCell>{talent.rating} ⭐</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}