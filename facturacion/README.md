# 🧾 Plataforma SaaS - Facturación Electrónica Colombia

> Sistema de gestión de ventas, inventario y facturación electrónica para PYMES colombianas

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-BaaS-green)](https://supabase.com/)

---

## 📖 Descripción

Plataforma SaaS multi-tenant diseñada para pequeñas y medianas empresas (PYMES) en Colombia que necesitan:

- ✅ Cumplir con la **facturación electrónica obligatoria** (DIAN)
- ✅ Controlar inventario en tiempo real
- ✅ Gestionar ventas de forma eficiente
- ✅ Generar reportes y estadísticas
- ✅ Acceder desde cualquier dispositivo

---

## ✨ Características Principales

### Fase 1 - MVP (En desarrollo)

- 🏢 **Multi-tenant** - Múltiples empresas en una sola infraestructura
- 🔐 **Autenticación segura** - JWT con Supabase Auth
- 📦 **Gestión de inventario** - Control de stock con alertas
- 💰 **Punto de venta (POS)** - Registro rápido de ventas
- 🧾 **Facturación electrónica** - Integración con API Factus
- 👥 **Gestión de usuarios** - Roles: Admin, Cajero, Contador
- 📊 **Reportes** - Ventas, inventario, productos más vendidos
- 🔄 **Notas crédito** - Anulación de facturas

---

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 16 + TypeScript + TailwindCSS
- **Backend:** Supabase (PostgreSQL, Auth, RLS, Edge Functions)
- **Facturación:** API Factus (DIAN)

---

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local

# Configurar credenciales en .env.local
# (Ver sección de Configuración)

# Ejecutar en desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configuración

### 1. Supabase

1. Crear proyecto en [Supabase](https://supabase.com)
2. Obtener credenciales (URL, anon key, service role key)
3. Agregar a `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### 2. Factus API

1. Registrarse en [Factus](https://factus.com.co)
2. Obtener API key de prueba
3. Agregar a `.env.local`:

```env
FACTUS_API_URL=https://api-test.factus.com.co
FACTUS_API_KEY=tu-api-key
FACTUS_ENVIRONMENT=test
```

---

## 📁 Estructura del Proyecto

```
facturacion/
├── app/                # Next.js App Router
├── components/         # Componentes React
├── lib/               # Utilidades (Supabase, Factus)
├── types/             # Tipos TypeScript
├── supabase/          # Migraciones SQL
├── PROJECT_CONTEXT.md # Documentación completa
└── docs.pdf          # SRS original
```

---

## 📚 Documentación

- **[PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md)** - Documentación completa del proyecto
- **[docs.pdf](./docs.pdf)** - Documento de requerimientos (SRS)

---

## 🗺️ Roadmap

- ✅ Setup inicial
- 🚧 Autenticación y multi-tenant
- 📅 Módulos de productos e inventario
- 📅 POS y facturación electrónica
- 📅 Reportes y analytics

Ver roadmap detallado en [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md#roadmap)

---

## 👤 Autor

**Juan Sebastian Quintero Ortiz**
Ingeniero de Software / Gestión de Proyectos

---

**Versión:** 0.1.0 (Planning)
**Última actualización:** Enero 2026
