"use client"

import { useState } from "react"
import { useApi } from "./use-api"

export interface HotelConfiguration {
  _id: string
  hotel: string
  name: string
  legalName: string
  taxId: string
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  contact: {
    phone: string
    email: string
    website?: string
  }
  branding: {
    logoUrl?: string
    faviconUrl?: string
    primaryColor: string
    secondaryColor: string
    accentColor: string
    fonts: {
      primary: string
      secondary: string
    }
  }
  financial: {
    currency: {
      code: string
      symbol: string
      position: "before" | "after"
    }
    taxRates: Array<{
      name: string
      rate: number
      type: "percentage" | "fixed"
      appliesTo: string[]
    }>
    documentPrefixes: {
      invoice: string
      receipt: string
      quotation: string
      folio: string
    }
  }
  operational: {
    checkInTime: string
    checkOutTime: string
    timeZone: string
    dateFormat: string
    timeFormat: string
    cancellationPolicy: string
    noShowPolicy: string
  }
  features: {
    onlineBooking: boolean
    mobileCheckin: boolean
    keylessEntry: boolean
    loyaltyProgram: boolean
    multiLanguage: boolean
    paymentGateway: boolean
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    bookingConfirmations: boolean
    paymentReminders: boolean
    marketingEmails: boolean
  }
  banking: {
    primaryAccount: {
      bankName: string
      accountName: string
      accountNumber: string
      routingNumber: string
      swiftCode?: string
    }
    paymentMethods: {
      acceptedCards: string[]
      onlinePayments: boolean
      cashPayments: boolean
      bankTransfers: boolean
    }
  }
  chainInheritance?: {
    branding: boolean
    financial: boolean
    operational: boolean
    features: boolean
    notifications: boolean
    documentTemplates: boolean
  }
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
}

export interface EffectiveConfiguration extends HotelConfiguration {
  // This represents the resolved configuration with chain inheritance applied
}

export function useHotelConfiguration() {
  const { request } = useApi()
  const [isLoading, setIsLoading] = useState(false)

  const getHotelConfiguration = async (hotelId: string) => {
    setIsLoading(true)
    try {
      const response = await request(`/hotel-configurations/${hotelId}`, "GET",)
      return response
    } finally {
      setIsLoading(false)
    }
  }

  const createHotelConfiguration = async (configData: Partial<HotelConfiguration>) => {
    setIsLoading(true)
    try {
      const response = await request("/hotel-configurations", "POST")
      return response
    } finally {
      setIsLoading(false)
    }
  }

  const updateHotelConfiguration = async (hotelId: string, configData: Partial<HotelConfiguration>) => {
    setIsLoading(true)
    try {
      const response = await request(`/hotel-configurations/${hotelId}`,"PUT" , configData)
      return response
    } finally {
      setIsLoading(false)
    }
  }

  const updateInheritanceSettings = async (
    hotelId: string,
    chainInheritance: Partial<HotelConfiguration["chainInheritance"]>,
  ) => {
    setIsLoading(true)
    try {
      const response = await request(`/hotel-configurations/${hotelId}/inheritance`,"PUT",
chainInheritance )
      return response
    } finally {
      setIsLoading(false)
    }
  }

  const updateBranding = async (hotelId: string, brandingData: Partial<HotelConfiguration["branding"]>) => {
    setIsLoading(true)
    try {
      const response = await request(`/hotel-configurations/${hotelId}/branding`, "PUT",brandingData)
      return response
    } finally {
      setIsLoading(false)
    }
  }

  const updateBanking = async (hotelId: string, bankingData: Partial<HotelConfiguration["banking"]>) => {
    setIsLoading(true)
    try {
      const response = await request(`/hotel-configurations/${hotelId}/banking`, "PUT", bankingData)
      return response
    } finally {
      setIsLoading(false)
    }
  }

  const generateDocumentNumber = async (hotelId: string, documentType: string) => {
    setIsLoading(true)
    try {
      const response = await request(`/hotel-configurations/${hotelId}/generate-number/${documentType}`, "POST")
      return response
    } finally {
      setIsLoading(false)
    }
  }

  const getDocumentData = async (hotelId: string) => {
    setIsLoading(true)
    try {
      const response = await request(`/hotel-configurations/${hotelId}/document-data`, "GET")
      return response
    } finally {
      setIsLoading(false)
    }
  }

  return {
    getHotelConfiguration,
    createHotelConfiguration,
    updateHotelConfiguration,
    updateInheritanceSettings,
    updateBranding,
    updateBanking,
    generateDocumentNumber,
    getDocumentData,
    isLoading,
  }
}
