"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ArrowLeft, Save, Upload, FileText, Receipt, Quote, RefreshCw } from "lucide-react"
import { useTemplates } from "@/hooks/use-templates"

export default function TemplatesPage() {
  const router = useRouter()
  const { templates, isLoading, getTemplates, updateTemplate, uploadLogo } = useTemplates()

  const [activeTab, setActiveTab] = useState("invoice")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const [invoiceTemplate, setInvoiceTemplate] = useState({
    header: "",
    footer: "",
    terms: "",
    notes: "",
    logoUrl: "",
  })

  const [receiptTemplate, setReceiptTemplate] = useState({
    header: "",
    footer: "",
    notes: "",
    logoUrl: "",
  })

  const [quotationTemplate, setQuotationTemplate] = useState({
    header: "",
    footer: "",
    terms: "",
    validityPeriod: 30,
    notes: "",
    logoUrl: "",
  })

  useEffect(() => {
    const loadTemplates = async () => {
      await getTemplates()
    }
    loadTemplates()
  }, [])

  useEffect(() => {
    if (templates) {
      const invoice = templates.find((t) => t.type === "invoice")
      const receipt = templates.find((t) => t.type === "receipt")
      const quotation = templates.find((t) => t.type === "quotation")

      if (invoice) {
        setInvoiceTemplate({
          header: invoice.header || "",
          footer: invoice.footer || "",
          terms: invoice.terms || "",
          notes: invoice.notes || "",
          logoUrl: invoice.logoUrl || "",
        })
      }

      if (receipt) {
        setReceiptTemplate({
          header: receipt.header || "",
          footer: receipt.footer || "",
          notes: receipt.notes || "",
          logoUrl: receipt.logoUrl || "",
        })
      }

      if (quotation) {
        setQuotationTemplate({
          header: quotation.header || "",
          footer: quotation.footer || "",
          terms: quotation.terms || "",
          validityPeriod: quotation.validityPeriod || 30,
          notes: quotation.notes || "",
          logoUrl: quotation.logoUrl || "",
        })
      }
    }
  }, [templates])

  const handleSaveInvoiceTemplate = async () => {
    try {
      await updateTemplate("invoice", invoiceTemplate)
      toast.success("Invoice template saved successfully")
    } catch (error) {
      toast.error("Failed to save invoice template")
    }
  }

  const handleSaveReceiptTemplate = async () => {
    try {
      await updateTemplate("receipt", receiptTemplate)
      toast.success("Receipt template saved successfully")
    } catch (error) {
      toast.error("Failed to save receipt template")
    }
  }

  const handleSaveQuotationTemplate = async () => {
    try {
      await updateTemplate("quotation", quotationTemplate)
      toast.success("Quotation template saved successfully")
    } catch (error) {
      toast.error("Failed to save quotation template")
    }
  }

  const handleLogoUpload = async () => {
    if (!logoFile) {
      toast.error("Please select a logo file")
      return
    }

    setIsUploading(true)
    try {
      const logoUrl = await uploadLogo(logoFile)

      // Update all templates with the new logo URL
      setInvoiceTemplate((prev) => ({ ...prev, logoUrl }))
      setReceiptTemplate((prev) => ({ ...prev, logoUrl }))
      setQuotationTemplate((prev) => ({ ...prev, logoUrl }))

      // Save the templates with the new logo
      await updateTemplate("invoice", { ...invoiceTemplate, logoUrl })
      await updateTemplate("receipt", { ...receiptTemplate, logoUrl })
      await updateTemplate("quotation", { ...quotationTemplate, logoUrl })

      toast.success("Logo uploaded and applied to all templates")
    } catch (error) {
      toast.error("Failed to upload logo")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/settings")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Document Templates</h1>
            <p className="text-muted-foreground">Customize templates for invoices, receipts, and quotations</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Logo</CardTitle>
          <CardDescription>Upload your company logo to be used on all document templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 border rounded flex items-center justify-center overflow-hidden">
              {invoiceTemplate.logoUrl || receiptTemplate.logoUrl || quotationTemplate.logoUrl ? (
                <img
                  src={invoiceTemplate.logoUrl || receiptTemplate.logoUrl || quotationTemplate.logoUrl}
                  alt="Company Logo"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <FileText className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="logo">Upload Logo</Label>
              <Input
                id="logo"
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-muted-foreground">
                Recommended size: 300x100 pixels, max 2MB. Formats: PNG, JPG, SVG
              </p>
            </div>
            <Button onClick={handleLogoUpload} disabled={!logoFile || isUploading} className="self-end">
              {isUploading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="invoice" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Invoice Template
              </TabsTrigger>
              <TabsTrigger value="receipt" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                Receipt Template
              </TabsTrigger>
              <TabsTrigger value="quotation" className="flex items-center gap-2">
                <Quote className="h-4 w-4" />
                Quotation Template
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <TabsContent value="invoice" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceHeader">Header</Label>
                  <Textarea
                    id="invoiceHeader"
                    placeholder="Enter invoice header text"
                    rows={3}
                    value={invoiceTemplate.header}
                    onChange={(e) => setInvoiceTemplate({ ...invoiceTemplate, header: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    This text appears at the top of the invoice. You can use HTML tags for formatting.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceTerms">Terms & Conditions</Label>
                  <Textarea
                    id="invoiceTerms"
                    placeholder="Enter terms and conditions"
                    rows={4}
                    value={invoiceTemplate.terms}
                    onChange={(e) => setInvoiceTemplate({ ...invoiceTemplate, terms: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceNotes">Notes</Label>
                  <Textarea
                    id="invoiceNotes"
                    placeholder="Enter additional notes"
                    rows={3}
                    value={invoiceTemplate.notes}
                    onChange={(e) => setInvoiceTemplate({ ...invoiceTemplate, notes: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceFooter">Footer</Label>
                  <Textarea
                    id="invoiceFooter"
                    placeholder="Enter invoice footer text"
                    rows={2}
                    value={invoiceTemplate.footer}
                    onChange={(e) => setInvoiceTemplate({ ...invoiceTemplate, footer: e.target.value })}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveInvoiceTemplate}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Invoice Template
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="receipt" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="receiptHeader">Header</Label>
                  <Textarea
                    id="receiptHeader"
                    placeholder="Enter receipt header text"
                    rows={3}
                    value={receiptTemplate.header}
                    onChange={(e) => setReceiptTemplate({ ...receiptTemplate, header: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiptNotes">Notes</Label>
                  <Textarea
                    id="receiptNotes"
                    placeholder="Enter additional notes"
                    rows={3}
                    value={receiptTemplate.notes}
                    onChange={(e) => setReceiptTemplate({ ...receiptTemplate, notes: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiptFooter">Footer</Label>
                  <Textarea
                    id="receiptFooter"
                    placeholder="Enter receipt footer text"
                    rows={2}
                    value={receiptTemplate.footer}
                    onChange={(e) => setReceiptTemplate({ ...receiptTemplate, footer: e.target.value })}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveReceiptTemplate}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Receipt Template
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="quotation" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quotationHeader">Header</Label>
                  <Textarea
                    id="quotationHeader"
                    placeholder="Enter quotation header text"
                    rows={3}
                    value={quotationTemplate.header}
                    onChange={(e) => setQuotationTemplate({ ...quotationTemplate, header: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quotationTerms">Terms & Conditions</Label>
                    <Textarea
                      id="quotationTerms"
                      placeholder="Enter terms and conditions"
                      rows={4}
                      value={quotationTemplate.terms}
                      onChange={(e) => setQuotationTemplate({ ...quotationTemplate, terms: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quotationNotes">Notes</Label>
                    <Textarea
                      id="quotationNotes"
                      placeholder="Enter additional notes"
                      rows={4}
                      value={quotationTemplate.notes}
                      onChange={(e) => setQuotationTemplate({ ...quotationTemplate, notes: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="validityPeriod">Default Validity Period (days)</Label>
                    <Input
                      id="validityPeriod"
                      type="number"
                      min={1}
                      value={quotationTemplate.validityPeriod}
                      onChange={(e) =>
                        setQuotationTemplate({
                          ...quotationTemplate,
                          validityPeriod: Number.parseInt(e.target.value) || 30,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quotationFooter">Footer</Label>
                    <Textarea
                      id="quotationFooter"
                      placeholder="Enter quotation footer text"
                      rows={2}
                      value={quotationTemplate.footer}
                      onChange={(e) => setQuotationTemplate({ ...quotationTemplate, footer: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveQuotationTemplate}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Quotation Template
                  </Button>
                </div>
              </TabsContent>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
