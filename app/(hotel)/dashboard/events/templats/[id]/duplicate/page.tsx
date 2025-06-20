"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Copy, Loader2, FileIcon as FileTemplate, CheckCircle } from "lucide-react"
import { useEventTemplates, type EventTemplate } from "@/hooks/use-event-templates"
import { toast } from "sonner"

export default function DuplicateTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const templateId = params.id as string

  const { getTemplateById, duplicateTemplate } = useEventTemplates()

  const [template, setTemplate] = useState<EventTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    newName: "",
    modifications: "",
  })

  // Load template data
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true)
        const templateData = await getTemplateById(templateId)

        if (!templateData) {
          toast.error("Template not found")
          router.push("/dashboard/events/templats")
          return
        }

        setTemplate(templateData)
        setFormData({
          newName: `${templateData.name} (Copy)`,
          modifications: "",
        })
      } catch (error) {
        console.error("Failed to fetch template:", error)
        toast.error("Failed to load template")
        router.push("/dashboard/events/templats")
      } finally {
        setLoading(false)
      }
    }

    if (templateId) {
      fetchTemplate()
    }
  }, [templateId, getTemplateById, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.newName.trim()) {
      toast.error("New template name is required")
      return
    }

    try {
      setIsSubmitting(true)

      const duplicateData = {
        newName: formData.newName.trim(),
        modifications: formData.modifications ? { notes: formData.modifications } : undefined,
      }

      const result = await duplicateTemplate(templateId, duplicateData)

      if (result.success && result.data) {
        toast.success("Template duplicated successfully!")
        router.push(`/dashboard/events/templats/${result.data._id}`)
      }
    } catch (error: any) {
      console.error("Failed to duplicate template:", error)
      toast.error(error.message || "Failed to duplicate template")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
          <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Loading template...</p>
        </div>
      </div>
    )
  }

  if (!template) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-slate-900 dark:via-blue-900 dark:to-cyan-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 dark:border-slate-700/20">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="border-blue-200 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 bg-clip-text text-transparent">
                Duplicate Template
              </h1>
              <p className="text-slate-600 dark:text-slate-300 mt-1">Create a copy of: {template.name}</p>
            </div>
          </div>
          <Copy className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>

        {/* Original Template Preview */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-slate-800 dark:text-slate-200 flex items-center">
              <FileTemplate className="h-5 w-5 mr-2" />
              Original Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Name</p>
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">{template.name}</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Event Type</p>
                <p className="text-lg font-semibold text-green-900 dark:text-green-100">{template.eventType.name}</p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Venue</p>
                <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">{template.venue.name}</p>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Base Price</p>
                <p className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                  ${template.basePrice.toFixed(2)}
                </p>
              </div>
            </div>

            {template.description && (
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Description</p>
                <p className="text-slate-700 dark:text-slate-300">{template.description}</p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Badge variant={template.isActive ? "default" : "secondary"}>
                <CheckCircle className="h-3 w-3 mr-1" />
                {template.isActive ? "Active" : "Inactive"}
              </Badge>
              {template.usageCount && <Badge variant="outline">{template.usageCount} uses</Badge>}
            </div>
          </CardContent>
        </Card>

        {/* Duplication Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">Duplication Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newName" className="text-slate-700 dark:text-slate-300">
                  New Template Name *
                </Label>
                <Input
                  id="newName"
                  value={formData.newName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, newName: e.target.value }))}
                  placeholder="Enter new template name"
                  required
                  className="bg-white/80 dark:bg-slate-700/80"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  This will be the name of your duplicated template
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modifications" className="text-slate-700 dark:text-slate-300">
                  Modification Notes (Optional)
                </Label>
                <Textarea
                  id="modifications"
                  value={formData.modifications}
                  onChange={(e) => setFormData((prev) => ({ ...prev, modifications: e.target.value }))}
                  placeholder="Enter any notes about modifications you plan to make..."
                  rows={3}
                  className="bg-white/80 dark:bg-slate-700/80"
                />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Optional notes about what you plan to change in the duplicated template
                </p>
              </div>
            </CardContent>
          </Card>

          {/* What Will Be Copied */}
          <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800 dark:text-slate-200">What Will Be Copied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-slate-700 dark:text-slate-300">Basic template information</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-slate-700 dark:text-slate-300">Event type and venue settings</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-slate-700 dark:text-slate-300">Duration and capacity settings</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-slate-700 dark:text-slate-300">Pricing information</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-slate-700 dark:text-slate-300">Services and add-ons</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-slate-700 dark:text-slate-300">Staffing requirements</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-slate-700 dark:text-slate-300">Included items list</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-slate-700 dark:text-slate-300">Terms and conditions</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 dark:from-blue-600 dark:to-cyan-700 dark:hover:from-blue-700 dark:hover:to-cyan-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Duplicating...
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate Template
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
