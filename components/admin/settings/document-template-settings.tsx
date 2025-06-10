"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Receipt, Quote } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DocumentTemplateSettings() {
  const router = useRouter()

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Invoice Templates</CardTitle>
          <CardDescription>Customize invoice templates with your branding and content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-[3/4] bg-muted rounded-md flex items-center justify-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
          <Button variant="outline" className="w-full" onClick={() => router.push("/admin/settings/templates")}>
            <FileText className="mr-2 h-4 w-4" />
            Edit Invoice Template
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Receipt Templates</CardTitle>
          <CardDescription>Customize receipt templates for payments and transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-[3/4] bg-muted rounded-md flex items-center justify-center">
            <Receipt className="h-12 w-12 text-muted-foreground" />
          </div>
          <Button variant="outline" className="w-full" onClick={() => router.push("/admin/settings/templates")}>
            <Receipt className="mr-2 h-4 w-4" />
            Edit Receipt Template
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quotation Templates</CardTitle>
          <CardDescription>Customize quotation templates for price estimates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-[3/4] bg-muted rounded-md flex items-center justify-center">
            <Quote className="h-12 w-12 text-muted-foreground" />
          </div>
          <Button variant="outline" className="w-full" onClick={() => router.push("/admin/settings/templates")}>
            <Quote className="mr-2 h-4 w-4" />
            Edit Quotation Template
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
