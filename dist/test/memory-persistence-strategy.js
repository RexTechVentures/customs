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
Object.defineProperty(exports, "__esModule", { value: true });
const entity_1 = require("src/entity");
class MemoryStrategy {
    constructor(roles, assignments) {
        this._roles = roles;
        this._assignments = assignments;
    }
    getRoles(roleNames) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._roles.filter(({ name }) => roleNames.includes(name));
        });
    }
    getAssignedRoles(actor, context) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._assignments.filter(role => (0, entity_1.refEq)(role.actor, actor) && !!context ? (0, entity_1.refEq)(role.context, context) : !role.context);
        });
    }
    findRoleByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._roles.find(role => role.name === name);
        });
    }
    createRole(name, operations) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.findRoleByName(name))
                throw new Error('Duplicate role');
            const role = { name, ops: operations };
            this._roles.push(role);
            return role;
        });
    }
    updateRole(name, operations) {
        return __awaiter(this, void 0, void 0, function* () {
            const role = yield this.findRoleByName(name);
            if (!role)
                throw new Error('Role not found');
            role.ops = operations;
            return role;
        });
    }
    assignRole(role, actor, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const assignedRoles = yield this.getAssignedRoles(actor, context);
            if (assignedRoles.filter(({ name }) => name === role).length)
                throw new Error('Duplicate assignment');
            const assignedRole = {
                name: role,
                actor,
                context,
            };
            this._assignments.push(assignedRole);
            return assignedRole;
        });
    }
    revokeRole(role, actor, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const i = this._assignments.findIndex(assignment => assignment.name === role &&
                (0, entity_1.refEq)(assignment.actor, actor) &&
                !!context ? (0, entity_1.refEq)(assignment.context, context) : !assignment.context);
            if (i === -1) {
                throw new Error('Role not assigned');
            }
            else {
                const assignment = this._assignments[i];
                this._assignments.splice(i, 1);
                return assignment;
            }
        });
    }
}
exports.default = MemoryStrategy;
//# sourceMappingURL=memory-persistence-strategy.js.map