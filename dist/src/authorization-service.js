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
class AuthorizationService {
    constructor(persistenceStrategy, entityProvider) {
        this._strategy = persistenceStrategy;
        this._provider = entityProvider;
    }
    defineRole(name, operations) {
        return __awaiter(this, void 0, void 0, function* () {
            const role = yield this._strategy.findRoleByName(name);
            if (role) {
                return this._strategy.updateRole(name, operations);
            }
            else {
                return this._strategy.createRole(name, operations);
            }
        });
    }
    assignRole(role, actor, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const actorRef = yield this._provider.getReference(actor);
            const contextRef = yield this._provider.getReference(context);
            return this._strategy.assignRole(role, actorRef, contextRef);
        });
    }
    revokeRole(role, actor, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const actorRef = yield this._provider.getReference(actor);
            const contextRef = yield this._provider.getReference(context);
            return this._strategy.revokeRole(role, actorRef, contextRef);
        });
    }
    getReference(entity) {
        return this._provider.getReference(entity);
    }
    canPerform(operation, actor, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const actorRef = yield this._provider.getReference(actor);
            const contextRef = yield this._provider.getReference(context);
            return this._canPerform(operation, actorRef, contextRef);
        });
    }
    _canPerform(operation, actor, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const assignedRoles = yield this._strategy.getAssignedRoles(actor, context);
            const roles = yield this._strategy.getRoles(assignedRoles.map(({ name }) => name));
            if (roles.filter(({ ops: operations }) => operations.includes(operation)).length) {
                return true;
            }
            else {
                const parent = !!context && (yield this._provider.getParent(context));
                if (parent) {
                    return this._canPerform(operation, actor, parent);
                }
                else {
                    return false;
                }
            }
        });
    }
}
exports.default = AuthorizationService;
//# sourceMappingURL=authorization-service.js.map