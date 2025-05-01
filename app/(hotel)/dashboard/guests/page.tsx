"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Mail, Phone } from "lucide-react"

// Mock data for guests
const guests = [
  {
    id: "G001",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 (555) 123-4567",
    nationality: "USA",
    visits: 3,
    status: "checked-in",
    lastStay: "2025-04-28",
  },
  {
    id: "G002",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "+1 (555) 987-6543",
    nationality: "Canada",
    visits: 1,
    status: "checked-in",
    lastStay: "2025-05-01",
  },
  {
    id: "G003",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    phone: "+1 (555) 456-7890",
    nationality: "UK",
    visits: 5,
    status: "checked-out",
    lastStay: "2025-04-15",
  },
  {
    id: "G004",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    phone: "+1 (555) 234-5678",
    nationality: "Australia",
    visits: 2,
    status: "reserved",
    lastStay: "2025-01-10",
  },
  {
    id: "G005",
    name: "Robert Wilson",
    email: "robert.wilson@example.com",
    phone: "+1 (555) 876-5432",
    nationality: "Germany",
    visits: 4,
    status: "checked-out",
    lastStay: "2025-04-25",
  },
]

export default function GuestsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter guests based on search query
  const filteredGuests = guests.filter((guest) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      guest.name.toLowerCase().includes(searchLower) ||
      guest.email.toLowerCase().includes(searchLower) ||
      guest.phone.includes(searchQuery) ||
      guest.id.toLowerCase().includes(searchLower)
    )
  })

  // Function to get badge variant based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "checked-in":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Checked In
          </Badge>
        )
      case "checked-out":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Checked Out
          </Badge>
        )
      case "reserved":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Reserved
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Format date to display in a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guests</h1>
          <p className="text-muted-foreground">Manage guest information and history</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/guests/new">
            <Plus className="mr-2 h-4 w-4" />
            Register Guest
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>All Guests</CardTitle>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search guests..."
              className="w-full pl-8 sm:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Guest ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Nationality</TableHead>
                  <TableHead className="hidden md:table-cell">Visits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Last Stay</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGuests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No guests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGuests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell className="font-medium">{guest.id}</TableCell>
                      <TableCell>{guest.name}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-col">
                          <div className="flex items-center text-sm">
                            <Mail className="mr-1 h-3 w-3" />
                            {guest.email}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="mr-1 h-3 w-3" />
                            {guest.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{guest.nationality}</TableCell>
                      <TableCell className="hidden md:table-cell">{guest.visits}</TableCell>
                      <TableCell>{getStatusBadge(guest.status)}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(guest.lastStay)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/guests/${guest.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
