import { expect } from 'chai';
import AuthorizationService, {
	Actor,
	AssignedRole,
	Context,
	HierarchyRepository,
	Role,
	RoleRepository,
} from 'src/authorization-service';

const roles = new Array<Role>();
const assignedRoles = new Array<AssignedRole>();
const roleRepo: RoleRepository = {
	create: async (name: string, operations: string[]): Promise<Role> => {
		const role: Role = { name, operations };
		roles.push(role);
		return role;
	},
	findByName: async (name: string): Promise<Role | undefined> => {
		return roles.find(role => role.name === name);
	},
	assign: async (role: Role, actor: Actor, context: Context): Promise<AssignedRole> => {
		const assignedRole: AssignedRole = { name: role.name, actor, context };
		assignedRoles.push(assignedRole);
		return assignedRole;
	},
};

const hierarchyRepo: HierarchyRepository = {};

const authxService = new AuthorizationService(roleRepo, hierarchyRepo);

describe('AuthorizationService', () => {
	it('Can authorize operation', async () => {
		const operations = new Array<string>(10).fill('');
		operations.forEach((e, i) => (e = `op${i}`));
		console.log(operations);
		const actors: Actor[] = [Symbol(), Symbol(), Symbol()];
		const contexts: Context[] = [Symbol(), Symbol(), Symbol()];
		const roles: Role[] = await Promise.all([
			authxService.defineRole('role1', [operations[0], operations[1], operations[2], operations[3]]),
			authxService.defineRole('role2', [operations[2], operations[3], operations[4], operations[5]]),
			authxService.defineRole('role3', [operations[6]]),
			authxService.defineRole('role4', [operations[7], operations[8], operations[9]]),
		]);
		const assignedRole1: AssignedRole = await authxService.assignRole(roles[0], actors[0], contexts[0]);
		const assignedRole2: AssignedRole = await authxService.assignRole(roles[1], actors[1], contexts[1]);
		const assignedRole3: AssignedRole = await authxService.assignRole(roles[2], actors[2], contexts[2]);
		const assignedRole4: AssignedRole = await authxService.assignRole(roles[2], actors[2], contexts[3]);

		expect(await authxService.canPerform(operations[0], actors[0], contexts[0])).to.be.true;
		expect(await authxService.canPerform(operations[1], actors[0], contexts[0])).to.be.true;
		expect(await authxService.canPerform(operations[2], actors[1], contexts[1])).to.be.true;
		expect(await authxService.canPerform(operations[3], actors[0], contexts[0])).to.be.true;
		expect(await authxService.canPerform(operations[4], actors[0], contexts[0])).to.be.true;
		expect(await authxService.canPerform(operations[5], actors[0], contexts[0])).to.be.true;
		expect(await authxService.canPerform(operations[6], actors[2], contexts[2])).to.be.true;
		expect(await authxService.canPerform(operations[7], actors[0], contexts[0])).to.be.true;
		expect(await authxService.canPerform(operations[8], actors[0], contexts[0])).to.be.true;
		expect(await authxService.canPerform(operations[9], actors[2], contexts[2])).to.be.true;
	});
});
