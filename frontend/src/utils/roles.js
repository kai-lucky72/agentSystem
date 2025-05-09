export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALES_STAFF: 'sales_staff',
  TEAM_LEADER: 'team_leader',
  INDIVIDUAL_AGENT: 'individual_agent',
  SALES_AGENT: 'sales_agent',
};

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 1,
  [ROLES.MANAGER]: 2,
  [ROLES.SALES_STAFF]: 3,
  [ROLES.TEAM_LEADER]: 4,
  [ROLES.INDIVIDUAL_AGENT]: 5,
  [ROLES.SALES_AGENT]: 5,
};

export const isRoleHigherOrEqual = (roleA, roleB) => {
  return ROLE_HIERARCHY[roleA] <= ROLE_HIERARCHY[roleB];
};

export const getRoleName = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return 'Admin';
    case ROLES.MANAGER:
      return 'Manager';
    case ROLES.SALES_STAFF:
      return 'Sales Staff';
    case ROLES.TEAM_LEADER:
      return 'Team Leader';
    case ROLES.INDIVIDUAL_AGENT:
      return 'Individual Agent';
    case ROLES.SALES_AGENT:
      return 'Sales Agent';
    default:
      return role;
  }
};