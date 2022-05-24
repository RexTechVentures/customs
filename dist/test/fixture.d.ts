import { AssignedRole, Role } from 'src/persistence';
import { Entity } from './memory-provider';
export declare const org1: {
    id: string;
    type: string;
};
export declare const org2: {
    id: string;
    type: string;
};
export declare const user1: {
    id: string;
    type: string;
    parent: {
        id: string;
        type: string;
    };
};
export declare const user2: {
    id: string;
    type: string;
    parent: {
        id: string;
        type: string;
    };
};
export declare const thing1: {
    id: string;
    type: string;
    parent: {
        id: string;
        type: string;
    };
};
export declare const thing2: {
    id: string;
    type: string;
    parent: {
        id: string;
        type: string;
    };
};
export declare const entities: Entity[];
export declare const roles: Role[];
export declare const assignedRoles: AssignedRole[];
