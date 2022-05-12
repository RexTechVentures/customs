import { EntityProvider, EntityReference } from 'src/entity';
import { AssignedRole, PersistenceStrategy, Role } from 'src/persistence';

export default class AuthorizationService {
	private _strategy: PersistenceStrategy;
	private _provider: EntityProvider;

	constructor(persistenceStrategy: PersistenceStrategy, entityProvider: EntityProvider) {
		this._strategy = persistenceStrategy;
		this._provider = entityProvider;
	}

	async defineRole(name: string, operations: string[]): Promise<Role> {
		const role = await this._strategy.findRoleByName(name);
		if (role) {
			return this._strategy.updateRole(name, operations);
		} else {
			return this._strategy.createRole(name, operations);
		}
	}

	async assignRole(role: string, actor: any, context: any): Promise<AssignedRole> {
		const actorRef: EntityReference = await this._provider.getReference(actor);
		const contextRef: EntityReference = await this._provider.getReference(context);
		return this._strategy.assignRole(role, actorRef, contextRef);
	}

    getReference(entity: any) {
        return this._provider.getReference(entity);
    }

	async canPerform(operation: string, actor: any, context: any): Promise<boolean> {
		const actorRef = await this._provider.getReference(actor);
		const contextRef = await this._provider.getReference(context);
		return this._canPerform(operation, actorRef, contextRef);
	}

	private async _canPerform(operation: string, actor: EntityReference, context?: EntityReference): Promise<boolean> {
		const assignedRoles = await this._strategy.getAssignedRoles(actor, context);
		const roles = await this._strategy.getRoles(assignedRoles.map(({ name }) => name));
		if (roles.filter(({ ops: operations }) => operations.includes(operation)).length) {
			return true;
		} else {
			const parent = await this._provider.getParent(context);
			if (parent) {
				return this._canPerform(operation, actor, parent);
			} else {
				return false;
			}
		}
	}
}
