/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/schemaoptions" />
import { Mongoose } from 'mongoose';
import { EntityReference } from 'src/entity';
import { AssignedRole, PersistenceStrategy, Role } from '.';
interface MongoEntity {
    _id: string;
}
export default class MongoosePersistenceStrategy implements PersistenceStrategy {
    private _roles;
    private _assignedRoles;
    constructor(connection: Promise<Mongoose>);
    getRoles(roleNames: string[]): Promise<Role[]>;
    getAssignedRoles(actor: EntityReference, context?: EntityReference): Promise<AssignedRole[]>;
    findRoleByName(name: string): Promise<Role | null | undefined>;
    createRole(name: string, operations: string[]): Promise<Role>;
    updateRole(name: string, operations: string[]): Promise<Role>;
    assignRole(roleName: string, actor: EntityReference, context: EntityReference): Promise<AssignedRole>;
    revokeRole(role: string, actor: EntityReference, context: EntityReference): Promise<AssignedRole>;
    deleteRole(roleName: string): Promise<import("mongoose").Document<unknown, any, Role & MongoEntity> & Role & MongoEntity & {
        _id: string;
    }>;
}
export {};
