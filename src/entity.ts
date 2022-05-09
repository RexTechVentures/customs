export interface EntityReference {
	id: string;
	type: string;
}

export const refEq = (ref1:EntityReference, ref2:EntityReference) =>
	ref1.id === ref2.id && ref1.type === ref2.type;

export interface EntityProvider {
	getReference(entity: any): Promise<EntityReference>;
	getParent(entityReference: EntityReference): Promise<EntityReference | undefined>;
}
