/**
 * GRANULAR RBAC IMPLEMENTATION GUIDE
 * 
 * This document explains how to implement granular role-based access control
 * across all entities and pages in the application.
 */

// ============================================================================
// 1. BASIC PERMISSION CHECKS WITH usePermission
// ============================================================================
// Use in any component to check if user has permission for an action

import { usePermission } from "@/components/rbac/usePermission";

function MyComponent() {
  const { hasPermission } = usePermission("entity", "Contact", "edit");
  
  if (!hasPermission) {
    return <div>You don't have permission to edit contacts</div>;
  }
  return <div>Edit form...</div>;
}

// ============================================================================
// 2. GUARDING CONTENT WITH PermissionGuard & ActionGuard
// ============================================================================
// PermissionGuard shows restricted message if no permission
// ActionGuard hides element if no permission (returns null)

import { PermissionGuard, ActionGuard } from "@/components/rbac/PermissionGuard";

// Show message if no access
<PermissionGuard resourceType="page" resourceName="Dashboard" action="view">
  <DashboardContent />
</PermissionGuard>

// Hide button if no permission (no message)
<ActionGuard resourceType="entity" resourceName="Contact" action="delete">
  <Button>Delete Contact</Button>
</ActionGuard>

// ============================================================================
// 3. ENTITY-LEVEL PERMISSIONS WITH useEntityPermissions
// ============================================================================
// Get all CRUD + confidential permissions for an entity

import { useEntityPermissions } from "@/components/rbac/useEntityPermissions";

function ContactsPage() {
  const { canView, canCreate, canEdit, canDelete, canViewConfidential } = 
    useEntityPermissions("Contact");

  return (
    <>
      {canCreate && <Button>Add Contact</Button>}
      {canViewConfidential && <div>Show confidential fields</div>}
    </>
  );
}

// ============================================================================
// 4. FILTERING CONFIDENTIAL DATA WITH useDataAccessFilter
// ============================================================================
// Automatically filter/mask records based on user's role

import { useDataAccessFilter } from "@/components/rbac/DataAccessFilter";

function ContactsList() {
  const { filterRecordsForDisplay, canViewField, maskConfidentialFields } = 
    useDataAccessFilter();

  const { data: allContacts } = useQuery({
    queryFn: () => base44.entities.Contact.list(),
  });

  // Filter out confidential records user can't see
  const contacts = allContacts.filter(c => {
    if (!c.confidential_roles?.length) return true;
    return c.confidential_roles.includes(userRole);
  });

  // Or mask sensitive fields
  const displayContacts = contacts.map(c => 
    maskConfidentialFields(c, ["medical_notes", "emergency_contact"])
  );

  return <Table data={displayContacts} />;
}

// ============================================================================
// 5. GUARDING ENTIRE PAGES WITH RouteGuard
// ============================================================================
// Prevent unauthorized access to pages

import { RouteGuard } from "@/components/rbac/RouteGuard";

function AdminPage() {
  return (
    <RouteGuard pageName="AdminDashboard">
      <AdminContent />
    </RouteGuard>
  );
}

// ============================================================================
// 6. CONFIDENTIAL DATA FIELDS WITH ConfidentialField
// ============================================================================
// Show restricted message for fields user can't view

import { ConfidentialField } from "@/components/rbac/ConfidentialAccessGuard";

function ContactDetail({ contact }) {
  return (
    <>
      <ConfidentialField 
        record={contact}
        label="Medical Notes"
        fieldName="medical_notes"
      >
        <textarea>{contact.medical_notes}</textarea>
      </ConfidentialField>
    </>
  );
}

// ============================================================================
// 7. BACKEND ENFORCEMENT WITH checkUserPermission
// ============================================================================
// Enforce permissions on backend functions

import { base44 } from "@/api/base44Client";

// In a page or component:
const { hasPermission } = await base44.functions.invoke('checkUserPermission', {
  resourceType: "entity",
  resourceName: "Contact",
  action: "delete"
});

// ============================================================================
// 8. SETTING UP PERMISSIONS FOR ENTITIES
// ============================================================================
// Ensure you have permissions initialized:

1. Go to User & Role Management page
2. Click "Initialize Permissions" button
3. This creates all CRUD permissions for all entities

Then assign permissions to roles:

1. Click on a Role
2. Select which permissions to grant
3. Save

// ============================================================================
// 9. CONFIDENTIAL DATA SETUP
// ============================================================================
// For sensitive entities like Contact, PastoralCareActivity, PrayerRequest, Activity:

1. Add a "confidential_roles" array field to the entity (already done in schema)
2. When creating records, set confidential_roles to restricting roles
   Example: confidential_roles: ["pastor", "staff"]
3. Use ConfidentialField or filterRecordsForDisplay to control access
4. Initialize permissions for viewing confidential data:
   "view_Contact_Confidential", "edit_Contact_Confidential", etc.

// ============================================================================
// 10. IMPLEMENTATION CHECKLIST
// ============================================================================

✓ Initialize permissions (User & Role Management > Initialize Permissions)
✓ Create custom roles and assign permissions
✓ Wrap list pages with permission filters
✓ Guard action buttons with ActionGuard
✓ Guard page access with RouteGuard
✓ Guard confidential fields with ConfidentialField
✓ Test access with different roles

// ============================================================================
// 11. HOOK REFERENCE
// ============================================================================

usePermission(resourceType, resourceName, action)
  - Returns: { hasPermission: bool, isLoading: bool }
  - Checks if user has specific permission

useEntityPermissions(entityName)
  - Returns: { canView, canCreate, canEdit, canDelete, canViewConfidential, isLoading }
  - Gets all CRUD permissions for entity

usePagePermissions(pageName)
  - Returns: { canAccessPage: bool, isLoading: bool }
  - Checks if user can view page

useDataAccessFilter()
  - Returns: { filterRecordsForDisplay, maskConfidentialFields, canViewField, ... }
  - Filters/masks records based on confidential_roles

useConfidentialDataFilter()
  - Returns: { filterRecords, canViewConfidential, userRole, isAdmin }
  - Checks if user can view confidential data

// ============================================================================
// 12. PERMISSION NAMING CONVENTION
// ============================================================================

Standard CRUD:
  "view_EntityName"      - Can view/list records
  "create_EntityName"    - Can create records
  "edit_EntityName"      - Can edit records
  "delete_EntityName"    - Can delete records

Confidential Data:
  "view_EntityName_Confidential"   - Can view sensitive fields
  "edit_EntityName_Confidential"   - Can edit sensitive fields

Pages:
  "view_PageName"  - Can access page

// ============================================================================