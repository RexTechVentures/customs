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
class MemoryProvider {
    constructor(entities) {
        this._entities = entities;
    }
    getReference(entity) {
        return __awaiter(this, void 0, void 0, function* () {
            return { id: entity.id, type: entity.type };
        });
    }
    getParent(entityReference) {
        return __awaiter(this, void 0, void 0, function* () {
            const entity = this._entities.find(entity => (0, entity_1.refEq)(entity, entityReference));
            return entity ? entity.parent : entity;
        });
    }
}
exports.default = MemoryProvider;
//# sourceMappingURL=memory-provider.js.map