import { EntityReference } from 'src/entity';
import { AssignedRole, PersistenceStrategy, Role } from '../src/persistence';
export default class MemoryStrategy implements PersistenceStrategy {
    private _roles;
    private _assignments;
    constructor(roles: Role[], assignments: AssignedRole[]);
    getRoles(roleNames: string[]): Promise<Role[]>;
    getAssignedRoles(actor: EntityReference, context?: EntityReference): Promise<AssignedRole[]>;
    findRoleByName(name: string): Promise<Role | null | undefined>;
    createRole(name: string, operations: string[]): Promise<Role>;
    updateRole(name: string, operations: string[]): Promise<Role>;
    assignRole(role: string, actor: EntityReference, context: EntityReference): Promise<AssignedRole>;
    revokeRole(role: string, actor: EntityReference, context: EntityReference): Promise<AssignedRole>;
}
