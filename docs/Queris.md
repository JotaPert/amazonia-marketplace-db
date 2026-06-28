# 📚 Consultas (Queries) — Base de Datos Documental

**Proyecto:** Marketplace de la Amazonía  
**Tecnología:** MongoDB (Base de Datos Documental NoSQL)  

Este documento compila las operaciones y consultas (queries) fundamentales diseñadas para interactuar con la estructura de la base de datos documental del proyecto.

> **Nota Técnica:** Los ejemplos utilizan la sintaxis de MongoDB Shell (`mongosh`). Los scripts ejecutables completos se encuentran en la carpeta `scripts/`.

---

## 🔍 Consultas Representativas

### 1. Búsqueda Exacta — Obtener un artículo por código (SKU)
Recupera un documento específico basándose en un campo de identificación alfanumérico único, devolviendo el primer documento que coincida exactamente con el criterio.

```javascript
db.articulos.findOne({ "sku": "BOLS-TIK-001" });
```

---

### 2. Filtro y Ordenamiento — Listar artículos por categoría
Filtra documentos mediante una referencia (`categoria_id`) y encadena un método de ordenamiento (`sort`) para organizar los resultados de manera ascendente (`1`) según el precio.

```javascript
db.articulos.find({ "categoria_id": ObjectId("65a1b2c3d4e5f6001234567b") })
  .sort({ "precio": 1 });
```

---

### 3. Búsqueda Semántica de Texto (Full-Text Search)
Emplea índices de texto integrados en MongoDB para realizar búsquedas por palabras clave. Requiere la creación previa del índice `Buscador_Catalogo` (ver `scripts/setup/02_crear_indices.js`).

```javascript
db.articulos.find({ $text: { $search: "bolso tejido natural" } });
```

---

### 4. Relaciones Uno-a-Muchos — Historial de Pedidos de un cliente
Filtra los documentos de la colección `pedidos` asociados al identificador único (`ObjectId`) de un cliente específico, demostrando la gestión de referencias entre colecciones.

```javascript
db.pedidos.find({ "cliente_id": ObjectId("65a1b2c3d4e5f60012345679") });
```

---

### 5. Histórico Cronológico — Reseñas de un producto
Filtra las opiniones asociadas a un artículo y aplica ordenamiento descendente (`-1`) sobre la fecha de creación, priorizando los registros más recientes.

```javascript
db.reseñas.find({ "articulo_id": ObjectId("65a1b2c3d4e5f60012345678") })
  .sort({ "created_at": -1 });
```

---

### 6. Análisis Geoespacial — Búsqueda por proximidad
Demuestra el manejo de datos espaciales (GeoJSON) mediante el operador `$near`, localizando comunidades dentro de un radio máximo de 50 km desde unas coordenadas dadas. Requiere el índice `2dsphere` (ver `scripts/setup/02_crear_indices.js`).

```javascript
db.comunidades.find({
  "ubicacion_geografica.coordenadas": {
    $near: {
      $geometry: { type: "Point", coordinates: [-70.00, -3.80] },
      $maxDistance: 50000
    }
  }
});
```

---

## 📎 Anexos

### Anexo A. Modelo Físico — Esquema de Validación (JSON Schema)
Script: [`scripts/setup/01_crear_colecciones.js`](../scripts/setup/01_crear_colecciones.js)

Define las reglas de validación estructural y los tipos de datos requeridos para la colección `pedidos`, asegurando la integridad de dominio a nivel de motor de base de datos mediante `$jsonSchema`.

| Campo               | Tipo BSON            | Restricción                                    |
|---------------------|----------------------|------------------------------------------------|
| `cliente_id`        | `objectId`           | Requerido                                      |
| `fecha_pedido`      | `date`               | Requerido                                      |
| `estado`            | `string` (enum)      | Solo valores del ciclo de vida del pedido      |
| `total_pago`        | `double` / `decimal` | Requerido, valor ≥ 0                           |
| `detalles_articulos`| `array`              | Mínimo 1 ítem, cada ítem requiere SKU y cantidad |

---

### Anexo B. Estrategia de Índices
Script: [`scripts/setup/02_crear_indices.js`](../scripts/setup/02_crear_indices.js)

| Índice                          | Colección    | Tipo          | Propósito                                        |
|---------------------------------|--------------|---------------|--------------------------------------------------|
| `{ sku: 1 }`                    | `articulos`  | Único         | Evitar SKU duplicados                            |
| `{ categoria_id: 1, precio: 1 }`| `articulos`  | Compuesto     | Optimizar catálogo filtrado y ordenado           |
| `{ nombres.es, descripciones.es }`| `articulos`| Texto         | Motor de búsqueda por palabras clave             |
| `coordenadas: "2dsphere"`       | `comunidades`| Geoespacial   | Habilitar consultas de proximidad (`$near`)      |
| `{ articulo_id: 1, created_at: -1 }` | `reseñas` | Compuesto  | Ordenar reseñas por artículo y fecha             |
| `{ cliente_id: 1 }`             | `pedidos`    | Simple        | Historial de pedidos por cliente                 |

---
*Documentación estructurada para presentación académica e implementación en arquitecturas NoSQL.*
