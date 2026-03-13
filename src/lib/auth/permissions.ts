/**
 * Role-based permission system for the spa center platform.
 *
 * 5 roles: OWNER, MANAGER, STAFF, RECEPTIONIST, THERAPIST
 * 20 granular permissions across all resource domains.
 */

// All available permissions in the system
export const PERMISSIONS = {
  // Customers
  'read:customers': 'read:customers',
  'write:customers': 'write:customers',
  'delete:customers': 'delete:customers',

  // Appointments
  'read:appointments': 'read:appointments',
  'write:appointments': 'write:appointments',
  'delete:appointments': 'delete:appointments',

  // Staff
  'read:staff': 'read:staff',
  'write:staff': 'write:staff',
  'delete:staff': 'delete:staff',

  // Services
  'read:services': 'read:services',
  'write:services': 'write:services',
  'delete:services': 'delete:services',

  // Finance
  'read:finance': 'read:finance',
  'write:finance': 'write:finance',
  'delete:finance': 'delete:finance',

  // Inventory
  'read:inventory': 'read:inventory',
  'write:inventory': 'write:inventory',

  // Notes
  'read:notes': 'read:notes',
  'write:notes': 'write:notes',

  // Settings & Admin
  'manage:settings': 'manage:settings',
} as const

export type Permission = keyof typeof PERMISSIONS

// Union type for all roles
export type UserRole = 'OWNER' | 'MANAGER' | 'STAFF' | 'RECEPTIONIST' | 'THERAPIST'

// Role to permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  OWNER: [
    'read:customers',
    'write:customers',
    'delete:customers',
    'read:appointments',
    'write:appointments',
    'delete:appointments',
    'read:staff',
    'write:staff',
    'delete:staff',
    'read:services',
    'write:services',
    'delete:services',
    'read:finance',
    'write:finance',
    'delete:finance',
    'read:inventory',
    'write:inventory',
    'read:notes',
    'write:notes',
    'manage:settings',
  ],

  MANAGER: [
    'read:customers',
    'write:customers',
    'delete:customers',
    'read:appointments',
    'write:appointments',
    'delete:appointments',
    'read:staff',
    'write:staff',
    'read:services',
    'write:services',
    'read:finance',
    'write:finance',
    'read:inventory',
    'write:inventory',
    'read:notes',
    'write:notes',
  ],

  STAFF: [
    'read:customers',
    'write:customers',
    'read:appointments',
    'write:appointments',
    'read:services',
    'read:inventory',
    'read:notes',
    'write:notes',
  ],

  RECEPTIONIST: [
    'read:customers',
    'write:customers',
    'read:appointments',
    'write:appointments',
    'read:services',
    'read:notes',
    'write:notes',
  ],

  THERAPIST: [
    'read:customers',
    'read:appointments',
    'write:appointments',
    'read:services',
    'read:notes',
    'write:notes',
  ],
} as const

/**
 * Checks whether a given role has a specific permission.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false
  return permissions.includes(permission)
}

/**
 * Returns all permissions for a given role.
 */
export function getPermissions(role: UserRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}

/**
 * Checks whether a role string is a valid UserRole.
 */
export function isValidRole(role: string): role is UserRole {
  return ['OWNER', 'MANAGER', 'STAFF', 'RECEPTIONIST', 'THERAPIST'].includes(role)
}
