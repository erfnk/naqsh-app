import type { OrganizationMemberRole } from "@repo/auth";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@repo/ui/components/select";
import { useOrganizationMemberRoles } from "@saas/organizations/hooks/member-roles";

export function OrganizationRoleSelect({
	value,
	onSelect,
	disabled,
	allowedRoles,
}: {
	value?: OrganizationMemberRole;
	onSelect: (value: OrganizationMemberRole) => void;
	disabled?: boolean;
	allowedRoles?: OrganizationMemberRole[];
}) {
	const organizationMemberRoles = useOrganizationMemberRoles();

	const roleOptions = Object.entries(organizationMemberRoles)
		.filter(
			([role]) =>
				!allowedRoles ||
				allowedRoles.includes(role as OrganizationMemberRole),
		)
		.map(([value, label]) => ({
			value,
			label,
		}));

	return (
		<Select value={value} onValueChange={(value) => onSelect(value as OrganizationMemberRole)} disabled={disabled}>
			<SelectTrigger>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{roleOptions.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
