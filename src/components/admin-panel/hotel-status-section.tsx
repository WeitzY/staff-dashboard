'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, MessageCircle, Shield, CheckCircle2, Building, Settings } from 'lucide-react'
import type { Database as DatabaseType } from '@/lib/supabase/types'

type Hotel = DatabaseType['public']['Tables']['hotels']['Row']

interface HotelStatusSectionProps {
  hotel: Hotel
}

export function HotelStatusSection({ hotel }: HotelStatusSectionProps) {
  return (
    <Card className="rounded-2xl border-0 shadow-sm bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Building className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-semibold">Hotel Information & System Status</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Move hotel info to the top */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Hotel Name</span>
            </div>
            <span className="font-medium capitalize mb-0">{hotel.name}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Subscription Plan</span>
            </div>
            <span className="font-medium capitalize">{hotel.plan}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Database</span>
            </div>
            <span className="font-medium text-emerald-700 dark:text-emerald-400">Operational</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Chat System</span>
            </div>
            <span className="font-medium text-emerald-700 dark:text-emerald-400">Healthy</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Security</span>
            </div>
            <span className="font-medium text-emerald-700 dark:text-emerald-400">Protected</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Real-time</span>
            </div>
            <span className="font-medium text-emerald-700 dark:text-emerald-400">Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
