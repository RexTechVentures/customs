import { EntityReference } from 'src/entity';

export interface Role {
	name: string;
	ops: string[];
}

export interface AssignedRole {
	name: string;
	actor: EntityReference;
	context: EntityReference;
}

export interface PersistenceStrategy {
	getRoles(roleNames: string[]): Promise<Role[]>;
	getAssignedRoles(actor: EntityReference, context: EntityReference): Promise<AssignedRole[]>;
	findRoleByName(name: string): Promise<Role | null | undefined>;
	createRole(name: string, operations: string[]): Promise<Role>;
	updateRole(name: string, operations: string[]): Promise<Role>;
	assignRole(role: string, actor: EntityReference, context: EntityReference): Promise<AssignedRole>;
}
