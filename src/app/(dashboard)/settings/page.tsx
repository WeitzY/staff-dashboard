'use client'

import { useState } from 'react'
import { Shield, User, Users } from 'lucide-react'
import { ProfileForm } from '@/components/profile/profile-form'
import { useStaffManagement } from '@/hooks/useStaffManagement'
import { useAuth } from '@/hooks/useAuth'
import { StaffManagementModal } from '@/components/staff-management/staff-management-modal'
import { StaffManagementSection } from '@/components/staff-management/staff-management-section'
import { HotelManagementSection } from '@/components/admin-panel/hotel-management-section'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import type { Database } from '@/lib/supabase/types'

type HotelStaff = Database['public']['Tables']['hotel_staff']['Row']

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [editingStaff, setEditingStaff] = useState<HotelStaff | null>(null)
  const [isCreatingStaff, setIsCreatingStaff] = useState(false)
  
  const { isAdminOrOwner } = useAuth()

  const { 
    staffMembers, 
    isLoading, 
    isCreating, 
    isUpdating,
    createStaffMember, 
    updateStaffMember, 
    deleteStaffMember 
  } = useStaffManagement()

  const startCreatingStaff = () => {
    setIsCreatingStaff(true)
    setEditingStaff(null)
  }

  const startEditingStaff = (staff: HotelStaff) => {
    setEditingStaff(staff)
    setIsCreatingStaff(false)
  }

  const handleSaveStaff = async (formData: {
    name: string
    email: string
    password: string
    confirmPassword: string
    role: string
    department: string
  }) => {
    try {
      if (isCreatingStaff) {
        await createStaffMember(formData)
      } else if (editingStaff) {
        await updateStaffMember(editingStaff.id || '', {
          name: formData.name,
          role: formData.role,
          department: formData.department
        })
      }
      setEditingStaff(null)
      setIsCreatingStaff(false)
    } catch {
      // Error is handled in the hook
    }
  }

  const handleDeleteStaff = async (staff: HotelStaff) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      await deleteStaffMember(staff.id || '')
    }
  }

  const handleCloseModal = () => {
    setEditingStaff(null)
    setIsCreatingStaff(false)
  }

  const isModalOpen = editingStaff !== null || isCreatingStaff

  return (
    <div className="space-y-8">
      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {isAdminOrOwner && (
          <TabsList className="grid w-full grid-cols-3 h-auto md:h-14 rounded-2xl bg-transparent gap-x-2">
            <TabsTrigger value="profile" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 h-auto md:h-12 p-3 md:p-4 rounded-xl font-semibold text-sm md:text-base">
              <User className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-xs md:text-base">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 h-auto md:h-12 p-3 md:p-4 rounded-xl font-semibold text-sm md:text-base">
              <Users className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-xs md:text-base hidden md:inline">Staff Management</span>
              <span className="text-xs md:hidden">Staff</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex flex-col md:flex-row items-center gap-1 md:gap-3 h-auto md:h-12 p-3 md:p-4 rounded-xl font-semibold text-sm md:text-base">
              <Shield className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-xs md:text-base hidden md:inline">Admin Panel</span>
              <span className="text-xs md:hidden">Admin</span>
            </TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="profile" className={`space-y-8 ${isAdminOrOwner ? 'mt-8' : 'mt-0'}`}>
          {/* Profile Information Card */}
          <div className="space-y-8">
            <ProfileForm />
          </div>
        </TabsContent>

        {isAdminOrOwner && (
          <TabsContent value="staff" className="space-y-8 mt-8">
            {/* Staff Management */}
            <StaffManagementSection
              staffMembers={staffMembers}
              isLoading={isLoading}
              onCreateStaff={startCreatingStaff}
              onEditStaff={startEditingStaff}
              onDeleteStaff={handleDeleteStaff}
            />
          </TabsContent>
        )}

        {isAdminOrOwner && (
          <TabsContent value="admin" className="space-y-8 mt-8">
            {/* Hotel Management */}
            <HotelManagementSection />
          </TabsContent>
        )}
      </Tabs>

      {/* Staff Edit/Create Modal - Only for Admin/Owner */}
      {isAdminOrOwner && (
        <StaffManagementModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          editingStaff={editingStaff}
          isCreating={isCreating}
          isUpdating={isUpdating}
          onSave={handleSaveStaff}
        />
      )}
    </div>
  )
} 