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
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = __importDefault(require("src/persistence/mongoose"));
const fixture_1 = require("./fixture");
const connection = mongoose_1.default.connect('mongodb://localhost:27017/rbac');
const strategy = new mongoose_2.default(connection);
describe('MongoosePersistenceStrategy', () => {
    it('should create roles', () => __awaiter(void 0, void 0, void 0, function* () {
        yield Promise.all(fixture_1.roles.map(role => strategy.createRole(role.name, role.ops)));
        yield Promise.all(fixture_1.roles.map((role) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            (0, chai_1.expect)((_a = (yield strategy.findRoleByName(role.name))) === null || _a === void 0 ? void 0 : _a.ops).to.include.members(role.ops);
        })));
        const roleNames = fixture_1.roles.map(({ name }) => name);
        (0, chai_1.expect)(yield strategy.getRoles(roleNames)).to.have.lengthOf(roleNames.length);
    }));
    it('should create role assignments', () => __awaiter(void 0, void 0, void 0, function* () {
        yield Promise.all(fixture_1.assignedRoles.map(({ name, actor, context }) => strategy.assignRole(name, actor, context)));
        yield Promise.all(fixture_1.assignedRoles.map((assignedRole) => __awaiter(void 0, void 0, void 0, function* () {
            const found = yield strategy.getAssignedRoles(assignedRole.actor, assignedRole.context);
            (0, chai_1.expect)(found.filter(({ name }) => name === assignedRole.name)).to.not.be.empty;
        })));
    }));
    it('should update roles', () => __awaiter(void 0, void 0, void 0, function* () {
        const role = yield strategy.updateRole('role1', ['a', 'b', 'test']);
        const foundRole = yield strategy.findRoleByName('role1');
        (0, chai_1.expect)(foundRole === null || foundRole === void 0 ? void 0 : foundRole.ops).to.have.lengthOf(3);
        (0, chai_1.expect)(foundRole === null || foundRole === void 0 ? void 0 : foundRole.ops).to.contain('test');
    }));
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield Promise.all(fixture_1.roles.map(role => strategy.deleteRole(role.name)));
    }));
});
/*
  createRole(name: string, operations: string[]): Promise<Role>;
    findRoleByName(name: string): Promise<Role | null | undefined>;
    assignRole(role: string, actor: EntityReference, context: EntityReference): Promise<AssignedRole>;
    getAssignedRoles(actor: EntityReference, context: EntityReference): Promise<AssignedRole[]>;
    getRoles(roleNames: string[]): Promise<Role[]>;

    updateRole(name: string, operations: string[]): Promise<Role>;
*/
//# sourceMappingURL=MongoosePersistenceStrategy.test.js.map