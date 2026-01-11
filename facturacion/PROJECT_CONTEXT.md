# Plataforma SaaS - Facturación Electrónica Colombia

> **Documento de Contexto del Proyecto**
> Última actualización: 2026-01-11
> Versión: 1.0.0

---

## 📋 Índice

1. [Información General](#información-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura](#arquitectura)
4. [Modelo de Datos](#modelo-de-datos)
5. [Requerimientos Funcionales](#requerimientos-funcionales)
6. [Requerimientos No Funcionales](#requerimientos-no-funcionales)
7. [Roadmap](#roadmap)
8. [Integraciones](#integraciones)
9. [Seguridad](#seguridad)
10. [Estado del Proyecto](#estado-del-proyecto)
11. [Reglas de Actualización](#reglas-de-actualización)

---

## Información General

### Propósito
Plataforma SaaS multi-tenant para gestión de ventas, inventario y facturación electrónica cumpliendo normativa DIAN en Colombia.

### Target
PYMES colombianas que necesitan:
- Cumplir con facturación electrónica obligatoria
- Controlar inventario en tiempo real
- Acceder a software empresarial accesible
- Reportes claros de ventas

### Autor
**Juan Sebastian Quintero Ortiz**
Rol: Ingeniero de Software / Gestión de Proyectos

### Modelo de Negocio
- **Tipo:** SaaS Multi-tenant
- **Monetización:** Suscripciones por plan
- **Mercado:** Colombia

---

## Stack Tecnológico

### Frontend
```
Framework: Next.js 14+
Lenguaje: TypeScript
UI: [A definir - Sugerencias: shadcn/ui, TailwindCSS]
Estado: [A definir - Sugerencias: Zustand, React Query]
```

### Backend
```
BaaS: Supabase
  - PostgreSQL (Base de datos)
  - Supabase Auth (Autenticación JWT)
  - Row Level Security (RLS)
  - Edge Functions (Deno)
  - Storage (PDF/XML facturas)
```

### Infraestructura
```
Hosting: [A definir - Cloud/VPS]
Control de versiones: Git
CI/CD: [A definir]
Monitoreo: [A definir]
```

### APIs Externas
```
Facturación: API Factus
Pagos: [A definir - Fase 2]
```

---

## Arquitectura

### Diagrama de Alto Nivel
```
┌─────────────┐
│   Cliente   │
│  (Browser)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│    Next.js App      │
│   (Frontend SPA)    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│     Supabase        │
│  ┌───────────────┐  │
│  │  PostgreSQL   │  │
│  │  (Multi-tenant)│ │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │  Auth (JWT)   │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │ Edge Functions│  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │   Storage     │  │
│  └───────────────┘  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   API Factus        │
│ (Facturación DIAN)  │
└─────────────────────┘
```

### Patrón Multi-Tenant
- **Estrategia:** Single Database, Shared Schema
- **Aislamiento:** `tenant_id` en todas las tablas + RLS
- **Ventajas:** Menor costo, mantenimiento centralizado
- **Consideración:** Políticas RLS estrictas obligatorias

---

## Modelo de Datos

### Entidades Principales

#### 1. Tenants (Empresas)
```typescript
interface Tenant {
  id: string (UUID)
  nombre_comercial: string
  razon_social: string
  nit: string
  regimen_tributario: 'simplificado' | 'común'
  email: string
  telefono: string
  direccion: string
  ciudad: string
  departamento: string
  plan_id: string (FK)
  estado: 'activo' | 'suspendido' | 'cancelado'
  fecha_registro: timestamp
  // Datos DIAN
  certificado_digital?: string
  clave_tecnica?: string
  ambiente: 'pruebas' | 'produccion'
}
```

#### 2. Users (Usuarios)
```typescript
interface User {
  id: string (UUID)
  tenant_id: string (FK)
  email: string
  nombre: string
  apellido: string
  rol: 'super_admin' | 'admin' | 'cajero' | 'contador'
  estado: 'activo' | 'inactivo'
  created_at: timestamp
}
```

#### 3. Products (Productos/Servicios)
```typescript
interface Product {
  id: string (UUID)
  tenant_id: string (FK)
  codigo: string
  nombre: string
  descripcion?: string
  tipo: 'producto' | 'servicio'
  precio: decimal
  costo?: decimal
  iva_porcentaje: decimal (0, 5, 19)
  categoria_id?: string (FK)
  stock_actual?: number
  stock_minimo?: number
  estado: 'activo' | 'inactivo'
  created_at: timestamp
}
```

#### 4. Inventory (Movimientos de Inventario)
```typescript
interface InventoryMovement {
  id: string (UUID)
  tenant_id: string (FK)
  producto_id: string (FK)
  tipo: 'entrada' | 'salida' | 'ajuste'
  cantidad: number
  motivo: string
  referencia?: string // ID de venta, compra, etc.
  usuario_id: string (FK)
  created_at: timestamp
}
```

#### 5. Customers (Clientes)
```typescript
interface Customer {
  id: string (UUID)
  tenant_id: string (FK)
  tipo_documento: 'CC' | 'NIT' | 'CE' | 'PAS' | 'consumidor_final'
  numero_documento: string
  nombre: string
  email?: string
  telefono?: string
  direccion?: string
  ciudad?: string
  created_at: timestamp
}
```

#### 6. Sales (Ventas)
```typescript
interface Sale {
  id: string (UUID)
  tenant_id: string (FK)
  numero_venta: string
  cliente_id: string (FK)
  subtotal: decimal
  iva: decimal
  total: decimal
  metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia' | 'mixto'
  estado: 'pendiente' | 'pagada' | 'anulada'
  factura_id?: string (FK)
  usuario_id: string (FK)
  created_at: timestamp
}
```

#### 7. Sale_Items (Detalle de Ventas)
```typescript
interface SaleItem {
  id: string (UUID)
  venta_id: string (FK)
  producto_id: string (FK)
  cantidad: number
  precio_unitario: decimal
  iva_porcentaje: decimal
  subtotal: decimal
  iva: decimal
  total: decimal
}
```

#### 8. Invoices (Facturas Electrónicas)
```typescript
interface Invoice {
  id: string (UUID)
  tenant_id: string (FK)
  venta_id: string (FK)
  numero_factura: string
  prefijo?: string
  cufe: string // Código Único de Factura Electrónica
  estado_dian: 'enviada' | 'aceptada' | 'rechazada'
  url_pdf?: string
  url_xml?: string
  fecha_emision: timestamp
  fecha_validacion?: timestamp
  errores_dian?: jsonb
  created_at: timestamp
}
```

#### 9. Credit_Notes (Notas Crédito)
```typescript
interface CreditNote {
  id: string (UUID)
  tenant_id: string (FK)
  factura_id: string (FK)
  numero_nota: string
  cufe: string
  motivo: string
  ajustar_inventario: boolean
  estado_dian: 'enviada' | 'aceptada' | 'rechazada'
  url_pdf?: string
  url_xml?: string
  created_at: timestamp
}
```

#### 10. Subscription_Plans (Planes)
```typescript
interface SubscriptionPlan {
  id: string (UUID)
  nombre: string
  descripcion: string
  precio_mensual: decimal
  limite_facturas_mes: number
  limite_usuarios: number
  limite_productos: number
  caracteristicas: jsonb
  estado: 'activo' | 'inactivo'
}
```

### Relaciones Clave
```
Tenant 1──N Users
Tenant 1──N Products
Tenant 1──N Customers
Tenant 1──N Sales
Tenant 1──1 SubscriptionPlan

Sale 1──N SaleItems
Sale 1──1 Invoice (opcional)
Sale N──1 Customer

Invoice 1──N CreditNotes

Product 1──N InventoryMovements
Product 1──N SaleItems
```

---

## Requerimientos Funcionales

### RF-01: Gestión de Tenants
- [ ] Registro de nueva empresa (onboarding)
- [ ] Edición de datos fiscales
- [ ] Configuración de datos DIAN
- [ ] Activar/Suspender tenant
- [ ] Dashboard de administración (Super Admin)

### RF-02: Gestión de Usuarios
- [ ] Crear usuarios por tenant
- [ ] Asignar roles (Admin, Cajero, Contador)
- [ ] Gestión de permisos
- [ ] Restablecer contraseñas
- [ ] Activar/Desactivar usuarios

### RF-03: Gestión de Clientes
- [ ] CRUD de clientes
- [ ] Cliente "Consumidor Final" por defecto
- [ ] Validación de documentos
- [ ] Historial de compras por cliente

### RF-04: Productos y Servicios
- [ ] CRUD de productos
- [ ] Categorización
- [ ] Configuración de IVA (0%, 5%, 19%)
- [ ] Productos con/sin inventario
- [ ] Importación masiva (CSV)

### RF-05: Inventario
- [ ] Entradas de inventario
- [ ] Salidas automáticas por venta
- [ ] Ajustes manuales
- [ ] Alertas de stock mínimo
- [ ] Historial de movimientos
- [ ] Reporte de valorización

### RF-06: Punto de Venta (POS)
- [ ] Interfaz de registro de ventas
- [ ] Búsqueda rápida de productos
- [ ] Cálculo automático de impuestos
- [ ] Métodos de pago múltiples
- [ ] Descuentos (opcional - Fase 2)
- [ ] Reimprimir ticket

### RF-07: Facturación Electrónica
- [ ] Envío a API Factus
- [ ] Recepción de CUFE
- [ ] Almacenamiento de PDF/XML
- [ ] Reenvío de facturas
- [ ] Descarga de documentos
- [ ] Estado de validación DIAN

### RF-08: Notas Crédito
- [ ] Anulación total de facturas
- [ ] Anulación parcial (Fase 2)
- [ ] Ajuste automático de inventario
- [ ] Envío a DIAN vía Factus
- [ ] Trazabilidad de anulaciones

### RF-09: Reportes
- [ ] Ventas diarias/mensuales/anuales
- [ ] Inventario actual y valorizado
- [ ] Productos más vendidos
- [ ] Reporte de impuestos (IVA)
- [ ] Exportación a Excel/PDF
- [ ] Dashboard con métricas clave

### RF-10: Suscripciones y Pagos (Fase 2)
- [ ] Planes de suscripción
- [ ] Límites por plan
- [ ] Pasarela de pagos
- [ ] Bloqueo automático por impago
- [ ] Historial de pagos
- [ ] Facturación recurrente

---

## Requerimientos No Funcionales

### RNF-01: Seguridad
- ✅ Autenticación JWT (Supabase Auth)
- ✅ Row Level Security (RLS) en todas las tablas
- ✅ Aislamiento total entre tenants
- ✅ Encriptación de contraseñas (bcrypt)
- ✅ HTTPS obligatorio
- [ ] Rate limiting en APIs críticas
- [ ] Logs de auditoría
- [ ] 2FA (Fase 2)

### RNF-02: Rendimiento
- Tiempo de respuesta < 2 segundos
- Soporte para 100+ tenants concurrentes
- Optimización de queries con índices
- Caché de datos frecuentes
- Lazy loading en listados grandes

### RNF-03: Escalabilidad
- Arquitectura horizontal escalable
- Base de datos con pool de conexiones
- Edge Functions auto-escalables
- CDN para assets estáticos

### RNF-04: Disponibilidad
- Uptime objetivo: 99.5%
- Backups automáticos diarios
- Plan de recuperación ante desastres
- Monitoreo 24/7 (a implementar)

### RNF-05: Usabilidad
- Interfaz intuitiva (no técnica)
- Responsive design (móvil/tablet/desktop)
- Máximo 3 clics para funciones principales
- Mensajes de error claros
- Modo oscuro (opcional)

### RNF-06: Cumplimiento Legal
- Normativa DIAN actualizada
- Retención de facturas según ley
- GDPR/protección de datos
- Términos y condiciones claros

---

## Roadmap

### 🎯 Fase 1 - MVP (3-4 meses)
**Objetivo:** Sistema funcional básico para validar mercado

- [x] Documento de requerimientos (SRS)
- [ ] Setup del proyecto
  - [ ] Configuración de Next.js + TypeScript
  - [ ] Configuración de Supabase
  - [ ] Estructura de carpetas
- [ ] Módulo de Autenticación
  - [ ] Login/Registro
  - [ ] Gestión de sesiones
  - [ ] Recuperación de contraseña
- [ ] Gestión de Tenants
  - [ ] Onboarding de empresas
  - [ ] Panel de configuración
- [ ] Módulo de Productos
  - [ ] CRUD completo
  - [ ] Categorías
- [ ] Módulo de Inventario
  - [ ] Movimientos básicos
  - [ ] Alertas de stock
- [ ] Punto de Venta
  - [ ] Interfaz POS
  - [ ] Registro de ventas
- [ ] Facturación Electrónica
  - [ ] Integración con Factus
  - [ ] Generación de CUFE
  - [ ] Almacenamiento de documentos
- [ ] Reportes Básicos
  - [ ] Ventas del día
  - [ ] Estado de inventario
- [ ] Testing y Correcciones
- [ ] Deploy en ambiente de pruebas

**Entregables:**
- Aplicación funcional con ventas + inventario + facturación
- 5 empresas beta testeando
- Documentación técnica básica

---

### 🚀 Fase 2 - Monetización (2-3 meses)
**Objetivo:** Lanzamiento comercial

- [ ] Sistema de Suscripciones
  - [ ] Definición de planes
  - [ ] Límites por plan
  - [ ] Dashboard de administración
- [ ] Pasarela de Pagos
  - [ ] Integración PSE/Tarjetas
  - [ ] Facturación recurrente
  - [ ] Webhooks de pago
- [ ] Mejoras en Reportes
  - [ ] Reportes avanzados
  - [ ] Exportación a Excel
  - [ ] Gráficos interactivos
- [ ] Notas Crédito
  - [ ] Anulación completa
  - [ ] Integración DIAN
- [ ] Optimizaciones
  - [ ] Performance
  - [ ] UX/UI refinamiento
- [ ] Marketing y Onboarding
  - [ ] Landing page
  - [ ] Video tutoriales
  - [ ] Documentación de usuario

**Entregables:**
- Plataforma comercialmente viable
- 20+ empresas pagando
- Métricas de retención > 80%

---

### 🌟 Fase 3 - Escalamiento (4-6 meses)
**Objetivo:** Funcionalidades avanzadas

- [ ] Multi-Sucursal
  - [ ] Gestión de sucursales
  - [ ] Inventario por sucursal
  - [ ] Consolidación de reportes
- [ ] App Móvil
  - [ ] React Native / Flutter
  - [ ] Ventas offline
  - [ ] Sincronización
- [ ] Integraciones
  - [ ] Contabilidad (Alegra, Siigo)
  - [ ] WhatsApp Business
  - [ ] E-commerce (Shopify, WooCommerce)
- [ ] IA y Analytics
  - [ ] Predicción de ventas
  - [ ] Recomendaciones de stock
  - [ ] Detección de anomalías
- [ ] Marketplace de Plugins
  - [ ] API pública
  - [ ] Webhooks
  - [ ] Integraciones de terceros

**Entregables:**
- 100+ empresas activas
- ARR objetivo: $XXX
- Ecosistema de partners

---

## Integraciones

### API Factus (Facturación Electrónica)
**Proveedor:** Factus
**Documentación:** [A completar con URL oficial]

#### Endpoints Clave
```typescript
// Enviar factura
POST /api/v1/invoices
Body: {
  tenant_nit: string
  customer: {...}
  items: [...]
  total: number
}
Response: {
  cufe: string
  pdf_url: string
  xml_url: string
  status: 'accepted' | 'rejected'
}

// Consultar estado
GET /api/v1/invoices/{cufe}/status

// Enviar nota crédito
POST /api/v1/credit-notes
```

#### Configuración
- [ ] Obtener credenciales de prueba
- [ ] Obtener credenciales de producción
- [ ] Configurar webhooks
- [ ] Implementar reintentos automáticos
- [ ] Manejo de errores DIAN

#### Datos Requeridos por Factura
- Datos del emisor (tenant)
- Datos del receptor (customer)
- Items con IVA
- Forma de pago
- Numeración DIAN

---

### [Futura] Pasarela de Pagos
**Opciones a evaluar:**
- Mercado Pago
- PayU
- Wompi
- ePayco

**Criterios de selección:**
- Comisiones
- Soporte PSE
- Facilidad de integración
- Webhooks confiables

---

## Seguridad

### Políticas RLS (Row Level Security)

#### Ejemplo: Tabla `products`
```sql
-- Los usuarios solo ven productos de su tenant
CREATE POLICY "Users can only see their tenant products"
ON products
FOR SELECT
USING (tenant_id = auth.jwt() ->> 'tenant_id');

-- Los usuarios solo pueden insertar en su tenant
CREATE POLICY "Users can only insert products for their tenant"
ON products
FOR INSERT
WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id');
```

#### Roles y Permisos
```typescript
const PERMISSIONS = {
  super_admin: ['*'], // Acceso total
  admin: [
    'users:create', 'users:read', 'users:update',
    'products:*', 'customers:*', 'sales:*',
    'reports:read', 'settings:update'
  ],
  cajero: [
    'customers:read', 'customers:create',
    'products:read',
    'sales:create', 'sales:read',
    'invoices:create'
  ],
  contador: [
    'reports:read',
    'sales:read',
    'invoices:read'
  ]
}
```

### Validaciones Críticas
1. **Todo request debe incluir tenant_id validado**
2. **Nunca confiar en datos del frontend para tenant_id**
3. **RLS activo en TODAS las tablas multi-tenant**
4. **Logs de auditoría en operaciones críticas**
5. **Rate limiting en endpoints públicos**

---

## Estado del Proyecto

### Versión Actual: `0.1.0-planning`

### ✅ Completado
- [x] Documento de requerimientos (SRS)
- [x] Definición de arquitectura
- [x] Modelo de datos inicial
- [x] Stack tecnológico definido

### 🚧 En Progreso
- [ ] Setup inicial del proyecto

### 📅 Próximos Pasos
1. Crear proyecto Next.js 14 con TypeScript
2. Configurar Supabase
3. Implementar autenticación básica
4. Crear migraciones de base de datos
5. Implementar RLS policies

### 📊 Métricas
- **Código:** 0% completado
- **Fase actual:** Planning
- **Tiempo estimado MVP:** 3-4 meses
- **Riesgos identificados:** 3 (ver sección Riesgos)

---

## Reglas de Actualización

> ⚠️ **IMPORTANTE:** Este documento es la fuente de verdad del proyecto.
> Debe actualizarse automáticamente cada vez que se realicen cambios significativos.

### 🔄 Cuándo Actualizar

Este documento **DEBE** actualizarse cuando:

1. **Se agrega/modifica una funcionalidad**
   - Actualizar requerimientos funcionales
   - Marcar checkboxes en roadmap
   - Actualizar estado del proyecto

2. **Se modifica el modelo de datos**
   - Agregar/editar interfaces TypeScript
   - Actualizar diagrama de relaciones
   - Documentar nuevas tablas

3. **Se integra una nueva tecnología/API**
   - Actualizar stack tecnológico
   - Agregar sección de integración
   - Documentar configuración

4. **Se completa una fase del roadmap**
   - Marcar items completados
   - Actualizar versión
   - Actualizar métricas

5. **Se identifican nuevos requerimientos**
   - Agregar a sección correspondiente
   - Asignar a fase del roadmap
   - Priorizar

6. **Se modifica la arquitectura**
   - Actualizar diagramas
   - Documentar decisiones
   - Justificar cambios

7. **Se cambian configuraciones de seguridad**
   - Actualizar políticas RLS
   - Documentar permisos
   - Registrar cambios

### ✏️ Cómo Actualizar

**Formato de actualización:**
```markdown
<!-- Al inicio del documento, actualizar: -->
> Última actualización: [FECHA]
> Versión: [SEMVER]

<!-- En la sección modificada, agregar nota: -->
**Última modificación:** [FECHA] - [Descripción breve]
```

**Versionado Semántico:**
- `MAJOR`: Cambios de arquitectura o modelo de negocio
- `MINOR`: Nuevas funcionalidades
- `PATCH`: Correcciones, actualizaciones menores

### 📝 Template de Commit
```
docs: actualizar PROJECT_CONTEXT.md

- [Sección actualizada]
- [Cambio realizado]
- [Razón del cambio]

Version: X.Y.Z -> X.Y.Z+1
```

### 🤖 Responsabilidades

**Claude Code debe:**
1. ✅ Actualizar este archivo al implementar funcionalidades
2. ✅ Mantener sincronizado el código con la documentación
3. ✅ Alertar sobre inconsistencias
4. ✅ Sugerir mejoras al modelo cuando sea necesario

**Desarrollador debe:**
1. ✅ Revisar y aprobar cambios en este documento
2. ✅ Complementar con decisiones de negocio
3. ✅ Validar que las actualizaciones sean precisas

---

## Complementos Necesarios

### 📚 Documentación Pendiente
- [ ] Guía de estilo de código
- [ ] Convenciones de nombres
- [ ] Estructura de carpetas detallada
- [ ] Manual de deployment
- [ ] Guía de contribución
- [ ] Diccionario de términos de negocio

### 🛠️ Herramientas por Definir
- [ ] Linter (ESLint config)
- [ ] Formatter (Prettier config)
- [ ] Testing framework (Jest/Vitest)
- [ ] E2E testing (Playwright/Cypress)
- [ ] Storybook para UI components
- [ ] Logging service (Sentry/LogRocket)

### 🔐 Seguridad por Implementar
- [ ] Política de respaldos
- [ ] Plan de recuperación de desastres
- [ ] Procedimiento de incidentes
- [ ] Auditoría de seguridad
- [ ] Penetration testing

### 📊 Monitoreo y Analytics
- [ ] Google Analytics / Posthog
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring
- [ ] User behavior analytics
- [ ] Business intelligence dashboards

---

## Glosario

**CUFE:** Código Único de Factura Electrónica
**DIAN:** Dirección de Impuestos y Aduanas Nacionales
**RLS:** Row Level Security
**SaaS:** Software as a Service
**Tenant:** Empresa cliente dentro del sistema multi-tenant
**POS:** Point of Sale (Punto de venta)
**MVP:** Minimum Viable Product
**BaaS:** Backend as a Service

---

## Referencias

- [Documento SRS Original](./Plataforma%20Saa%20S%20De%20Ventas%20Y%20Facturación%20Electrónica%20(colombia).pdf)
- [Documentación DIAN](https://www.dian.gov.co)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

---

**Fin del documento**

*Este es un documento vivo que evoluciona con el proyecto.*
