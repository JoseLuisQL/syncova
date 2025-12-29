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
exports.seedRolesAndPermissionsV2 = seedRolesAndPermissionsV2;
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
/**
 * Seed de roles y permisos granulares v2
 * Sistema profesional con control por módulo y sección
 */
function seedRolesAndPermissionsV2() {
    return __awaiter(this, void 0, void 0, function () {
        var permissions, _i, permissions_1, permission, roles, _a, roles_1, role, allPermissions, permissionMap_1, assignPermissionsToRole, allPermissionCodigos, coordinadorPermisos, responsablePermisos, operadorPermisos, usuarios, _b, usuarios_1, usuario, role, totalPermisos, totalRoles, totalAsignaciones, usuariosActualizados, error_1;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('🌱 Iniciando seed de roles y permisos v2 (granular)...');
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 25, , 26]);
                    permissions = [
                        // =====================================================
                        // DASHBOARD
                        // =====================================================
                        { nombre: 'Ver Dashboard', codigo: 'dashboard:read', recurso: 'dashboard', accion: 'read', categoria: 'Dashboard', descripcion: 'Acceso al dashboard principal' },
                        // =====================================================
                        // ESTABLECIMIENTOS (4 secciones)
                        // =====================================================
                        // Redes
                        { nombre: 'Ver Redes', codigo: 'redes:read', recurso: 'redes', accion: 'read', categoria: 'Establecimientos', descripcion: 'Ver listado de redes de salud' },
                        { nombre: 'Gestionar Redes', codigo: 'redes:write', recurso: 'redes', accion: 'write', categoria: 'Establecimientos', descripcion: 'Crear, editar y eliminar redes' },
                        // Microredes
                        { nombre: 'Ver Microredes', codigo: 'microredes:read', recurso: 'microredes', accion: 'read', categoria: 'Establecimientos', descripcion: 'Ver listado de microredes' },
                        { nombre: 'Gestionar Microredes', codigo: 'microredes:write', recurso: 'microredes', accion: 'write', categoria: 'Establecimientos', descripcion: 'Crear, editar y eliminar microredes' },
                        // Centros de Acopio
                        { nombre: 'Ver Centros de Acopio', codigo: 'centros_acopio:read', recurso: 'centros_acopio', accion: 'read', categoria: 'Establecimientos', descripcion: 'Ver listado de centros de acopio' },
                        { nombre: 'Gestionar Centros de Acopio', codigo: 'centros_acopio:write', recurso: 'centros_acopio', accion: 'write', categoria: 'Establecimientos', descripcion: 'Crear, editar y eliminar centros de acopio' },
                        // Establecimientos
                        { nombre: 'Ver Establecimientos', codigo: 'establecimientos:read', recurso: 'establecimientos', accion: 'read', categoria: 'Establecimientos', descripcion: 'Ver listado de establecimientos de salud' },
                        { nombre: 'Gestionar Establecimientos', codigo: 'establecimientos:write', recurso: 'establecimientos', accion: 'write', categoria: 'Establecimientos', descripcion: 'Crear, editar y eliminar establecimientos' },
                        // =====================================================
                        // INVENTARIO (5 secciones)
                        // =====================================================
                        // Vacunas
                        { nombre: 'Ver Catálogo Vacunas', codigo: 'vacunas:read', recurso: 'vacunas', accion: 'read', categoria: 'Inventario', descripcion: 'Ver catálogo de vacunas' },
                        { nombre: 'Gestionar Vacunas', codigo: 'vacunas:write', recurso: 'vacunas', accion: 'write', categoria: 'Inventario', descripcion: 'Crear, editar y eliminar vacunas del catálogo' },
                        // Jeringas
                        { nombre: 'Ver Catálogo Jeringas', codigo: 'jeringas:read', recurso: 'jeringas', accion: 'read', categoria: 'Inventario', descripcion: 'Ver catálogo de jeringas' },
                        { nombre: 'Gestionar Jeringas', codigo: 'jeringas:write', recurso: 'jeringas', accion: 'write', categoria: 'Inventario', descripcion: 'Crear, editar y eliminar jeringas del catálogo' },
                        // Lotes Vacunas
                        { nombre: 'Ver Lotes Vacunas', codigo: 'lotes_vacunas:read', recurso: 'lotes_vacunas', accion: 'read', categoria: 'Inventario', descripcion: 'Ver lotes de vacunas' },
                        { nombre: 'Gestionar Lotes Vacunas', codigo: 'lotes_vacunas:write', recurso: 'lotes_vacunas', accion: 'write', categoria: 'Inventario', descripcion: 'Crear, editar y eliminar lotes de vacunas' },
                        // Lotes Jeringas
                        { nombre: 'Ver Lotes Jeringas', codigo: 'lotes_jeringas:read', recurso: 'lotes_jeringas', accion: 'read', categoria: 'Inventario', descripcion: 'Ver lotes de jeringas' },
                        { nombre: 'Gestionar Lotes Jeringas', codigo: 'lotes_jeringas:write', recurso: 'lotes_jeringas', accion: 'write', categoria: 'Inventario', descripcion: 'Crear, editar y eliminar lotes de jeringas' },
                        // Configuración de Jeringas
                        { nombre: 'Ver Config. Jeringas', codigo: 'config_jeringas:read', recurso: 'config_jeringas', accion: 'read', categoria: 'Inventario', descripcion: 'Ver configuración de jeringas por vacuna' },
                        { nombre: 'Gestionar Config. Jeringas', codigo: 'config_jeringas:write', recurso: 'config_jeringas', accion: 'write', categoria: 'Inventario', descripcion: 'Configurar jeringas por vacuna' },
                        // Nuevo Ingreso
                        { nombre: 'Registrar Ingresos', codigo: 'inventario:ingreso', recurso: 'inventario', accion: 'ingreso', categoria: 'Inventario', descripcion: 'Registrar nuevos ingresos de lotes' },
                        // =====================================================
                        // MOVIMIENTOS
                        // =====================================================
                        { nombre: 'Ver Movimientos', codigo: 'movimientos:read', recurso: 'movimientos', accion: 'read', categoria: 'Movimientos', descripcion: 'Ver listado de movimientos de inventario' },
                        { nombre: 'Registrar Movimientos', codigo: 'movimientos:write', recurso: 'movimientos', accion: 'write', categoria: 'Movimientos', descripcion: 'Registrar nuevos movimientos' },
                        { nombre: 'Anular Movimientos', codigo: 'movimientos:anular', recurso: 'movimientos', accion: 'anular', categoria: 'Movimientos', descripcion: 'Anular movimientos registrados' },
                        // =====================================================
                        // PLANIFICACIÓN
                        // =====================================================
                        { nombre: 'Ver Planificación', codigo: 'planificacion:read', recurso: 'planificacion', accion: 'read', categoria: 'Planificación', descripcion: 'Ver planificaciones anuales' },
                        { nombre: 'Gestionar Planificación', codigo: 'planificacion:write', recurso: 'planificacion', accion: 'write', categoria: 'Planificación', descripcion: 'Crear y editar planificaciones' },
                        { nombre: 'Aprobar Planificación', codigo: 'planificacion:aprobar', recurso: 'planificacion', accion: 'aprobar', categoria: 'Planificación', descripcion: 'Aprobar planificaciones para ejecución' },
                        // =====================================================
                        // KARDEX
                        // =====================================================
                        { nombre: 'Ver Kardex', codigo: 'kardex:read', recurso: 'kardex', accion: 'read', categoria: 'Kardex', descripcion: 'Ver kardex de inventario' },
                        { nombre: 'Exportar Kardex', codigo: 'kardex:export', recurso: 'kardex', accion: 'export', categoria: 'Kardex', descripcion: 'Exportar kardex a Excel/PDF' },
                        // =====================================================
                        // REPORTES (5 secciones)
                        // =====================================================
                        // Inventario
                        { nombre: 'Ver Rep. Inventario', codigo: 'reportes_inventario:read', recurso: 'reportes_inventario', accion: 'read', categoria: 'Reportes', descripcion: 'Ver reportes de inventario' },
                        { nombre: 'Exportar Rep. Inventario', codigo: 'reportes_inventario:export', recurso: 'reportes_inventario', accion: 'export', categoria: 'Reportes', descripcion: 'Exportar reportes de inventario' },
                        // Movimientos
                        { nombre: 'Ver Rep. Movimientos', codigo: 'reportes_movimientos:read', recurso: 'reportes_movimientos', accion: 'read', categoria: 'Reportes', descripcion: 'Ver reportes de movimientos' },
                        { nombre: 'Exportar Rep. Movimientos', codigo: 'reportes_movimientos:export', recurso: 'reportes_movimientos', accion: 'export', categoria: 'Reportes', descripcion: 'Exportar reportes de movimientos' },
                        // Planificación
                        { nombre: 'Ver Rep. Planificación', codigo: 'reportes_planificacion:read', recurso: 'reportes_planificacion', accion: 'read', categoria: 'Reportes', descripcion: 'Ver reportes de planificación' },
                        { nombre: 'Exportar Rep. Planificación', codigo: 'reportes_planificacion:export', recurso: 'reportes_planificacion', accion: 'export', categoria: 'Reportes', descripcion: 'Exportar reportes de planificación' },
                        // CENARES
                        { nombre: 'Ver Rep. CENARES', codigo: 'reportes_cenares:read', recurso: 'reportes_cenares', accion: 'read', categoria: 'Reportes', descripcion: 'Ver reportes CENARES' },
                        { nombre: 'Exportar Rep. CENARES', codigo: 'reportes_cenares:export', recurso: 'reportes_cenares', accion: 'export', categoria: 'Reportes', descripcion: 'Exportar reportes CENARES' },
                        // Configuración de Reportes
                        { nombre: 'Ver Config. Reportes', codigo: 'reportes_config:read', recurso: 'reportes_config', accion: 'read', categoria: 'Reportes', descripcion: 'Ver configuración de reportes' },
                        { nombre: 'Gestionar Config. Reportes', codigo: 'reportes_config:write', recurso: 'reportes_config', accion: 'write', categoria: 'Reportes', descripcion: 'Configurar reportes programados' },
                        // =====================================================
                        // ALERTAS (4 secciones)
                        // =====================================================
                        // Dashboard de Alertas
                        { nombre: 'Ver Dashboard Alertas', codigo: 'alertas_dashboard:read', recurso: 'alertas_dashboard', accion: 'read', categoria: 'Alertas', descripcion: 'Ver dashboard de alertas' },
                        // Alertas
                        { nombre: 'Ver Alertas', codigo: 'alertas:read', recurso: 'alertas', accion: 'read', categoria: 'Alertas', descripcion: 'Ver listado de alertas' },
                        { nombre: 'Gestionar Alertas', codigo: 'alertas:write', recurso: 'alertas', accion: 'write', categoria: 'Alertas', descripcion: 'Crear y eliminar alertas' },
                        { nombre: 'Marcar Alertas Leídas', codigo: 'alertas:marcar', recurso: 'alertas', accion: 'marcar', categoria: 'Alertas', descripcion: 'Marcar alertas como leídas' },
                        // Reportes de Alertas
                        { nombre: 'Ver Rep. Alertas', codigo: 'alertas_reportes:read', recurso: 'alertas_reportes', accion: 'read', categoria: 'Alertas', descripcion: 'Ver reportes de alertas' },
                        // Configuración de Alertas
                        { nombre: 'Ver Config. Alertas', codigo: 'alertas_config:read', recurso: 'alertas_config', accion: 'read', categoria: 'Alertas', descripcion: 'Ver configuración de alertas' },
                        { nombre: 'Gestionar Config. Alertas', codigo: 'alertas_config:write', recurso: 'alertas_config', accion: 'write', categoria: 'Alertas', descripcion: 'Configurar umbrales y notificaciones' },
                        // =====================================================
                        // USUARIOS (3 secciones)
                        // =====================================================
                        // Usuarios
                        { nombre: 'Ver Usuarios', codigo: 'usuarios:read', recurso: 'usuarios', accion: 'read', categoria: 'Usuarios', descripcion: 'Ver listado de usuarios' },
                        { nombre: 'Crear Usuarios', codigo: 'usuarios:write', recurso: 'usuarios', accion: 'write', categoria: 'Usuarios', descripcion: 'Crear nuevos usuarios' },
                        { nombre: 'Editar Usuarios', codigo: 'usuarios:update', recurso: 'usuarios', accion: 'update', categoria: 'Usuarios', descripcion: 'Editar usuarios existentes' },
                        { nombre: 'Eliminar Usuarios', codigo: 'usuarios:delete', recurso: 'usuarios', accion: 'delete', categoria: 'Usuarios', descripcion: 'Eliminar usuarios' },
                        { nombre: 'Cambiar Contraseñas', codigo: 'usuarios:password', recurso: 'usuarios', accion: 'password', categoria: 'Usuarios', descripcion: 'Cambiar contraseñas de usuarios' },
                        { nombre: 'Cambiar Estado Usuarios', codigo: 'usuarios:estado', recurso: 'usuarios', accion: 'estado', categoria: 'Usuarios', descripcion: 'Activar/desactivar usuarios' },
                        // Roles
                        { nombre: 'Ver Roles', codigo: 'roles:read', recurso: 'roles', accion: 'read', categoria: 'Usuarios', descripcion: 'Ver listado de roles' },
                        { nombre: 'Gestionar Roles', codigo: 'roles:write', recurso: 'roles', accion: 'write', categoria: 'Usuarios', descripcion: 'Crear, editar y eliminar roles' },
                        // Permisos
                        { nombre: 'Ver Permisos', codigo: 'permisos:read', recurso: 'permisos', accion: 'read', categoria: 'Usuarios', descripcion: 'Ver listado de permisos' },
                        { nombre: 'Asignar Permisos', codigo: 'permisos:assign', recurso: 'permisos', accion: 'assign', categoria: 'Usuarios', descripcion: 'Asignar permisos a roles' },
                        // =====================================================
                        // CONFIGURACIÓN (8 secciones)
                        // =====================================================
                        // General
                        { nombre: 'Ver Config. General', codigo: 'config_general:read', recurso: 'config_general', accion: 'read', categoria: 'Configuración', descripcion: 'Ver configuración general' },
                        { nombre: 'Gestionar Config. General', codigo: 'config_general:write', recurso: 'config_general', accion: 'write', categoria: 'Configuración', descripcion: 'Modificar configuración general' },
                        // Notificaciones
                        { nombre: 'Ver Config. Notificaciones', codigo: 'config_notificaciones:read', recurso: 'config_notificaciones', accion: 'read', categoria: 'Configuración', descripcion: 'Ver configuración de notificaciones' },
                        { nombre: 'Gestionar Config. Notificaciones', codigo: 'config_notificaciones:write', recurso: 'config_notificaciones', accion: 'write', categoria: 'Configuración', descripcion: 'Modificar configuración de notificaciones' },
                        // Seguridad
                        { nombre: 'Ver Config. Seguridad', codigo: 'config_seguridad:read', recurso: 'config_seguridad', accion: 'read', categoria: 'Configuración', descripcion: 'Ver configuración de seguridad' },
                        { nombre: 'Gestionar Config. Seguridad', codigo: 'config_seguridad:write', recurso: 'config_seguridad', accion: 'write', categoria: 'Configuración', descripcion: 'Modificar políticas de seguridad' },
                        // Respaldos
                        { nombre: 'Ver Config. Respaldos', codigo: 'config_respaldos:read', recurso: 'config_respaldos', accion: 'read', categoria: 'Configuración', descripcion: 'Ver configuración de respaldos' },
                        { nombre: 'Gestionar Config. Respaldos', codigo: 'config_respaldos:write', recurso: 'config_respaldos', accion: 'write', categoria: 'Configuración', descripcion: 'Configurar respaldos automáticos' },
                        // Sistema
                        { nombre: 'Ver Config. Sistema', codigo: 'config_sistema:read', recurso: 'config_sistema', accion: 'read', categoria: 'Configuración', descripcion: 'Ver parámetros del sistema' },
                        { nombre: 'Gestionar Config. Sistema', codigo: 'config_sistema:write', recurso: 'config_sistema', accion: 'write', categoria: 'Configuración', descripcion: 'Modificar parámetros del sistema' },
                        // Mantenimiento
                        { nombre: 'Ver Config. Mantenimiento', codigo: 'config_mantenimiento:read', recurso: 'config_mantenimiento', accion: 'read', categoria: 'Configuración', descripcion: 'Ver tareas de mantenimiento' },
                        { nombre: 'Ejecutar Mantenimiento', codigo: 'config_mantenimiento:write', recurso: 'config_mantenimiento', accion: 'write', categoria: 'Configuración', descripcion: 'Ejecutar tareas de mantenimiento' },
                        // Integraciones
                        { nombre: 'Ver Config. Integraciones', codigo: 'config_integraciones:read', recurso: 'config_integraciones', accion: 'read', categoria: 'Configuración', descripcion: 'Ver integraciones externas' },
                        { nombre: 'Gestionar Config. Integraciones', codigo: 'config_integraciones:write', recurso: 'config_integraciones', accion: 'write', categoria: 'Configuración', descripcion: 'Configurar integraciones externas' },
                        // Avanzado
                        { nombre: 'Ver Config. Avanzado', codigo: 'config_avanzado:read', recurso: 'config_avanzado', accion: 'read', categoria: 'Configuración', descripcion: 'Ver configuración avanzada' },
                        { nombre: 'Gestionar Config. Avanzado', codigo: 'config_avanzado:write', recurso: 'config_avanzado', accion: 'write', categoria: 'Configuración', descripcion: 'Modificar configuración avanzada' },
                    ];
                    console.log("\uD83D\uDCDD Creando ".concat(permissions.length, " permisos granulares..."));
                    _i = 0, permissions_1 = permissions;
                    _c.label = 2;
                case 2:
                    if (!(_i < permissions_1.length)) return [3 /*break*/, 5];
                    permission = permissions_1[_i];
                    return [4 /*yield*/, prisma.permission.upsert({
                            where: { codigo: permission.codigo },
                            update: permission,
                            create: permission,
                        })];
                case 3:
                    _c.sent();
                    _c.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    roles = [
                        {
                            nombre: 'Administrador',
                            codigo: 'administrador',
                            descripcion: 'Acceso completo a todos los módulos y funciones del sistema',
                            esDefault: true,
                        },
                        {
                            nombre: 'Coordinador',
                            codigo: 'coordinador',
                            descripcion: 'Gestión de planificación, reportes y coordinación general',
                            esDefault: true,
                        },
                        {
                            nombre: 'Responsable de Acopio',
                            codigo: 'responsable_acopio',
                            descripcion: 'Gestión de inventario, movimientos y entregas',
                            esDefault: true,
                        },
                        {
                            nombre: 'Operador',
                            codigo: 'operador',
                            descripcion: 'Consultas y operaciones básicas del sistema',
                            esDefault: true,
                        },
                    ];
                    console.log('👥 Creando/actualizando roles...');
                    _a = 0, roles_1 = roles;
                    _c.label = 6;
                case 6:
                    if (!(_a < roles_1.length)) return [3 /*break*/, 9];
                    role = roles_1[_a];
                    return [4 /*yield*/, prisma.role.upsert({
                            where: { codigo: role.codigo },
                            update: role,
                            create: role,
                        })];
                case 7:
                    _c.sent();
                    _c.label = 8;
                case 8:
                    _a++;
                    return [3 /*break*/, 6];
                case 9:
                    // 3. Asignar permisos a roles
                    console.log('🔗 Asignando permisos a roles...');
                    return [4 /*yield*/, prisma.permission.findMany()];
                case 10:
                    allPermissions = _c.sent();
                    permissionMap_1 = new Map(allPermissions.map(function (p) { return [p.codigo, p.id]; }));
                    assignPermissionsToRole = function (roleCodigo, permissionCodigos) { return __awaiter(_this, void 0, void 0, function () {
                        var role, _i, permissionCodigos_1, codigo, permissionId;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, prisma.role.findUnique({ where: { codigo: roleCodigo } })];
                                case 1:
                                    role = _a.sent();
                                    if (!role)
                                        return [2 /*return*/];
                                    _i = 0, permissionCodigos_1 = permissionCodigos;
                                    _a.label = 2;
                                case 2:
                                    if (!(_i < permissionCodigos_1.length)) return [3 /*break*/, 5];
                                    codigo = permissionCodigos_1[_i];
                                    permissionId = permissionMap_1.get(codigo);
                                    if (!permissionId) return [3 /*break*/, 4];
                                    return [4 /*yield*/, prisma.rolePermission.upsert({
                                            where: {
                                                unique_role_permission: {
                                                    roleId: role.id,
                                                    permissionId: permissionId,
                                                },
                                            },
                                            update: {},
                                            create: {
                                                roleId: role.id,
                                                permissionId: permissionId,
                                            },
                                        })];
                                case 3:
                                    _a.sent();
                                    _a.label = 4;
                                case 4:
                                    _i++;
                                    return [3 /*break*/, 2];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); };
                    allPermissionCodigos = permissions.map(function (p) { return p.codigo; });
                    return [4 /*yield*/, assignPermissionsToRole('administrador', allPermissionCodigos)];
                case 11:
                    _c.sent();
                    coordinadorPermisos = [
                        'dashboard:read',
                        // Establecimientos (solo lectura)
                        'redes:read', 'microredes:read', 'centros_acopio:read', 'establecimientos:read',
                        // Inventario
                        'vacunas:read', 'vacunas:write', 'jeringas:read', 'jeringas:write',
                        'lotes_vacunas:read', 'lotes_jeringas:read',
                        'config_jeringas:read', 'config_jeringas:write',
                        // Movimientos (solo lectura)
                        'movimientos:read',
                        // Planificación (gestión completa)
                        'planificacion:read', 'planificacion:write', 'planificacion:aprobar',
                        // Kardex
                        'kardex:read', 'kardex:export',
                        // Reportes (todos)
                        'reportes_inventario:read', 'reportes_inventario:export',
                        'reportes_movimientos:read', 'reportes_movimientos:export',
                        'reportes_planificacion:read', 'reportes_planificacion:export',
                        'reportes_cenares:read', 'reportes_cenares:export',
                        'reportes_config:read', 'reportes_config:write',
                        // Alertas
                        'alertas_dashboard:read', 'alertas:read', 'alertas:marcar', 'alertas_reportes:read',
                        // Usuarios (solo lectura)
                        'usuarios:read',
                    ];
                    return [4 /*yield*/, assignPermissionsToRole('coordinador', coordinadorPermisos)];
                case 12:
                    _c.sent();
                    responsablePermisos = [
                        'dashboard:read',
                        // Establecimientos (solo lectura)
                        'redes:read', 'microredes:read', 'centros_acopio:read', 'establecimientos:read',
                        // Inventario (gestión completa)
                        'vacunas:read', 'jeringas:read',
                        'lotes_vacunas:read', 'lotes_vacunas:write',
                        'lotes_jeringas:read', 'lotes_jeringas:write',
                        'config_jeringas:read',
                        'inventario:ingreso',
                        // Movimientos (gestión completa)
                        'movimientos:read', 'movimientos:write',
                        // Planificación (solo lectura)
                        'planificacion:read',
                        // Kardex
                        'kardex:read', 'kardex:export',
                        // Reportes (inventario y movimientos)
                        'reportes_inventario:read', 'reportes_inventario:export',
                        'reportes_movimientos:read', 'reportes_movimientos:export',
                        // Alertas
                        'alertas_dashboard:read', 'alertas:read', 'alertas:marcar',
                    ];
                    return [4 /*yield*/, assignPermissionsToRole('responsable_acopio', responsablePermisos)];
                case 13:
                    _c.sent();
                    operadorPermisos = [
                        'dashboard:read',
                        // Establecimientos (solo lectura)
                        'redes:read', 'microredes:read', 'centros_acopio:read', 'establecimientos:read',
                        // Inventario (solo lectura)
                        'vacunas:read', 'jeringas:read',
                        'lotes_vacunas:read', 'lotes_jeringas:read',
                        // Movimientos (solo lectura)
                        'movimientos:read',
                        // Planificación (solo lectura)
                        'planificacion:read',
                        // Kardex (solo lectura)
                        'kardex:read',
                        // Reportes (solo lectura básica)
                        'reportes_inventario:read',
                        // Alertas (solo lectura)
                        'alertas:read',
                    ];
                    return [4 /*yield*/, assignPermissionsToRole('operador', operadorPermisos)];
                case 14:
                    _c.sent();
                    // 4. Actualizar usuarios existentes con roleId
                    console.log('🔄 Actualizando usuarios existentes con roles...');
                    return [4 /*yield*/, prisma.usuario.findMany()];
                case 15:
                    usuarios = _c.sent();
                    _b = 0, usuarios_1 = usuarios;
                    _c.label = 16;
                case 16:
                    if (!(_b < usuarios_1.length)) return [3 /*break*/, 20];
                    usuario = usuarios_1[_b];
                    return [4 /*yield*/, prisma.role.findUnique({ where: { codigo: usuario.rol } })];
                case 17:
                    role = _c.sent();
                    if (!(role && usuario.roleId !== role.id)) return [3 /*break*/, 19];
                    return [4 /*yield*/, prisma.usuario.update({
                            where: { id: usuario.id },
                            data: { roleId: role.id },
                        })];
                case 18:
                    _c.sent();
                    _c.label = 19;
                case 19:
                    _b++;
                    return [3 /*break*/, 16];
                case 20: return [4 /*yield*/, prisma.permission.count()];
                case 21:
                    totalPermisos = _c.sent();
                    return [4 /*yield*/, prisma.role.count()];
                case 22:
                    totalRoles = _c.sent();
                    return [4 /*yield*/, prisma.rolePermission.count()];
                case 23:
                    totalAsignaciones = _c.sent();
                    return [4 /*yield*/, prisma.usuario.count({ where: { roleId: { not: null } } })];
                case 24:
                    usuariosActualizados = _c.sent();
                    console.log('\n✅ Seed de roles y permisos v2 completado:');
                    console.log("   \uD83D\uDCDD Permisos: ".concat(totalPermisos));
                    console.log("   \uD83D\uDC65 Roles: ".concat(totalRoles));
                    console.log("   \uD83D\uDD17 Asignaciones: ".concat(totalAsignaciones));
                    console.log("   \uD83D\uDC64 Usuarios actualizados: ".concat(usuariosActualizados));
                    return [3 /*break*/, 26];
                case 25:
                    error_1 = _c.sent();
                    console.error('❌ Error en seed de roles y permisos v2:', error_1);
                    throw error_1;
                case 26: return [2 /*return*/];
            }
        });
    });
}
// Ejecutar si se llama directamente
if (require.main === module) {
    seedRolesAndPermissionsV2()
        .catch(function (e) {
        console.error(e);
        process.exit(1);
    })
        .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma.$disconnect()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
}
