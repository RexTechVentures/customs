import { AssignedRole, Role } from 'src/persistence';
import { Entity } from './memory-provider';

export const org1 = { id: '1', type: 'org' };
export const org2 = { id: '2', type: 'org' };
export const user1 = { id: '1', type: 'user', parent: org1 };
export const user2 = { id: '2', type: 'user', parent: org1 };
export const thing1 = { id: '1', type: 'thing', parent: org1 };
export const thing2 = { id: '2', type: 'thing', parent: org2 };
export const entities: Entity[] = [org1, org2, user1, user2, thing1, thing2];
export const roles: Role[] = [
	{ name: 'role1', ops: ['a', 'b'] },
	{ name: 'role2', ops: ['a'] },
	{ name: 'role3', ops: ['b'] },
	{ name: 'role4', ops: ['c'] },
	{ name: 'role5', ops: ['d'] },
	{ name: 'role6', ops: ['c', 'd', 'e'] },
];
export const assignedRoles: AssignedRole[] = [
	{ name: 'role1', actor: user1, context: org1 },
	{ name: 'role6', actor: user1, context: org1 },
	{ name: 'role3', actor: user2, context: thing1 },
	{ name: 'role5', actor: user2, context: org2 },
];
