import { expect } from 'chai';
import AuthorizationService from 'src/authorization-service';
import { AssignedRole, Role } from 'src/persistence';
import { Entity, MemoryProvider, MemoryStrategy } from './fixture';

const org1 = {id:'1',type:'org'};
const org2 = {id:'2',type:'org'};
const user1 = {id:'1',type:'user',parent:org1};
const user2 = {id:'2',type:'user',parent:org1};
const thing1 = {id:'1',type:'thing',parent:org1};
const thing2 = {id:'2',type:'thing',parent:org2};
const entities:Entity[] = [org1,org2,user1,user2,thing1,thing2];
const roles:Role[] = [
	{name:'1',operations:['a','b']},
	{name:'2',operations:['a']},
	{name:'3',operations:['b']},
	{name:'4',operations:['c']},
	{name:'5',operations:['d']},
	{name:'6',operations:['c','d','e']}
];
const assignedRoles:AssignedRole[] = [
	{name:'1',actor:user1,context:org1},
	{name:'6',actor:user1,context:org1},
	{name:'3',actor:user2,context:thing1},
	{name:'5',actor:user2,context:org2}
];

const strategy = new MemoryStrategy(roles, assignedRoles);
const provider = new MemoryProvider(entities);

const authxService = new AuthorizationService(strategy, provider);

describe('AuthorizationService', () => {
	it('Can authorize operation', async () => {
		expect(await authxService.canPerform('a', user1, org1)).to.be.true;
		expect(await authxService.canPerform('b', user1, thing1)).to.be.true;
		expect(await authxService.canPerform('e', user1, user2)).to.be.true;
		expect(await authxService.canPerform('a', user1, thing2)).to.be.false;
		expect(await authxService.canPerform('b', user2, thing1)).to.be.true;
		expect(await authxService.canPerform('d', user2, thing2)).to.be.true;
	});

	it('Can add & assign role', async () => {
		const role = await authxService.defineRole('7',['f']);
		const assignedRole = await authxService.assignRole(role, user2, org2);
		expect(await authxService.canPerform('f', user2, thing2));
	})
});
