import { EntityProvider, EntityReference, refEq } from 'src/entity';

export interface Entity extends EntityReference {
	parent?: EntityReference;
}

export class MemoryProvider implements EntityProvider {
	private _entities: Entity[];

	constructor(entities: Entity[]) {
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
