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
const mongoose_1 = require("mongoose");
const uuid_1 = require("uuid");
const ReferenceSchema = new mongoose_1.Schema({
    id: { type: mongoose_1.SchemaTypes.String, required: true },
    type: { type: mongoose_1.SchemaTypes.String, required: true },
}, {
    _id: false,
});
const RoleSchema = new mongoose_1.Schema({
    _id: { type: mongoose_1.SchemaTypes.String, default: uuid_1.v4 },
    name: { type: mongoose_1.SchemaTypes.String, required: true },
    ops: { type: [mongoose_1.SchemaTypes.String], required: true },
}, { timestamps: true });
RoleSchema.index({ name: 1 }, { unique: true });
const AssignedRoleSchema = new mongoose_1.Schema({
    _id: { type: mongoose_1.SchemaTypes.String, default: uuid_1.v4 },
    name: { type: mongoose_1.SchemaTypes.String, required: true },
    actor: { type: ReferenceSchema, required: true },
    context: { type: ReferenceSchema, required: true },
}, { timestamps: true });
AssignedRoleSchema.index({ actor: 1, context: 1, name: 1 }, { unique: true });
class MongoosePersistenceStrategy {
    constructor(connection) {
        this._roles = connection.then(database => database.model('roles', RoleSchema));
        this._assignedRoles = connection.then(database => database.model('assigned_roles', AssignedRoleSchema));
    }
    getRoles(roleNames) {
        return __awaiter(this, void 0, void 0, function* () {
            const roles = yield this._roles;
            return roles.find({ name: { $in: roleNames } });
        });
    }
    getAssignedRoles(actor, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const assignedRoles = yield this._assignedRoles;
            return assignedRoles.find({ actor, context });
        });
    }
    findRoleByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const roles = yield this._roles;
            return roles.findOne({ name });
        });
    }
    createRole(name, operations) {
        return __awaiter(this, void 0, void 0, function* () {
            const roles = yield this._roles;
            return roles.create({ name, ops: operations });
        });
    }
    updateRole(name, operations) {
        return __awaiter(this, void 0, void 0, function* () {
            const roles = yield this._roles;
            const role = yield roles.findOne({ name });
            if (!role)
                throw new Error('Role not found');
            role.ops = operations;
            return role.save();
        });
    }
    assignRole(roleName, actor, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const assignedRoles = yield this._assignedRoles;
            const role = yield this.findRoleByName(roleName);
            if (!role)
                throw new Error('Role not found');
            const existing = yield this.getAssignedRoles(actor, context);
            if (existing.filter(assignedRole => assignedRole.name === roleName).length)
                throw new Error('Duplicate assignment');
            return assignedRoles.create({ name: roleName, actor, context });
        });
    }
    revokeRole(role, actor, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const assignedRoles = yield this._assignedRoles;
            const assignedRole = yield assignedRoles.findOne({ name: role, actor, context });
            if (!assignedRole) {
                throw new Error('Role not assigned');
            }
            else {
                return assignedRole.remove();
            }
        });
    }
    deleteRole(roleName) {
        return __awaiter(this, void 0, void 0, function* () {
            const roles = yield this._roles;
            const assignedRoles = yield this._assignedRoles;
            const role = yield roles.findOne({ name: roleName });
            if (!role)
                throw new Error('Role not found');
            const existingAssignments = yield assignedRoles.find({ name: roleName });
            yield Promise.all(existingAssignments.map(assignedRole => this.revokeRole(roleName, assignedRole.actor, assignedRole.context)));
            return role.remove();
        });
    }
}
exports.default = MongoosePersistenceStrategy;
//# sourceMappingURL=mongoose.js.map