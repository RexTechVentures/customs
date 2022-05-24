export interface EntityReference {
    id: string;
    type: string;
}
export declare const refEq: (ref1: EntityReference, ref2: EntityReference) => boolean;
export interface EntityProvider {
    getReference(entity: any): Promise<EntityReference>;
    getParent(entityReference: EntityReference): Promise<EntityReference | undefined>;
}
