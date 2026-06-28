# 🍃 Marketplace de la Amazonía — Base de Datos Documental

Repositorio de datos y scripts de configuración de la base de datos documental (**MongoDB**) para explicar un ejercicio académico sobre un Marketplace de la Amazonía.

---

## 📁 Estructura del Proyecto

```
bdDocumentales/
│
├── data/                         # Datos semilla (seed data) — MongoDB Extended JSON
│   ├── articulos.json            # Catálogo de productos artesanales
│   ├── categorias.json           # Jerarquía de categorías del catálogo
│   ├── coleccion.json            # Transacciones y pedidos realizados
│   ├── comunidades.json          # Comunidades de artesanos (con datos GeoJSON)
│   ├── reseñas.json              # Calificaciones y comentarios de productos
│   └── usuarios.json             # Perfiles de clientes y vendedores
│
├── scripts/
│   ├── setup/
│   │   ├── 01_crear_colecciones.js   # Crea colecciones con validación JSON Schema
│   │   └── 02_crear_indices.js       # Crea índices de optimización y búsqueda
│   └── queries.js                    # Consultas representativas del sistema
│
├── docs/
│   └── Queris.md                 # Documentación académica de operaciones y anexos
│
└── README.md                     # Este archivo
```

---

## 🚀 Guía de Despliegue — Paso a Paso

### Requisitos Previos
- **MongoDB Server** instalado (local) o un clúster en **MongoDB Atlas**.
- **MongoDB Database Tools** para usar `mongoimport` en terminal.
- (Recomendado) **MongoDB Compass** como interfaz gráfica.

---

### Paso 1: Ejecutar los scripts de configuración

Abre MongoDB Compass, conéctate y abre el shell integrado (`>_ mongosh`). Primero, crea o selecciona la base de datos:

```javascript
use amazonia_db
```

Luego, **copia y pega** el contenido de los scripts en este orden:

1. **`scripts/setup/01_crear_colecciones.js`** — Crea las colecciones con sus esquemas de validación.
2. **`scripts/setup/02_crear_indices.js`** — Aplica los índices de optimización y búsqueda geoespacial.

---

### Paso 2: Importar los datos semilla

#### Opción A: MongoDB Compass (Interfaz Gráfica)
1. En el panel izquierdo, selecciona la colección deseada (ej. `articulos`).
2. Haz clic en **"Add Data"** → **"Import JSON or CSV file"**.
3. Selecciona el archivo correspondiente de la carpeta `data/`.
4. Repite para cada colección.

#### Opción B: Terminal con `mongoimport`
Ejecuta desde la raíz del repositorio:

```bash
mongoimport --db amazonia_db --collection articulos    --file data/articulos.json
mongoimport --db amazonia_db --collection categorias   --file data/categorias.json
mongoimport --db amazonia_db --collection pedidos      --file data/coleccion.json
mongoimport --db amazonia_db --collection comunidades  --file data/comunidades.json
mongoimport --db amazonia_db --collection reseñas      --file data/reseñas.json
mongoimport --db amazonia_db --collection usuarios     --file data/usuarios.json
```

> **Nota:** Los archivos `.json` usan el formato **MongoDB Extended JSON** (`{"$oid": "..."}`, `{"$date": "..."}`), por lo que `mongoimport` los interpretará correctamente como tipos BSON nativos.

---

### Paso 3: Probar las consultas

Con la base de datos configurada y poblada, abre `scripts/queries.js`, copia cada consulta y pégala en el shell de `mongosh` para ver los resultados.

Para una explicación detallada de cada operación, sus fundamentos académicos y la estrategia de índices, consulta el documento:

📄 [`docs/Queris.md`](docs/Queris.md)

---

## 🗂️ Formato de los Datos

Los archivos en `data/` usan **MongoDB Extended JSON**, el estándar que permite representar tipos BSON en archivos JSON legibles:

| Tipo BSON  | Sintaxis en los archivos `.json`       |
|------------|----------------------------------------|
| `ObjectId` | `{ "$oid": "65a1b2c3d4e5f600..." }`    |
| `ISODate`  | `{ "$date": "2024-01-15T10:00:00Z" }`  |
