import { EntityProvider, EntityReference } from 'src/entity';
import { AssignedRole, PersistenceStrategy, Role } from 'src/persistence';
export default class AuthorizationService {
    private _strategy;
    private _provider;
    constructor(persistenceStrategy: PersistenceStrategy, entityProvider: EntityProvider);
    defineRole(name: string, operations: string[]): Promise<Role>;
    assignRole(role: string, actor: any, context: any): Promise<AssignedRole>;
    revokeRole(role: string, actor: any, context: any): Promise<AssignedRole>;
    getReference(entity: any): Promise<EntityReference>;
    canPerform(operation: string, actor: any, context: any): Promise<boolean>;
    private _canPerform;
}
