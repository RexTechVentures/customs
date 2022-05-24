import { EntityProvider, EntityReference } from 'src/entity';
export interface Entity extends EntityReference {
    parent?: EntityReference;
}
export default class MemoryProvider implements EntityProvider {
    private _entities;
    constructor(entities: Entity[]);
    getReference(entity: Entity): Promise<EntityReference>;
    getParent(entityReference: EntityReference): Promise<EntityReference | undefined>;
}
