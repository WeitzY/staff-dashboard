'use client'

import { Loader2, User, Mail, UserCircle, Shield, Building } from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import { PasswordChangeForm } from './password-change-form'
import { formatDepartmentName } from '@/components/dashboard/department-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ProfileForm() {
  const { profile, isLoading } = useProfile()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Unable to load profile</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Personal Information */}
      <Card className="rounded-2xl border-0 shadow-sm bg-card/50 backdrop-blur">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <UserCircle className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl font-semibold">Personal Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex items-center justify-between h-14 border-b">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Full Name</span>
            </div>
            <p className="font-medium">{profile.name}</p>
          </div>
          
          <div className="flex items-center justify-between h-14 border-b">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Role</span>
            </div>
            <span className="font-medium">
              {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
            </span>
          </div>

          <div className="flex items-center justify-between h-14 border-b">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Department</span>
            </div>
            <p className="font-medium capitalize">{formatDepartmentName(profile.department || '')}</p>
          </div>

          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Email Address</span>
            </div>
            <p className="font-medium">{profile?.email || 'Not available'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="rounded-2xl border-0 shadow-sm bg-card/50 backdrop-blur">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl font-semibold">Change Password</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <PasswordChangeForm />
        </CardContent>
      </Card>
    </div>
  )
}