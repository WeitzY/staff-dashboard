'use client'

import { Loader2 } from 'lucide-react'
import { useHotelManagement } from '@/hooks/useHotelManagement'
import { HotelStatusSection } from './hotel-status-section'
import { DepartmentsSection } from './departments-section'
import { LanguagesSection } from './languages-section'



export function HotelManagementSection() {
  const { hotel, isLoading, isUpdating, updateHotel } = useHotelManagement()

  if (isLoading || !hotel) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <HotelStatusSection hotel={hotel} />
      <DepartmentsSection 
        hotel={hotel} 
        isUpdating={isUpdating} 
        onUpdate={updateHotel} 
      />
      <LanguagesSection 
        hotel={hotel} 
        isUpdating={isUpdating} 
        onUpdate={updateHotel} 
      />
    </div>
  )
}
