import { EntityProvider, EntityReference, refEq } from "src/entity";
import { AssignedRole, PersistenceStrategy, Role } from "src/persistence";

export interface Entity extends EntityReference {
    parent?:EntityReference;
};

export class MemoryStrategy implements PersistenceStrategy {
    private _roles:Role[];
    private _assignments:AssignedRole[];

    constructor(roles:Role[], assignments:AssignedRole[]) {
        this._roles = roles;
        this._assignments = assignments;
    }

    async getRoles(roleNames: string[]): Promise<Role[]> {
        return this._roles.filter(({name}) => roleNames.includes(name));
    }

    async getAssignedRoles(actor: EntityReference, context: EntityReference): Promise<AssignedRole[]> {
        return this._assignments.filter(role => refEq(role.actor,actor) && refEq(role.context,context));
    }

    async findRoleByName(name: string): Promise<Role | undefined> {
        return this._roles.find(role => role.name === name);
    }

    async createRole(name: string, operations: string[]): Promise<Role> {
        if (await this.findRoleByName(name)) throw new Error('Duplicate role');

        const role:Role = {name,operations};
        this._roles.push(role);
        return role;
    }

    async updateRole(name: string, operations: string[]): Promise<Role> {
        const role = await this.findRoleByName(name);

        if (!role) throw new Error('Role not found');

        role.operations = operations;
        return role;
    }

    async assignRole(role: Role, actor: EntityReference, context: EntityReference): Promise<AssignedRole> {
        const assignedRoles = await this.getAssignedRoles(actor, context);

        if (assignedRoles.filter(({name}) => name === role.name).length) throw new Error('Duplicate assignment');
        
        const assignedRole:AssignedRole = {
            name:role.name,
            actor,
            context
        };
        this._assignments.push(assignedRole);
        return assignedRole;
    }
}

export class MemoryProvider implements EntityProvider {
    private _entities:Entity[];

    constructor(entities:Entity[]) {
        this._entities = entities;
    }

    async getReference(entity: Entity): Promise<EntityReference> {
        return entity;
    }
    async getParent(entityReference: EntityReference): Promise<EntityReference | undefined> {
        const entity = this._entities.find(entity => refEq(entity, entityReference));
        return entity ? entity.parent : entity;
    }

}