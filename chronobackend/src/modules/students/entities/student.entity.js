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
exports.Student = void 0;
// src/modules/students/entities/student.entity.ts
var typeorm_1 = require("typeorm");
var user_entity_1 = require("../../users/entities/user.entity");
var Student = function () {
    var _classDecorators = [(0, typeorm_1.Entity)('students')];
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
    var _class_level_decorators;
    var _class_level_initializers = [];
    var _class_level_extraInitializers = [];
    var _birth_date_decorators;
    var _birth_date_initializers = [];
    var _birth_date_extraInitializers = [];
    var _phone_number_decorators;
    var _phone_number_initializers = [];
    var _phone_number_extraInitializers = [];
    var _address_decorators;
    var _address_initializers = [];
    var _address_extraInitializers = [];
    var _progress_percentage_decorators;
    var _progress_percentage_initializers = [];
    var _progress_percentage_extraInitializers = [];
    var _total_quiz_attempts_decorators;
    var _total_quiz_attempts_initializers = [];
    var _total_quiz_attempts_extraInitializers = [];
    var _average_score_decorators;
    var _average_score_initializers = [];
    var _average_score_extraInitializers = [];
    var _last_activity_decorators;
    var _last_activity_initializers = [];
    var _last_activity_extraInitializers = [];
    var _parent_id_decorators;
    var _parent_id_initializers = [];
    var _parent_id_extraInitializers = [];
    var Student = _classThis = /** @class */ (function () {
        function Student_1() {
            this.id = __runInitializers(this, _id_initializers, void 0);
            this.user = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _user_initializers, void 0));
            this.user_id = (__runInitializers(this, _user_extraInitializers), __runInitializers(this, _user_id_initializers, void 0));
            this.class_level = (__runInitializers(this, _user_id_extraInitializers), __runInitializers(this, _class_level_initializers, void 0));
            this.birth_date = (__runInitializers(this, _class_level_extraInitializers), __runInitializers(this, _birth_date_initializers, void 0));
            this.phone_number = (__runInitializers(this, _birth_date_extraInitializers), __runInitializers(this, _phone_number_initializers, void 0));
            this.address = (__runInitializers(this, _phone_number_extraInitializers), __runInitializers(this, _address_initializers, void 0));
            this.progress_percentage = (__runInitializers(this, _address_extraInitializers), __runInitializers(this, _progress_percentage_initializers, void 0));
            this.total_quiz_attempts = (__runInitializers(this, _progress_percentage_extraInitializers), __runInitializers(this, _total_quiz_attempts_initializers, void 0));
            this.average_score = (__runInitializers(this, _total_quiz_attempts_extraInitializers), __runInitializers(this, _average_score_initializers, void 0));
            this.last_activity = (__runInitializers(this, _average_score_extraInitializers), __runInitializers(this, _last_activity_initializers, void 0));
            this.parent_id = (__runInitializers(this, _last_activity_extraInitializers), __runInitializers(this, _parent_id_initializers, void 0));
            __runInitializers(this, _parent_id_extraInitializers);
        }
        return Student_1;
    }());
    __setFunctionName(_classThis, "Student");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _id_decorators = [(0, typeorm_1.PrimaryGeneratedColumn)()];
        _user_decorators = [(0, typeorm_1.OneToOne)(function () { return user_entity_1.User; }), (0, typeorm_1.JoinColumn)({ name: 'user_id' })];
        _user_id_decorators = [(0, typeorm_1.Column)({ name: 'user_id', unique: true })];
        _class_level_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _birth_date_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _phone_number_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _address_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _progress_percentage_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })];
        _total_quiz_attempts_decorators = [(0, typeorm_1.Column)({ default: 0 })];
        _average_score_decorators = [(0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })];
        _last_activity_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        _parent_id_decorators = [(0, typeorm_1.Column)({ nullable: true })];
        __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: function (obj) { return "id" in obj; }, get: function (obj) { return obj.id; }, set: function (obj, value) { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
        __esDecorate(null, null, _user_decorators, { kind: "field", name: "user", static: false, private: false, access: { has: function (obj) { return "user" in obj; }, get: function (obj) { return obj.user; }, set: function (obj, value) { obj.user = value; } }, metadata: _metadata }, _user_initializers, _user_extraInitializers);
        __esDecorate(null, null, _user_id_decorators, { kind: "field", name: "user_id", static: false, private: false, access: { has: function (obj) { return "user_id" in obj; }, get: function (obj) { return obj.user_id; }, set: function (obj, value) { obj.user_id = value; } }, metadata: _metadata }, _user_id_initializers, _user_id_extraInitializers);
        __esDecorate(null, null, _class_level_decorators, { kind: "field", name: "class_level", static: false, private: false, access: { has: function (obj) { return "class_level" in obj; }, get: function (obj) { return obj.class_level; }, set: function (obj, value) { obj.class_level = value; } }, metadata: _metadata }, _class_level_initializers, _class_level_extraInitializers);
        __esDecorate(null, null, _birth_date_decorators, { kind: "field", name: "birth_date", static: false, private: false, access: { has: function (obj) { return "birth_date" in obj; }, get: function (obj) { return obj.birth_date; }, set: function (obj, value) { obj.birth_date = value; } }, metadata: _metadata }, _birth_date_initializers, _birth_date_extraInitializers);
        __esDecorate(null, null, _phone_number_decorators, { kind: "field", name: "phone_number", static: false, private: false, access: { has: function (obj) { return "phone_number" in obj; }, get: function (obj) { return obj.phone_number; }, set: function (obj, value) { obj.phone_number = value; } }, metadata: _metadata }, _phone_number_initializers, _phone_number_extraInitializers);
        __esDecorate(null, null, _address_decorators, { kind: "field", name: "address", static: false, private: false, access: { has: function (obj) { return "address" in obj; }, get: function (obj) { return obj.address; }, set: function (obj, value) { obj.address = value; } }, metadata: _metadata }, _address_initializers, _address_extraInitializers);
        __esDecorate(null, null, _progress_percentage_decorators, { kind: "field", name: "progress_percentage", static: false, private: false, access: { has: function (obj) { return "progress_percentage" in obj; }, get: function (obj) { return obj.progress_percentage; }, set: function (obj, value) { obj.progress_percentage = value; } }, metadata: _metadata }, _progress_percentage_initializers, _progress_percentage_extraInitializers);
        __esDecorate(null, null, _total_quiz_attempts_decorators, { kind: "field", name: "total_quiz_attempts", static: false, private: false, access: { has: function (obj) { return "total_quiz_attempts" in obj; }, get: function (obj) { return obj.total_quiz_attempts; }, set: function (obj, value) { obj.total_quiz_attempts = value; } }, metadata: _metadata }, _total_quiz_attempts_initializers, _total_quiz_attempts_extraInitializers);
        __esDecorate(null, null, _average_score_decorators, { kind: "field", name: "average_score", static: false, private: false, access: { has: function (obj) { return "average_score" in obj; }, get: function (obj) { return obj.average_score; }, set: function (obj, value) { obj.average_score = value; } }, metadata: _metadata }, _average_score_initializers, _average_score_extraInitializers);
        __esDecorate(null, null, _last_activity_decorators, { kind: "field", name: "last_activity", static: false, private: false, access: { has: function (obj) { return "last_activity" in obj; }, get: function (obj) { return obj.last_activity; }, set: function (obj, value) { obj.last_activity = value; } }, metadata: _metadata }, _last_activity_initializers, _last_activity_extraInitializers);
        __esDecorate(null, null, _parent_id_decorators, { kind: "field", name: "parent_id", static: false, private: false, access: { has: function (obj) { return "parent_id" in obj; }, get: function (obj) { return obj.parent_id; }, set: function (obj, value) { obj.parent_id = value; } }, metadata: _metadata }, _parent_id_initializers, _parent_id_extraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        Student = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return Student = _classThis;
}();
exports.Student = Student;
