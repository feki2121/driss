// lib/meta-pixel.ts
'use client'

declare global {
  interface Window {
    fbq?: (...args: any[]) => void
  }
}

export type MetaEventPayload = {
  content_ids?: string[]
  content_type?: 'product' | 'product_group'
  content_name?: string
  contents?: Array<{ id: string; quantity: number; item_price: number }>
  value?: number
  currency?: string
  num_items?: number
  eventID?: string
  [key: string]: unknown
}

export function trackMetaEvent(eventName: string, payload: MetaEventPayload = {}) {
  if (typeof window === 'undefined' || !window.fbq) return
  const { eventID, ...params } = payload
  // Le 4e argument { eventID } permet la déduplication avec le CAPI
  if (eventID) {
    window.fbq('track', eventName, params, { eventID })
  } else {
    window.fbq('track', eventName, params)
  }
}