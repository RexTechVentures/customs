export interface Actor {}
export interface Context {}
export interface Grant {
	operation: string;
	actor: Actor;
	target?: Context;
}

export interface GrantRepository {
	create(operation: string, actor: Actor, target?: Context): Promise<Grant>;
	find(operation: string, actor: Actor, target?: Context): Promise<Grant[]>;
}

export interface HierarchyRepository {
	getParent(target: Context): Promise<Context | undefined>;
}

export default class RBACService {
	private _grants: GrantRepository;
	private _hierarchies: HierarchyRepository;

	constructor(grants: GrantRepository, hierarchies: HierarchyRepository) {
		this._grants = grants;
		this._hierarchies = hierarchies;
	}

	async canPerform(operation: string, actor: Actor, target?: Context): Promise<boolean> {
		console.log('canPerform(%s,%j,%j)', operation, actor, target);
		if (!target) {
			return !!(await this._grants.find(operation, actor)).length;
		} else {
			const grants = await this._grants.find(operation, actor, target);
			if (grants.length) {
				return true;
			} else {
				return this.canPerform(operation, actor, this._hierarchies.getParent(target));
			}
		}
	}

	async grant(operation: string, actor: Actor, target?: Context): Promise<Grant> {
		return this._grants.create(operation, actor, target);
	}
}
