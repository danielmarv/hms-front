"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  FileText,
  Mail,
  Phone,
  Globe,
  MapPin,
  CreditCard,
  Clock,
  DollarSign,
  Star,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Eye,
  Plus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useSuppliers } from "@/hooks/use-suppliers"

export default function SupplierDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const supplierId = params.id as string

  const {
    supplier,
    supplierItems,
    loading,
    error,
    getSupplierById,
    getSupplierItems,
    deleteSupplier,
    toggleSupplierStatus,
  } = useSuppliers()

  useEffect(() => {
    if (supplierId) {
      getSupplierById(supplierId)
      getSupplierItems(supplierId)
    }
  }, [supplierId, getSupplierById, getSupplierItems])

  const handleDelete = async () => {
    const success = await deleteSupplier(supplierId)
    if (success) {
      router.push("/dashboard/suppliers")
    }
  }

  const handleToggleStatus = async () => {
    if (supplier) {
      await toggleSupplierStatus(supplierId)
    }
  }

  if (loading && !supplier) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-5 w-full" />
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !supplier) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link href="/dashboard/suppliers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Suppliers
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Error</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Error Loading Supplier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "Supplier not found"}</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link href="/dashboard/suppliers">Return to Suppliers</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Button variant="outline" size="sm" asChild className="mr-4">
            <Link href="/dashboard/suppliers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Suppliers
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{supplier.name}</h1>
          {supplier.code && (
            <Badge variant="outline" className="ml-2">
              {supplier.code}
            </Badge>
          )}
          <Badge variant={supplier.is_active ? "default" : "secondary"} className="ml-2">
            {supplier.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleToggleStatus}>
            {supplier.is_active ? (
              <>
                <ToggleLeft className="mr-2 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <ToggleRight className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/suppliers/${supplierId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this supplier and may affect related
                  inventory items.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="items">Items ({supplierItems?.length || 0})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({supplier.documents?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supplier.contact_person && (
                  <div className="flex items-start">
                    <span className="font-medium w-32">Contact Person:</span>
                    <span>{supplier.contact_person}</span>
                  </div>
                )}

                {supplier.email && (
                  <div className="flex items-start">
                    <Mail className="h-4 w-4 mr-2 mt-1" />
                    <a href={`mailto:${supplier.email}`} className="text-primary hover:underline">
                      {supplier.email}
                    </a>
                  </div>
                )}

                {supplier.phone && (
                  <div className="flex items-start">
                    <Phone className="h-4 w-4 mr-2 mt-1" />
                    <a href={`tel:${supplier.phone}`} className="hover:underline">
                      {supplier.phone}
                    </a>
                  </div>
                )}

                {supplier.alternative_phone && (
                  <div className="flex items-start">
                    <Phone className="h-4 w-4 mr-2 mt-1" />
                    <a href={`tel:${supplier.alternative_phone}`} className="hover:underline">
                      {supplier.alternative_phone} (Alt)
                    </a>
                  </div>
                )}

                {supplier.website && (
                  <div className="flex items-start">
                    <Globe className="h-4 w-4 mr-2 mt-1" />
                    <a
                      href={supplier.website.startsWith("http") ? supplier.website : `https://${supplier.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {supplier.website}
                    </a>
                  </div>
                )}

                {supplier.address && Object.values(supplier.address).some((val) => val) && (
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-1" />
                    <div>
                      {supplier.address.street && <div>{supplier.address.street}</div>}
                      {(supplier.address.city || supplier.address.state || supplier.address.postal_code) && (
                        <div>
                          {supplier.address.city && `${supplier.address.city}, `}
                          {supplier.address.state && `${supplier.address.state} `}
                          {supplier.address.postal_code && supplier.address.postal_code}
                        </div>
                      )}
                      {supplier.address.country && <div>{supplier.address.country}</div>}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supplier.tax_id && (
                  <div className="flex items-start">
                    <span className="font-medium w-32">Tax ID:</span>
                    <span>{supplier.tax_id}</span>
                  </div>
                )}

                {supplier.payment_terms && (
                  <div className="flex items-start">
                    <CreditCard className="h-4 w-4 mr-2 mt-1" />
                    <span>Terms: {supplier.payment_terms}</span>
                  </div>
                )}

                {supplier.credit_limit !== undefined && (
                  <div className="flex items-start">
                    <DollarSign className="h-4 w-4 mr-2 mt-1" />
                    <span>
                      Credit Limit: {supplier.credit_limit} {supplier.currency || "USD"}
                    </span>
                  </div>
                )}

                {supplier.lead_time !== undefined && (
                  <div className="flex items-start">
                    <Clock className="h-4 w-4 mr-2 mt-1" />
                    <span>Lead Time: {supplier.lead_time} days</span>
                  </div>
                )}

                {supplier.minimum_order !== undefined && (
                  <div className="flex items-start">
                    <Package className="h-4 w-4 mr-2 mt-1" />
                    <span>
                      Min. Order: {supplier.minimum_order} {supplier.currency || "USD"}
                    </span>
                  </div>
                )}

                {supplier.rating !== undefined && (
                  <div className="flex items-start">
                    <Star className="h-4 w-4 mr-2 mt-1 text-yellow-500" />
                    <span>Rating: {supplier.rating}/5</span>
                  </div>
                )}

                {supplier.bank_details && Object.values(supplier.bank_details).some((val) => val) && (
                  <>
                    <Separator />
                    <div className="pt-2">
                      <h4 className="font-medium mb-2">Bank Details</h4>
                      {supplier.bank_details.bank_name && (
                        <div className="text-sm">Bank: {supplier.bank_details.bank_name}</div>
                      )}
                      {supplier.bank_details.account_name && (
                        <div className="text-sm">Account Name: {supplier.bank_details.account_name}</div>
                      )}
                      {supplier.bank_details.account_number && (
                        <div className="text-sm">Account #: {supplier.bank_details.account_number}</div>
                      )}
                      {supplier.bank_details.swift_code && (
                        <div className="text-sm">SWIFT/BIC: {supplier.bank_details.swift_code}</div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Categories & Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supplier.categories && supplier.categories.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {supplier.categories.map((category, index) => (
                        <Badge key={index} variant="outline">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {supplier.notes && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-sm whitespace-pre-line">{supplier.notes}</p>
                  </div>
                )}

                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Created: {new Date(supplier.createdAt).toLocaleString()}</p>
                  <p>Last Updated: {new Date(supplier.updatedAt).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Items</CardTitle>
              <CardDescription>Items supplied by this supplier</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </div>
              ) : supplierItems && supplierItems.length > 0 ? (
                <div className="rounded-md border">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="h-12 px-4 text-left font-medium">Name</th>
                        <th className="h-12 px-4 text-left font-medium">Category</th>
                        <th className="h-12 px-4 text-left font-medium">SKU</th>
                        <th className="h-12 px-4 text-left font-medium">Stock</th>
                        <th className="h-12 px-4 text-left font-medium">Unit Price</th>
                        <th className="h-12 px-4 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplierItems.map((item) => (
                        <tr key={item._id} className="border-b">
                          <td className="p-4 align-middle font-medium">{item.name}</td>
                          <td className="p-4 align-middle">
                            <Badge variant="outline">{item.category}</Badge>
                          </td>
                          <td className="p-4 align-middle">{item.sku}</td>
                          <td className="p-4 align-middle">{item.currentStock}</td>
                          <td className="p-4 align-middle">${item.unitPrice?.toFixed(2)}</td>
                          <td className="p-4 align-middle text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/inventory/${item._id}`}>
                                <Eye className="h-4 w-4 mr-1" /> View
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No inventory items found for this supplier.</p>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link href="/dashboard/inventory/new">
                      <Plus className="h-4 w-4 mr-2" /> Add Inventory Item
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
              <CardDescription>Documents associated with this supplier</CardDescription>
            </CardHeader>
            <CardContent>
              {supplier.documents && supplier.documents.length > 0 ? (
                <div className="rounded-md border">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="h-12 px-4 text-left font-medium">Name</th>
                        <th className="h-12 px-4 text-left font-medium">Type</th>
                        <th className="h-12 px-4 text-left font-medium">Uploaded</th>
                        <th className="h-12 px-4 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {supplier.documents.map((doc) => (
                        <tr key={doc._id} className="border-b">
                          <td className="p-4 align-middle font-medium">{doc.name}</td>
                          <td className="p-4 align-middle">
                            <Badge variant="outline">{doc.type}</Badge>
                          </td>
                          <td className="p-4 align-middle">{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                          <td className="p-4 align-middle text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                <FileText className="h-4 w-4 mr-1" /> View
                              </a>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No documents found for this supplier.</p>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link href={`/dashboard/suppliers/${supplierId}/documents/add`}>
                      <Plus className="h-4 w-4 mr-2" /> Add Document
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
