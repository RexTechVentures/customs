export interface Actor {}
export interface Context {}
export interface Role {
	name: string;
	operations: string[];
}
export interface AssignedRole {
	name: string;
	actor: Actor;
	context: Context;
}
export interface RoleRepository {
	assign(role: Role, actor: Actor, context: Context): Promise<AssignedRole>;
	create(name: string, operations: string[]): Promise<Role>;
	findByName(name: string): Promise<Role | undefined>;
}
export interface HierarchyRepository {}

export default class AuthorizationService {
	private _roleRepo: RoleRepository;
	private _hierRepo: HierarchyRepository;

	constructor(rolesRepository: RoleRepository, hierarchyRepository: HierarchyRepository) {
		this._roleRepo = rolesRepository;
		this._hierRepo = hierarchyRepository;
	}

	async defineRole(name: string, operations: string[]): Promise<Role> {
		const role = await this._roleRepo.findByName(name);
		if (role) {
			throw new Error('Duplicate role');
		} else {
			return this._roleRepo.create(name, operations);
		}
	}

	async assignRole(role: Role, actor: Actor, context: Context): Promise<AssignedRole> {
		return this._roleRepo.assign(role, actor, context);
	}

	async canPerform(operation: string, actor: Actor, context: Context): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
}
