import { expect } from 'chai';
import AuthorizationService from 'src/authorization-service';
import MemoryStrategy from 'test/memory-persistence-strategy';
import { entities, roles, assignedRoles, org1, org2, thing1, thing2, user1, user2 } from './fixture';
import { MemoryProvider } from './memory-provider';

const strategy = new MemoryStrategy(roles, assignedRoles);
const provider = new MemoryProvider(entities);

const authxService = new AuthorizationService(strategy, provider);

describe('AuthorizationService', () => {
	it('Can authorize operation', async () => {
		expect(await authxService.canPerform('a', user1, org1)).to.be.true;
		expect(await authxService.canPerform('b', user1, thing1)).to.be.true;
		expect(await authxService.canPerform('e', user1, user2)).to.be.true;
		expect(await authxService.canPerform('a', user1, thing2)).to.be.false;
		expect(await authxService.canPerform('a', user2, thing1)).to.be.false;
		expect(await authxService.canPerform('b', user2, thing1)).to.be.true;
		expect(await authxService.canPerform('b', user2, org1)).to.be.false;
		expect(await authxService.canPerform('d', user2, thing2)).to.be.true;
	});

	it('Can add & assign role', async () => {
		await authxService.defineRole('role7', ['f']);
		await authxService.assignRole('role7', user2, org2);
		expect(await authxService.canPerform('f', user2, thing2));
	});
});
