export const ROLE_HIERARCHY = {
	owner: 3,
	admin: 2,
	member: 1,
} as const;

type OrgRole = keyof typeof ROLE_HIERARCHY;

export function hasMinRole(userRole: string, requiredRole: OrgRole): boolean {
	const userLevel = ROLE_HIERARCHY[userRole as OrgRole] ?? 0;
	const requiredLevel = ROLE_HIERARCHY[requiredRole];
	return userLevel >= requiredLevel;
}

export function canManageMembers(role: string): boolean {
	return hasMinRole(role, "admin");
}

export function canManageBoards(role: string): boolean {
	return hasMinRole(role, "admin");
}

export function canAssignRole(
	assignerRole: string,
	targetRole: string,
): boolean {
	const assignerLevel = ROLE_HIERARCHY[assignerRole as OrgRole] ?? 0;
	const targetLevel = ROLE_HIERARCHY[targetRole as OrgRole] ?? 0;
	return assignerLevel > targetLevel;
}

export function getAssignableRoles(assignerRole: string): OrgRole[] {
	return (Object.keys(ROLE_HIERARCHY) as OrgRole[]).filter((role) =>
		canAssignRole(assignerRole, role),
	);
}
