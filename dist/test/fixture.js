"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignedRoles = exports.roles = exports.entities = exports.thing2 = exports.thing1 = exports.user2 = exports.user1 = exports.org2 = exports.org1 = void 0;
exports.org1 = { id: '1', type: 'org' };
exports.org2 = { id: '2', type: 'org' };
exports.user1 = { id: '1', type: 'user', parent: exports.org1 };
exports.user2 = { id: '2', type: 'user', parent: exports.org1 };
exports.thing1 = { id: '1', type: 'thing', parent: exports.org1 };
exports.thing2 = { id: '2', type: 'thing', parent: exports.org2 };
exports.entities = [exports.org1, exports.org2, exports.user1, exports.user2, exports.thing1, exports.thing2];
exports.roles = [
    { name: 'role1', ops: ['a', 'b'] },
    { name: 'role2', ops: ['a'] },
    { name: 'role3', ops: ['b'] },
    { name: 'role4', ops: ['c'] },
    { name: 'role5', ops: ['d'] },
    { name: 'role6', ops: ['c', 'd', 'e'] },
];
exports.assignedRoles = [
    { name: 'role1', actor: exports.user1, context: exports.org1 },
    { name: 'role6', actor: exports.user1, context: exports.org1 },
    { name: 'role3', actor: exports.user2, context: exports.thing1 },
    { name: 'role5', actor: exports.user2, context: exports.org2 },
];
//# sourceMappingURL=fixture.js.map