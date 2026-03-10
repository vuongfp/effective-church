import { base44 } from "@/api/base44Client";

/**
 * Check if user has a specific permission
 * @param {string} resourceType - 'page' or 'entity'
 * @param {string} resourceName - name of page or entity
 * @param {string} action - 'view', 'create', 'edit', 'delete'
 * @param {object} user - current user object
 * @returns {Promise<boolean>}
 */
export async function checkPermission(resourceType, resourceName, action, user) {
  try {
    // Admins have all permissions
    if (user?.role === "admin") return true;

    // Get user's role permissions
    const rolePermissions = await getRolePermissions(user?.role);

    // Find matching permission
    const hasPermission = rolePermissions.some(rp =>
      rp.permission_name === `${action}_${resourceName}`
    );

    return hasPermission;
  } catch (error) {
    console.error("Permission check failed:", error);
    return false;
  }
}

/**
 * Get all permissions for a role
 */
async function getRolePermissions(userRole) {
  try {
    if (!userRole) return [];

    // Get custom role with this name
    const roles = await base44.entities.CustomRole.filter({ name: userRole });
    if (!roles.length) return [];

    const roleId = roles[0].id;

    // Get role permissions
    const rolePerms = await base44.entities.RolePermission.filter({
      role_id: roleId,
      is_granted: true,
    });

    return rolePerms;
  } catch (error) {
    console.error("Failed to get role permissions:", error);
    return [];
  }
}

/**
 * Check if user can access a page
 */
export async function canAccessPage(pageName, user) {
  return checkPermission("page", pageName, "view", user);
}

/**
 * Check if user can perform action on entity
 */
export async function canAccessEntity(entityName, action, user) {
  return checkPermission("entity", entityName, action, user);
}

/**
 * Initialize system permissions (run once during setup)
 */
export async function initializeSystemPermissions() {
  try {
    // Define all system permissions
    const systemPermissions = [
      // Church Members
      { name: "view_ChurchMembers", resourceType: "page", resourceName: "ChurchMembers", action: "view", category: "Members", description: "View members page" },
      { name: "edit_Contact", resourceType: "entity", resourceName: "Contact", action: "edit", category: "Members", description: "Edit member details" },
      { name: "create_Contact", resourceType: "entity", resourceName: "Contact", action: "create", category: "Members", description: "Add new member" },
      { name: "delete_Contact", resourceType: "entity", resourceName: "Contact", action: "delete", category: "Members", description: "Delete member" },

      // Church Events
      { name: "view_ChurchEvents", resourceType: "page", resourceName: "ChurchEvents", action: "view", category: "Events", description: "View events page" },
      { name: "edit_Activity", resourceType: "entity", resourceName: "Activity", action: "edit", category: "Events", description: "Edit events" },
      { name: "create_Activity", resourceType: "entity", resourceName: "Activity", action: "create", category: "Events", description: "Create events" },

      // Church Finance
      { name: "view_ChurchFinances", resourceType: "page", resourceName: "ChurchFinances", action: "view", category: "Finance", description: "View finances page" },
      { name: "edit_Transaction", resourceType: "entity", resourceName: "Transaction", action: "edit", category: "Finance", description: "Edit transactions" },
      { name: "create_Transaction", resourceType: "entity", resourceName: "Transaction", action: "create", category: "Finance", description: "Create transactions" },
      { name: "view_Budget", resourceType: "entity", resourceName: "Budget", action: "view", category: "Finance", description: "View budget" },

      // Pastoral Care
      { name: "view_PastoralCare", resourceType: "page", resourceName: "PastoralCare", action: "view", category: "Pastoral Care", description: "View pastoral care page" },
      { name: "edit_PastoralCareActivity", resourceType: "entity", resourceName: "PastoralCareActivity", action: "edit", category: "Pastoral Care", description: "Edit pastoral activities" },
      { name: "create_PrayerRequest", resourceType: "entity", resourceName: "PrayerRequest", action: "create", category: "Pastoral Care", description: "Create prayer requests" },

      // Groups
      { name: "view_ChurchGroups", resourceType: "page", resourceName: "ChurchGroups", action: "view", category: "Groups", description: "View groups page" },
      { name: "edit_Group", resourceType: "entity", resourceName: "Group", action: "edit", category: "Groups", description: "Edit groups" },
      { name: "create_Group", resourceType: "entity", resourceName: "Group", action: "create", category: "Groups", description: "Create groups" },

      // Reports
      { name: "view_ChurchReports", resourceType: "page", resourceName: "ChurchReports", action: "view", category: "Reports", description: "View reports" },

      // Staff
      { name: "view_ChurchStaff", resourceType: "page", resourceName: "ChurchStaff", action: "view", category: "Staff", description: "View staff page" },
      { name: "edit_Staff", resourceType: "entity", resourceName: "Staff", action: "edit", category: "Staff", description: "Edit staff" },

      // Tasks
      { name: "view_OperationalTasks", resourceType: "page", resourceName: "OperationalTasks", action: "view", category: "Tasks", description: "View tasks page" },
      { name: "edit_Task", resourceType: "entity", resourceName: "Task", action: "edit", category: "Tasks", description: "Edit tasks" },
      { name: "create_Task", resourceType: "entity", resourceName: "Task", action: "create", category: "Tasks", description: "Create tasks" },
    ];

    // Add permissions that don't already exist
    const existingPerms = await base44.entities.Permission.list();
    for (const perm of systemPermissions) {
      if (!existingPerms.find(p => p.name === perm.name)) {
        await base44.entities.Permission.create({
          ...perm,
          is_system: true,
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Failed to initialize permissions:", error);
    return false;
  }
}

/**
 * Create default roles
 */
export async function initializeDefaultRoles() {
  try {
    const defaultRoles = [
      { name: "admin", description: "Full access", color: "#ef4444" },
      { name: "pastor", description: "Pastoral leadership", color: "#8b5cf6" },
      { name: "staff", description: "Staff member", color: "#3b82f6" },
      { name: "user", description: "Regular member", color: "#10b981" },
    ];

    for (const role of defaultRoles) {
      const existing = await base44.entities.CustomRole.filter({ name: role.name });
      if (!existing.length) {
        await base44.entities.CustomRole.create({
          ...role,
          is_system: true,
          is_active: true,
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Failed to initialize roles:", error);
    return false;
  }
}