"use client"

import type React from "react"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import SignatureCanvas from "react-signature-canvas"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface RegistrationDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  registrationData: any
  hotel?: any
  configuration?: any
  onConfirm: (registrationData: any) => void
}

const RegistrationDocumentDialog: React.FC<RegistrationDocumentDialogProps> = ({
  open,
  onOpenChange,
  registrationData,
  hotel,
  configuration,
  onConfirm,
}) => {
  const [guestSignature, setGuestSignature] = useState<string | null>(null)
  const [agreements, setAgreements] = useState({
    termsAndConditions: false,
    privacyPolicy: false,
    damagePolicy: false,
    noSmokingPolicy: false,
  })
  const [additionalRequests, setAdditionalRequests] = useState("")
  const [signatureCanvas, setSignatureCanvas] = useState<SignatureCanvas | null>(null)

  const handleSignatureEnd = () => {
    if (signatureCanvas) {
      setGuestSignature(signatureCanvas.toDataURL())
    }
  }

  const handleAgreementChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    agreementType: keyof typeof agreements,
  ) => {
    setAgreements({
      ...agreements,
      [agreementType]: event.target.checked,
    })
  }

  const handleClearSignature = () => {
    if (signatureCanvas) {
      signatureCanvas.clear()
      setGuestSignature(null)
    }
  }

  const handleConfirm = () => {
    if (!guestSignature) {
      toast.error("Guest signature is required")
      return
    }

    const completeRegistrationData = {
      // All the original registration data
      ...registrationData,

      // Hotel information
      hotel: {
        name: hotel?.name || "Hotel",
        address: hotel?.address || configuration?.address || "Hotel Address",
        phone: hotel?.contact?.phone || configuration?.phone || "Hotel Phone",
        email: hotel?.contact?.email || configuration?.email || "hotel@example.com",
        logo: hotel?.branding?.logoUrl || configuration?.branding?.logoUrl,
        website: hotel?.contact?.website || configuration?.website,
        tax_id: hotel?.legalInfo?.taxId || configuration?.tax_id,
      },

      // Registration document with signature and agreements
      registration_document: {
        guest_signature: guestSignature,
        agreements: {
          terms_and_conditions: agreements.termsAndConditions,
          privacy_policy: agreements.privacyPolicy,
          damage_policy: agreements.damagePolicy,
          no_smoking_policy: agreements.noSmokingPolicy,
        },
        additional_requests: additionalRequests,
        hotel_policies: {
          check_out_time: configuration?.operational?.checkOutTime || "12:00 PM",
          cancellation_policy: configuration?.operational?.cancellationPolicy,
          damage_policy: configuration?.operational?.damagePolicy,
        },
      },
    }

    onConfirm(completeRegistrationData)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Registration Document</AlertDialogTitle>
          <AlertDialogDescription>
            Please review and sign the registration document for {hotel?.name || "the hotel"}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="signature">Guest Signature</Label>
            <SignatureCanvas
              penColor="black"
              backgroundColor="white"
              canvasProps={{ width: 500, height: 200, className: "border rounded-md" }}
              ref={(canvas) => setSignatureCanvas(canvas)}
              onEnd={handleSignatureEnd}
            />
            <Button variant="outline" size="sm" onClick={handleClearSignature}>
              Clear Signature
            </Button>
          </div>
          <div>
            <Label htmlFor="terms">
              <Checkbox
                id="terms"
                checked={agreements.termsAndConditions}
                onCheckedChange={(checked) =>
                  handleAgreementChange({ target: { checked: checked ?? false } } as any, "termsAndConditions")
                }
              />
              <span className="ml-2">I agree to the Terms and Conditions of {hotel?.name || "the hotel"}</span>
            </Label>
          </div>
          <div>
            <Label htmlFor="privacy">
              <Checkbox
                id="privacy"
                checked={agreements.privacyPolicy}
                onCheckedChange={(checked) =>
                  handleAgreementChange({ target: { checked: checked ?? false } } as any, "privacyPolicy")
                }
              />
              <span className="ml-2">I agree to the Privacy Policy</span>
            </Label>
          </div>
          <div>
            <Label htmlFor="damage">
              <Checkbox
                id="damage"
                checked={agreements.damagePolicy}
                onCheckedChange={(checked) =>
                  handleAgreementChange({ target: { checked: checked ?? false } } as any, "damagePolicy")
                }
              />
              <span className="ml-2">I agree to the Damage Policy</span>
            </Label>
          </div>
          <div>
            <Label htmlFor="smoking">
              <Checkbox
                id="smoking"
                checked={agreements.noSmokingPolicy}
                onCheckedChange={(checked) =>
                  handleAgreementChange({ target: { checked: checked ?? false } } as any, "noSmokingPolicy")
                }
              />
              <span className="ml-2">I agree to the No Smoking Policy</span>
            </Label>
          </div>
          <div>
            <Label htmlFor="requests">Additional Requests</Label>
            <Textarea
              id="requests"
              placeholder="Any additional requests?"
              value={additionalRequests}
              onChange={(e) => setAdditionalRequests(e.target.value)}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default RegistrationDocumentDialog
