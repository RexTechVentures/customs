"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const authorization_service_1 = __importDefault(require("src/authorization-service"));
const memory_persistence_strategy_1 = __importDefault(require("test/memory-persistence-strategy"));
const fixture_1 = require("./fixture");
const memory_provider_1 = __importDefault(require("./memory-provider"));
const strategy = new memory_persistence_strategy_1.default(fixture_1.roles, fixture_1.assignedRoles);
const provider = new memory_provider_1.default(fixture_1.entities);
const authxService = new authorization_service_1.default(strategy, provider);
describe('AuthorizationService', () => {
    it('Can authorize operation', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, chai_1.expect)(yield authxService.canPerform('a', fixture_1.user1, fixture_1.org1)).to.be.true;
        (0, chai_1.expect)(yield authxService.canPerform('b', fixture_1.user1, fixture_1.thing1)).to.be.true;
        (0, chai_1.expect)(yield authxService.canPerform('e', fixture_1.user1, fixture_1.user2)).to.be.true;
        (0, chai_1.expect)(yield authxService.canPerform('a', fixture_1.user1, fixture_1.thing2)).to.be.false;
        (0, chai_1.expect)(yield authxService.canPerform('a', fixture_1.user2, fixture_1.thing1)).to.be.false;
        (0, chai_1.expect)(yield authxService.canPerform('b', fixture_1.user2, fixture_1.thing1)).to.be.true;
        (0, chai_1.expect)(yield authxService.canPerform('b', fixture_1.user2, fixture_1.org1)).to.be.false;
        (0, chai_1.expect)(yield authxService.canPerform('d', fixture_1.user2, fixture_1.thing2)).to.be.true;
    }));
    it('Can add & assign role', () => __awaiter(void 0, void 0, void 0, function* () {
        yield authxService.defineRole('role7', ['f']);
        yield authxService.assignRole('role7', fixture_1.user2, fixture_1.org2);
        (0, chai_1.expect)(yield authxService.canPerform('f', fixture_1.user2, fixture_1.thing2));
        yield authxService.revokeRole('role7', fixture_1.user2, fixture_1.org2);
        (0, chai_1.expect)(yield authxService.canPerform('f', fixture_1.user2, fixture_1.thing2)).to.be.false;
    }));
});
//# sourceMappingURL=AuthorizationService.test.js.map