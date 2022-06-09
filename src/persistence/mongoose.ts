import { Model, Mongoose, Schema, SchemaTypes } from 'mongoose';
import { EntityReference } from 'src/entity';
import { roles } from 'test/fixture';
import { v4 } from 'uuid';
import { AssignedRole, PersistenceStrategy, Role } from '.';

// Cachegoose doesnt support es6 imports, didnt find a better way, feel free to change.
const cachegoose = require('recachegoose');
import { createClient } from 'redis';

interface MongoEntity {
	_id: string;
}

const ReferenceSchema = new Schema<EntityReference>(
	{
		id: { type: SchemaTypes.String, required: true },
		type: { type: SchemaTypes.String, required: true },
	},
	{
		_id: false,
	}
);

const RoleSchema = new Schema<Role & MongoEntity>(
	{
		_id: { type: SchemaTypes.String, default: v4 },
		name: { type: SchemaTypes.String, required: true },
		ops: { type: [SchemaTypes.String], required: true },
	},
	{ timestamps: true }
);
RoleSchema.index({ name: 1 }, { unique: true });

const AssignedRoleSchema = new Schema<AssignedRole & MongoEntity>(
	{
		_id: { type: SchemaTypes.String, default: v4 },
		name: { type: SchemaTypes.String, required: true },
		actor: { type: ReferenceSchema, required: true },
		context: { type: ReferenceSchema, required: true },
	},
	{ timestamps: true }
);
AssignedRoleSchema.index({ actor: 1, context: 1, name: 1 }, { unique: true });

export default class MongoosePersistenceStrategy implements PersistenceStrategy {
	private _roles: Promise<Model<Role & MongoEntity>>;
	private _assignedRoles: Promise<Model<AssignedRole & MongoEntity>>;
	private _cache: boolean = false;

	constructor(connection: Promise<Mongoose>, redisUrl?: any) {
		this._roles = connection.then(database => database.model<Role & MongoEntity>('roles', RoleSchema));
		this._assignedRoles = connection.then(database =>
			database.model<AssignedRole & MongoEntity>('assigned_roles', AssignedRoleSchema)
		);
		this.initCacheGoose(connection, redisUrl);
	}

	async initCacheGoose(connection: Promise<Mongoose>, redisUrl?: string) {
		const client = redisUrl
			? createClient({
					url: redisUrl,
			  })
			: null;
		await client?.connect();
		// Test in memory caching only
		const engine = redisUrl ? 'memory' : 'memory';
		console.log('initing cache ', engine, client);
		cachegoose(await connection, {
			engine,
			client,
		});
	}

	async getRoles(roleNames: string[]): Promise<Role[]> {
		const roles = await this._roles;
		console.time('fetch-role');
		const stats: any = await roles
			.find({ name: { $in: roleNames } })
			.explain()
			.exec();
		const response = await (roles.find({ name: { $in: roleNames } }) as any).cache(0, 'roles').exec();
		console.timeEnd('fetch-role');
		console.log('Getting query stats', stats.executionStats);
		return response;
	}

	async getAssignedRoles(actor: EntityReference, context?: EntityReference): Promise<AssignedRole[]> {
		const assignedRoles = await this._assignedRoles;
		return assignedRoles.find({ actor, context });
	}

	async findRoleByName(name: string): Promise<Role | null | undefined> {
		const roles = await this._roles;
		return (roles.findOne({ name }) as any).cache(0, `role-${name}`);
	}

	async createRole(name: string, operations: string[]): Promise<Role> {
		const roles = await this._roles;
		return roles.create({ name, ops: operations });
	}

	async updateRole(name: string, operations: string[]): Promise<Role> {
		const roles = await this._roles;
		const role = await roles.findOne({ name });
		if (!role) throw new Error('Role not found');
		role.ops = operations;
		await role.save();
		cachegoose.clearCache(`roles`);
		cachegoose.clearCache(`role-${name}`);
		return role;
	}

	async assignRole(roleName: string, actor: EntityReference, context: EntityReference): Promise<AssignedRole> {
		const assignedRoles = await this._assignedRoles;

		const role = await this.findRoleByName(roleName);
		if (!role) throw new Error('Role not found');

		const existing = await this.getAssignedRoles(actor, context);
		if (existing.filter(assignedRole => assignedRole.name === roleName).length)
			throw new Error('Duplicate assignment');

		return assignedRoles.create({ name: roleName, actor, context });
	}

	async revokeRole(role: string, actor: EntityReference, context: EntityReference): Promise<AssignedRole> {
		const assignedRoles = await this._assignedRoles;
		const assignedRole = await assignedRoles.findOne({ name: role, actor, context });
		if (!assignedRole) {
			throw new Error('Role not assigned');
		} else {
			return assignedRole.remove();
		}
	}

	async deleteRole(roleName: string) {
		const roles = await this._roles;
		const assignedRoles = await this._assignedRoles;

		const role = await roles.findOne({ name: roleName });
		if (!role) throw new Error('Role not found');

		const existingAssignments = await assignedRoles.find({ name: roleName });
		await Promise.all(
			existingAssignments.map(assignedRole => this.revokeRole(roleName, assignedRole.actor, assignedRole.context))
		);

		await role.remove();
		cachegoose.clearCache(`role-${roleName}`);
		return role;
	}
}
