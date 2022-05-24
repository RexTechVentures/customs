"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const express_1 = __importDefault(require("express"));
const authorization_service_1 = __importDefault(require("src/authorization-service"));
const middleware_1 = __importStar(require("src/middleware"));
const supertest_1 = __importDefault(require("supertest"));
const fixture_1 = require("test/fixture");
const memory_persistence_strategy_1 = __importDefault(require("test/memory-persistence-strategy"));
const memory_provider_1 = __importDefault(require("test/memory-provider"));
const strategy = new memory_persistence_strategy_1.default(fixture_1.roles, fixture_1.assignedRoles);
const provider = new memory_provider_1.default(fixture_1.entities);
const authxService = new authorization_service_1.default(strategy, provider);
const actorResolver = (req) => __awaiter(void 0, void 0, void 0, function* () { return req.user; });
const customs = new middleware_1.default(authxService, actorResolver);
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((req, res, next) => {
    const [id, type] = (req.headers.authorization || '').split('|');
    if (!id || !type) {
        res.status(201).json({ error: 'unauthorized' });
    }
    else {
        const user = fixture_1.entities.find(entity => entity.id === id && entity.type === type);
        if (!user) {
            res.status(404).json({ error: 'not found' });
        }
        else {
            req.user = user;
            next();
        }
    }
});
const resolveEntity = (req) => __awaiter(void 0, void 0, void 0, function* () {
    return fixture_1.entities.find(entity => entity.id === req.params.id && entity.type === req.params.type);
});
const handle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({});
});
app.get('/a/:type/:id', customs.authorize((0, middleware_1.can)('a', resolveEntity)), handle);
app.get('/b/:type/:id', customs.authorize((0, middleware_1.can)('b', resolveEntity)), handle);
app.get('/ab/:type/:id', customs.authorize((0, middleware_1.can)('a', resolveEntity), (0, middleware_1.can)('b', resolveEntity)), handle);
app.get('/ba/:type/:id', customs.authorize((0, middleware_1.or)((0, middleware_1.can)('a', resolveEntity), (0, middleware_1.can)('b', resolveEntity))), handle);
app.use((err, req, res, next) => {
    if (err instanceof middleware_1.AuthorizationDeniedError) {
        res.status(403).json({ err: 'Access Denied' });
    }
    else {
        res.status(500).json({ err });
    }
});
describe('AuthorizationMiddleware', () => {
    let request;
    beforeEach(() => {
        request = (0, supertest_1.default)(app);
    });
    it('Should fail unauthorized request', () => __awaiter(void 0, void 0, void 0, function* () {
        yield request.get('/a/user/abc').set('Authorization', '1|user').expect(403);
    }));
    it('Should pass authorized request', () => __awaiter(void 0, void 0, void 0, function* () {
        yield request.get('/a/user/2').set('Authorization', '1|user').expect(200);
    }));
    it('Should pass `and` true predicates', () => __awaiter(void 0, void 0, void 0, function* () {
        yield request.get('/ab/org/1').set('Authorization', '1|user').expect(200);
    }));
    it('Should fail `and` single false predicate', () => __awaiter(void 0, void 0, void 0, function* () {
        yield request.get('/ab/thing/1').set('Authorization', '2|user').expect(403);
    }));
    it('Should pass `or` single true predicate', () => __awaiter(void 0, void 0, void 0, function* () {
        yield request.get('/ba/thing/1').set('Authorization', '2|user').expect(200);
    }));
});
//# sourceMappingURL=AuthorizationMiddleware.test.js.map