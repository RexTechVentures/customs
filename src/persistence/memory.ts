import { EntityReference, refEq } from 'src/entity';
import { AssignedRole, PersistenceStrategy, Role } from '.';

export default class MemoryStrategy implements PersistenceStrategy {
	private _roles: Role[];
	private _assignments: AssignedRole[];

	constructor(roles: Role[], assignments: AssignedRole[]) {
		this._roles = roles;
		this._assignments = assignments;
	}

	async getRoles(roleNames: string[]): Promise<Role[]> {
		return this._roles.filter(({ name }) => roleNames.includes(name));
	}

	async getAssignedRoles(actor: EntityReference, context: EntityReference): Promise<AssignedRole[]> {
		return this._assignments.filter(role => refEq(role.actor, actor) && refEq(role.context, context));
	}

	async findRoleByName(name: string): Promise<Role | null | undefined> {
		return this._roles.find(role => role.name === name);
	}

	async createRole(name: string, operations: string[]): Promise<Role> {
		if (await this.findRoleByName(name)) throw new Error('Duplicate role');

		const role: Role = { name, ops: operations };
		this._roles.push(role);
		return role;
	}

	async updateRole(name: string, operations: string[]): Promise<Role> {
		const role = await this.findRoleByName(name);

		if (!role) throw new Error('Role not found');

		role.ops = operations;
		return role;
	}

	async assignRole(role: string, actor: EntityReference, context: EntityReference): Promise<AssignedRole> {
		const assignedRoles = await this.getAssignedRoles(actor, context);

		if (assignedRoles.filter(({ name }) => name === role).length) throw new Error('Duplicate assignment');

		const assignedRole: AssignedRole = {
			name: role,
			actor,
			context,
		};
		this._assignments.push(assignedRole);
		return assignedRole;
	}
}
