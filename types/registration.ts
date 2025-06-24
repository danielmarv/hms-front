export interface RegistrationDocument {
  id: string
  bookingId: string
  guestId: string
  hotelId: string
  documentNumber: string
  guestSignature: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  agreements: {
    termsAndConditions: boolean
    privacyPolicy: boolean
    damagePolicy: boolean
    noSmokingPolicy: boolean
  }
  additionalRequests?: string
  checkInDate: string
  staffId: string
  createdAt: string
  updatedAt: string
}

export interface RegistrationFormData {
  guestSignature: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  agreements: {
    termsAndConditions: boolean
    privacyPolicy: boolean
    damagePolicy: boolean
    noSmokingPolicy: boolean
  }
  additionalRequests?: string
}

export interface RegistrationDocumentFilters {
  startDate?: string
  endDate?: string
  guestName?: string
  documentNumber?: string
  staffId?: string
}
