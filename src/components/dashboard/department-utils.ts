export const AVAILABLE_DEPARTMENTS = [
  { code: 'front_desk', name: 'Front Desk' },
  { code: 'housekeeping', name: 'Housekeeping' },
  { code: 'maintenance', name: 'Maintenance' },
  { code: 'kitchen', name: 'Kitchen' },
  { code: 'food_beverage', name: 'Food & Beverage' },
  { code: 'concierge', name: 'Concierge' },
  { code: 'security', name: 'Security' },
  { code: 'management', name: 'Management' },
  { code: 'laundry', name: 'Laundry' },
  { code: 'spa', name: 'Spa' }
]

export const formatDepartmentName = (dept: string) => {
  const departmentInfo = AVAILABLE_DEPARTMENTS.find(d => d.code === dept)
  return departmentInfo
    ? departmentInfo.name
    : dept
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}


