"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Middleware = exports.MongoosePersistenceStrategy = exports.refEq = void 0;
const authorization_service_1 = __importDefault(require("./authorization-service"));
const entity_1 = require("./entity");
Object.defineProperty(exports, "refEq", { enumerable: true, get: function () { return entity_1.refEq; } });
const mongoose_1 = __importDefault(require("./persistence/mongoose"));
exports.MongoosePersistenceStrategy = mongoose_1.default;
const middleware_1 = __importDefault(require("./middleware"));
exports.Middleware = middleware_1.default;
exports.default = authorization_service_1.default;
//# sourceMappingURL=index.js.map