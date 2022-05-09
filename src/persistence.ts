import { EntityReference } from "./entity";

export interface Role {
	name: string;
	operations: string[];
}

export interface AssignedRole {
	name: string;
	actor: EntityReference;
	context: EntityReference;
}

export interface PersistenceStrategy {
	getRoles(roleNames: string[]): Role[] | Promise<Role[]>;
	getAssignedRoles(actor: EntityReference, context: EntityReference): AssignedRole[] | Promise<AssignedRole[]>;
	findRoleByName(name: string): Promise<Role | undefined>;
	createRole(name: string, operations: string[]): Promise<Role>;
	updateRole(name: string, operations: string[]): Role | Promise<Role>;
	assignRole(role: Role, actor: EntityReference, context: EntityReference): Promise<AssignedRole>;
}
