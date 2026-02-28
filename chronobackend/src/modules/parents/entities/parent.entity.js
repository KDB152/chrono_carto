"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parent = void 0;
// src/modules/parents/entities/parent.entity.ts
var typeorm_1 = require("typeorm");
var user_entity_1 = require("../../users/entities/user.entity");
var Parent = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('parents')];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _id_decorators;
    var _id_initializers = [];
    var _id_extraInitializers = [];
    var _user_decorators;
    var _user_initializers = [];
    var _user_extraInitializers = [];
    var _user_id_decorators;
    var _user_id_initializers = [];
    var _user_id_extraInitializers = [];
    var _phone_number_decorators;
    var _phone_number_initializers = [];
    var _phone_number_extraInitializers = [];
    var _address_decorators;
    var _address_initializers = [];
    var _address_extraInitializers = [];
    var _occupation_decorators;
    var _occupation_initializers = [];
    var _occupation_extraInitializers = [];
    var Parent = _classThis = /** @class */ (function () {
        function Parent_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.user = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _user_initializers, void 0));
            this.user_id = (__runInitializers(this, _user_extraInitializers), __runInitializers(this, _user_id_initializers, void 0));
            this.phone_number = (__runInitializers(this, _user_id_extraInitializers), __runInitializers(this, _phone_number_initializers, void 0));
            this.address = (__runInitializers(this, _phone_number_extraInitializers), __runInitializers(this, _address_initializers, void 0));
            this.occupation = (__runInitializers(this, _address_extraInitializers), __runInitializers(this, _occupation_initializers, void 0));
            __runInitializers(this, _occupation_extraInitializers);
        }
        return Parent_1;
    }());
    __setFunctionName(_classThis, "Parent");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)()];
        _user_decorators = [(0, typeorm_1.OneToOne)(function () { return user_entity_1.User; }), (0, typeorm_1.JoinColumn)({ name: 'user_id' })];
        _user_id_decorators = [(0, typeorm_1.Column)({ name: 'user_id', unique: true })];
        _phone_number_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _address_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _occupation_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _user_decorators, { kind: "field", name: "user", static: false, private: false, access: { has: function (obj) { return "user" in obj; }, get: function (obj) { return obj.user; }, set: function (obj, value) { obj.user = value; } }, metadata: _metadata }, _user_initializers, _user_extraInitializers);
        __esDecorate(null, null, _user_id_decorators, { kind: "field", name: "user_id", static: false, private: false, access: { has: function (obj) { return "user_id" in obj; }, get: function (obj) { return obj.user_id; }, set: function (obj, value) { obj.user_id = value; } }, metadata: _metadata }, _user_id_initializers, _user_id_extraInitializers);
        __esDecorate(null, null, _phone_number_decorators, { kind: "field", name: "phone_number", static: false, private: false, access: { has: function (obj) { return "phone_number" in obj; }, get: function (obj) { return obj.phone_number; }, set: function (obj, value) { obj.phone_number = value; } }, metadata: _metadata }, _phone_number_initializers, _phone_number_extraInitializers);
        __esDecorate(null, null, _address_decorators, { kind: "field", name: "address", static: false, private: false, access: { has: function (obj) { return "address" in obj; }, get: function (obj) { return obj.address; }, set: function (obj, value) { obj.address = value; } }, metadata: _metadata }, _address_initializers, _address_extraInitializers);
        __esDecorate(null, null, _occupation_decorators, { kind: "field", name: "occupation", static: false, private: false, access: { has: function (obj) { return "occupation" in obj; }, get: function (obj) { return obj.occupation; }, set: function (obj, value) { obj.occupation = value; } }, metadata: _metadata }, _occupation_initializers, _occupation_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Parent = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Parent = _classThis;
}();
exports.Parent = Parent;
