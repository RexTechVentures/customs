import { expect } from 'chai';
import mongoose, { Mongoose } from 'mongoose';
import MongoosePersistenceStrategy from 'src/persistence/mongoose';
import { entities, roles, assignedRoles, org1, org2, thing1, thing2, user1, user2 } from './fixture';

const connection: Promise<Mongoose> = mongoose.connect('mongodb://localhost:27017/rbac');

const strategy = new MongoosePersistenceStrategy(connection);

describe('MongoosePersistenceStrategy', () => {
	it('should create roles', async () => {
		await Promise.all(roles.map(role => strategy.createRole(role.name, role.ops)));

		await Promise.all(
			roles.map(async role => {
				expect((await strategy.findRoleByName(role.name))?.ops).to.include.members(role.ops);
			})
		);

		const roleNames = roles.map(({ name }) => name);
		expect(await strategy.getRoles(roleNames)).to.have.lengthOf(roleNames.length);
	});

	it('should create role assignments', async () => {
		await Promise.all(assignedRoles.map(({ name, actor, context }) => strategy.assignRole(name, actor, context)));

		await Promise.all(
			assignedRoles.map(async assignedRole => {
				const found = await strategy.getAssignedRoles(assignedRole.actor, assignedRole.context);
				expect(found.filter(({ name }) => name === assignedRole.name)).to.not.be.empty;
			})
		);
	});

	it('should update roles', async () => {
		const role = await strategy.updateRole('role1', ['a', 'b', 'test']);

		const foundRole = await strategy.findRoleByName('role1');

		expect(foundRole?.ops).to.have.lengthOf(3);
		expect(foundRole?.ops).to.contain('test');
	});

	after(async () => {
		await Promise.all(roles.map(role => strategy.deleteRole(role.name)));
	});
});

/*
  createRole(name: string, operations: string[]): Promise<Role>;
	findRoleByName(name: string): Promise<Role | null | undefined>;
	assignRole(role: string, actor: EntityReference, context: EntityReference): Promise<AssignedRole>;
	getAssignedRoles(actor: EntityReference, context: EntityReference): Promise<AssignedRole[]>;
	getRoles(roleNames: string[]): Promise<Role[]>;

	updateRole(name: string, operations: string[]): Promise<Role>;
*/
