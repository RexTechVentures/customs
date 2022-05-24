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
exports.can = exports.or = exports.and = exports.AuthorizationDeniedError = void 0;
class AuthorizationDeniedError extends Error {
}
exports.AuthorizationDeniedError = AuthorizationDeniedError;
class Middleware {
    constructor(authService, actorResolver) {
        this._authService = authService;
        this._actorResolver = actorResolver;
    }
    authorize(...futurePredicates) {
        return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const andHandler = yield (0, exports.and)(...futurePredicates);
                const allTrue = yield andHandler(req, this._authService, this._actorResolver);
                if (allTrue) {
                    next();
                }
                else {
                    next(new AuthorizationDeniedError('Access denied'));
                }
            }
            catch (ignore) {
                next(new AuthorizationDeniedError('Access denied'));
            }
        });
    }
}
exports.default = Middleware;
const and = (...futurePredicates) => __awaiter(void 0, void 0, void 0, function* () {
    return (req, authService, actorResolver) => __awaiter(void 0, void 0, void 0, function* () {
        const predicates = yield Promise.all(futurePredicates);
        const results = yield Promise.all(predicates.map(predicate => predicate(req, authService, actorResolver)));
        return !results.filter(result => !result).length;
    });
});
exports.and = and;
const or = (...futurePredicates) => __awaiter(void 0, void 0, void 0, function* () {
    return (req, authService, actorResolver) => __awaiter(void 0, void 0, void 0, function* () {
        const predicates = yield Promise.all(futurePredicates);
        const results = yield Promise.all(predicates.map(predicate => predicate(req, authService, actorResolver)));
        return !!results.filter(result => result).length;
    });
});
exports.or = or;
const can = (operation, contextResolver) => __awaiter(void 0, void 0, void 0, function* () {
    return (req, authService, actorResolver) => __awaiter(void 0, void 0, void 0, function* () {
        const actor = yield actorResolver(req);
        const context = yield contextResolver(req);
        if (actor && context) {
            return authService.canPerform(operation, actor, context);
        }
        else {
            return false;
        }
    });
});
exports.can = can;
//# sourceMappingURL=middleware.js.map