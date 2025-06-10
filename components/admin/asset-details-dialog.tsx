"use client"

import { useState } from "react"
import { Calendar, MapPin, DollarSign, Wrench, Shield, FileText, Edit } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Asset } from "@/hooks/use-assets"

interface AssetDetailsDialogProps {
  asset: Asset | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssetDetailsDialog({ asset, open, onOpenChange }: AssetDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState("overview")

  if (!asset) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "retired":
        return "bg-blue-100 text-blue-800"
      case "disposed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent":
        return "bg-green-100 text-green-800"
      case "good":
        return "bg-blue-100 text-blue-800"
      case "fair":
        return "bg-yellow-100 text-yellow-800"
      case "poor":
        return "bg-orange-100 text-orange-800"
      case "damaged":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount)
  }

  const formatDate = (date: string | Date) => {
    if (!date) return "Not set"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">{asset.name}</DialogTitle>
              <p className="text-muted-foreground">Asset ID: {asset.assetId}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(asset.status)}>{asset.status}</Badge>
              <Badge className={getConditionColor(asset.condition)}>{asset.condition}</Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Basic Information</CardTitle>
                    <FileText className="h-4 w-4 ml-auto text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Category:</span>
                      <span className="text-sm font-medium capitalize">{asset.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <span className="text-sm font-medium capitalize">{asset.type}</span>
                    </div>
                    {asset.subcategory && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Subcategory:</span>
                        <span className="text-sm font-medium">{asset.subcategory}</span>
                      </div>
                    )}
                    {asset.description && (
                      <div>
                        <span className="text-sm text-muted-foreground">Description:</span>
                        <p className="text-sm mt-1">{asset.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Location & Assignment</CardTitle>
                    <MapPin className="h-4 w-4 ml-auto text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Building:</span>
                      <span className="text-sm font-medium">{asset.location.building || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Floor:</span>
                      <span className="text-sm font-medium">{asset.location.floor || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Room:</span>
                      <span className="text-sm font-medium">{asset.location.room || "Not specified"}</span>
                    </div>
                    {asset.assignedTo?.user && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Assigned to:</span>
                        <span className="text-sm font-medium">
                          {asset.assignedTo.user.firstName} {asset.assignedTo.user.lastName}
                        </span>
                      </div>
                    )}
                    {asset.assignedTo?.department && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Department:</span>
                        <span className="text-sm font-medium">{asset.assignedTo.department}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Specifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {asset.specifications.manufacturer && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Manufacturer:</span>
                        <span className="text-sm font-medium">{asset.specifications.manufacturer}</span>
                      </div>
                    )}
                    {asset.specifications.model && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Model:</span>
                        <span className="text-sm font-medium">{asset.specifications.model}</span>
                      </div>
                    )}
                    {asset.specifications.serialNumber && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Serial Number:</span>
                        <span className="text-sm font-medium">{asset.specifications.serialNumber}</span>
                      </div>
                    )}
                    {asset.specifications.version && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Version:</span>
                        <span className="text-sm font-medium">{asset.specifications.version}</span>
                      </div>
                    )}
                    {asset.specifications.capacity && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Capacity:</span>
                        <span className="text-sm font-medium">{asset.specifications.capacity}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Security & Classification</CardTitle>
                    <Shield className="h-4 w-4 ml-auto text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Classification:</span>
                      <Badge variant="outline" className="capitalize">
                        {asset.security?.classification || "internal"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Access Level:</span>
                      <Badge variant="outline" className="capitalize">
                        {asset.security?.accessLevel || "medium"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Encryption:</span>
                      <Badge variant="outline" className="capitalize">
                        {asset.security?.encryptionStatus || "not-encrypted"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Purchase Information</CardTitle>
                    <DollarSign className="h-4 w-4 ml-auto text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Purchase Price:</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(asset.financial.purchasePrice, asset.financial.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Current Value:</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(asset.financial.currentValue, asset.financial.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Purchase Date:</span>
                      <span className="text-sm font-medium">{formatDate(asset.financial.purchaseDate)}</span>
                    </div>
                    {asset.financial.invoiceNumber && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Invoice Number:</span>
                        <span className="text-sm font-medium">{asset.financial.invoiceNumber}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Warranty & Depreciation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Warranty Expiry:</span>
                      <span className="text-sm font-medium">{formatDate(asset.financial.warrantyExpiry)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Depreciation Rate:</span>
                      <span className="text-sm font-medium">{asset.financial.depreciationRate}% per month</span>
                    </div>
                    {asset.financial.supplier && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Supplier:</span>
                        <span className="text-sm font-medium">{asset.financial.supplier.name}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Maintenance Schedule</CardTitle>
                    <Wrench className="h-4 w-4 ml-auto text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Frequency:</span>
                      <span className="text-sm font-medium capitalize">
                        {asset.maintenance.schedule.frequency || "As needed"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Performed:</span>
                      <span className="text-sm font-medium">
                        {formatDate(asset.maintenance.schedule.lastPerformed)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Next Due:</span>
                      <span className="text-sm font-medium">{formatDate(asset.maintenance.schedule.nextDue)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lifecycle</CardTitle>
                    <Calendar className="h-4 w-4 ml-auto text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Acquisition Date:</span>
                      <span className="text-sm font-medium">{formatDate(asset.lifecycle?.acquisitionDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Deployment Date:</span>
                      <span className="text-sm font-medium">{formatDate(asset.lifecycle?.deploymentDate)}</span>
                    </div>
                    {asset.lifecycle?.expectedLifespan && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Expected Lifespan:</span>
                        <span className="text-sm font-medium">{asset.lifecycle.expectedLifespan} months</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {asset.maintenance.history && asset.maintenance.history.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Maintenance History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {asset.maintenance.history.slice(0, 5).map((record, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize">
                                {record.type}
                              </Badge>
                              <span className="text-sm font-medium">{formatDate(record.date)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{record.description}</p>
                            {record.performedBy && (
                              <p className="text-xs text-muted-foreground">Performed by: {record.performedBy}</p>
                            )}
                          </div>
                          {record.cost && (
                            <div className="text-right">
                              <span className="text-sm font-medium">{formatCurrency(record.cost)}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <div className="grid gap-4">
                {asset.compliance?.regulations && asset.compliance.regulations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Regulations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {asset.compliance.regulations.map((regulation, index) => (
                          <Badge key={index} variant="outline">
                            {regulation}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {asset.compliance?.certifications && asset.compliance.certifications.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Certifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {asset.compliance.certifications.map((cert, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{cert.name}</h4>
                                <p className="text-sm text-muted-foreground">Issued by: {cert.issuer}</p>
                                <p className="text-sm text-muted-foreground">Certificate #: {cert.certificateNumber}</p>
                              </div>
                              <div className="text-right text-sm">
                                <div>Issued: {formatDate(cert.issueDate)}</div>
                                <div>Expires: {formatDate(cert.expiryDate)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Asset History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Created:</span>
                    <span className="text-sm font-medium">{formatDate(asset.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Updated:</span>
                    <span className="text-sm font-medium">{formatDate(asset.updatedAt)}</span>
                  </div>
                  {asset.createdBy && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Created By:</span>
                      <span className="text-sm font-medium">
                        {asset.createdBy.firstName} {asset.createdBy.lastName}
                      </span>
                    </div>
                  )}
                  {asset.updatedBy && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Updated By:</span>
                      <span className="text-sm font-medium">
                        {asset.updatedBy.firstName} {asset.updatedBy.lastName}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {asset.tags && asset.tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {asset.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {asset.attachments && asset.attachments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Attachments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {asset.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">{attachment.name}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{formatDate(attachment.uploadDate)}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Asset
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
