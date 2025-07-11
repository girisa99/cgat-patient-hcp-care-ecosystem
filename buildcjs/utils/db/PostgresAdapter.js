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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postgresAdapter = exports.PostgresAdapter = void 0;
var pg_1 = require("pg");
var DatabaseError_1 = require("./DatabaseError");
/**
 * PostgresAdapter
 *
 * Uses the `pg` driver to fetch schema metadata and data from a live PostgreSQL
 * (or Supabase) database. Connection details are taken from the standard
 * DATABASE_URL environment variable or individual PG* env vars.
 */
var PostgresAdapter = /** @class */ (function () {
    function PostgresAdapter() {
        this.ErrorClass = DatabaseError_1.DatabaseError;
        // Prefer DATABASE_URL for simplicity; fallback to individual vars.
        var connectionString = process.env.DATABASE_URL;
        this.pool = new pg_1.Pool(connectionString
            ? { connectionString: connectionString }
            : {
                host: process.env.PGHOST || 'localhost',
                port: Number(process.env.PGPORT || 5432),
                user: process.env.PGUSER || 'postgres',
                password: process.env.PGPASSWORD || '',
                database: process.env.PGDATABASE || 'postgres'
            });
    }
    PostgresAdapter.prototype.query = function (sql_1) {
        return __awaiter(this, arguments, void 0, function (sql, params) {
            var client, rows, err_1;
            if (params === void 0) { params = []; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.pool.connect()];
                    case 1:
                        client = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, 5, 6]);
                        return [4 /*yield*/, client.query(sql, params)];
                    case 3:
                        rows = (_a.sent()).rows;
                        return [2 /*return*/, rows];
                    case 4:
                        err_1 = _a.sent();
                        if (err_1 instanceof Error) {
                            throw new DatabaseError_1.DatabaseError(err_1.message, err_1);
                        }
                        throw new DatabaseError_1.DatabaseError('Unknown database error', err_1);
                    case 5:
                        client.release();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    PostgresAdapter.prototype.getTableList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")];
                    case 1:
                        rows = _a.sent();
                        return [2 /*return*/, rows.map(function (r) { return r.table_name; })];
                }
            });
        });
    };
    PostgresAdapter.prototype.getTableInfo = function (table) {
        return __awaiter(this, void 0, void 0, function () {
            var columns, triggers, foreignKeys, rlsPolicies;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("SELECT column_name, data_type, is_nullable, column_default\n       FROM information_schema.columns\n       WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position", [table])];
                    case 1:
                        columns = _a.sent();
                        return [4 /*yield*/, this.query("SELECT tgname as trigger_name\n       FROM pg_trigger t\n       JOIN pg_class c ON t.tgrelid = c.oid\n       JOIN pg_namespace n ON n.oid = c.relnamespace\n       WHERE n.nspname = 'public' AND c.relname = $1 AND NOT t.tgisinternal", [table])];
                    case 2:
                        triggers = _a.sent();
                        return [4 /*yield*/, this.query("SELECT\n         tc.constraint_name,\n         kcu.column_name,\n         ccu.table_name AS foreign_table_name,\n         ccu.column_name AS foreign_column_name\n       FROM information_schema.table_constraints tc\n       JOIN information_schema.key_column_usage kcu\n         ON tc.constraint_name = kcu.constraint_name\n       JOIN information_schema.constraint_column_usage ccu\n         ON ccu.constraint_name = tc.constraint_name\n       WHERE constraint_type = 'FOREIGN KEY' AND tc.table_name = $1", [table])];
                    case 3:
                        foreignKeys = _a.sent();
                        return [4 /*yield*/, this.query("SELECT polname FROM pg_policies WHERE schemaname = 'public' AND tablename = $1", [table])];
                    case 4:
                        rlsPolicies = _a.sent();
                        return [2 /*return*/, {
                                columns: columns,
                                triggers: triggers,
                                foreign_keys: foreignKeys,
                                rls_policies: rlsPolicies
                            }];
                }
            });
        });
    };
    PostgresAdapter.prototype.getTableRowCount = function (table) {
        return __awaiter(this, void 0, void 0, function () {
            var rows;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.query("SELECT COUNT(*) AS count FROM ".concat(table))];
                    case 1:
                        rows = _b.sent();
                        return [2 /*return*/, parseInt(((_a = rows[0]) === null || _a === void 0 ? void 0 : _a.count) || '0', 10)];
                }
            });
        });
    };
    return PostgresAdapter;
}());
exports.PostgresAdapter = PostgresAdapter;
// Singleton instance
exports.postgresAdapter = new PostgresAdapter();
