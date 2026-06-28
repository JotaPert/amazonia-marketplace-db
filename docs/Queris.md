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

### 7. Consultas sobre Arreglos (Array Querying)
A diferencia de las bases de datos relacionales, MongoDB permite indexar y consultar directamente dentro de listas. El operador `$all` garantiza que el documento devuelto contenga *todos* los elementos especificados en el arreglo de etiquetas, sin importar el orden.

```javascript
db.articulos.find({ "etiquetas": { $all: ["ancestral", "tejido"] } });
```

---

### 8. Proyección de Documentos (Projection)
Demuestra la técnica de optimización de ancho de banda. Mediante el segundo argumento del método `find`, se instruye a la base de datos para que construya y devuelva una versión reducida del documento, excluyendo la llave primaria obligatoria `_id` (`0`) y seleccionando explícitamente (`1`) solo los campos de interés.

```javascript
db.articulos.find(
  { "precio": { $gt: 20 } },
  { "_id": 0, "nombres.es": 1, "precio": 1, "stock": 1 }
);
```

---

### 9. Framework de Agregación (Aggregation Pipeline)
El patrón de diseño más potente de MongoDB para análisis de datos (Data Analytics). Compone una tubería de procesamiento por etapas (`stages`). Primero filtra (`$match`) los pedidos que están activos (`en_camino` o `entregado`) mediante el operador `$in`, y luego agrupa (`$group`) los resultados para calcular métricas financieras acumuladas en tiempo real.

```javascript
db.pedidos.aggregate([
  { $match: { "estado": { $in: ["en_camino", "entregado"] } } },
  { $group: {
      _id: null,
      ingresos_totales: { $sum: "$total_pago" },
      cantidad_pedidos: { $sum: 1 }
  }}
]);
```

---

### 10. Operaciones Atómicas y Control de Concurrencia
Muestra cómo modificar un documento de forma segura en un entorno de alta demanda. El operador `$inc` incrementa (o reduce, al ser negativo) un valor numérico directamente a nivel de base de datos, evitando la condición de carrera típica de "leer, restar en memoria local y volver a guardar".

```javascript
db.articulos.updateOne(
  { "sku": "BOLS-TIK-001" },
  { $inc: { "stock": -1 } }
);
```

---

## 📎 Anexos

### Anexo A. Modelo Físico — Esquema de Validación (JSON Schema)
Script: [`scripts/setup/01_crear_colecciones.js`](../scripts/setup/01_crear_colecciones.js)

Define las reglas de validación estructural y los tipos de datos requeridos para todas las colecciones, asegurando la integridad de dominio a nivel de motor de base de datos mediante `$jsonSchema`.

| Colección     | Nivel      | Campos Principales Requeridos y Reglas de Negocio destacadas |
|---------------|------------|--------------------------------------------------------------|
| `pedidos`     | Estricta   | `cliente_id`, `estado` (enum), `total_pago` (≥ 0), `metodo_pago`, `detalles_articulos` (mínimo 1), `direccion_entrega`. |
| `articulos`   | Moderada   | `sku`, `vendedor_id`, `comunidad_id`, `precio` (≥ 0), `stock` (≥ 0), `categoria_id`. Permite `dimensiones`, `fotos_url` y `etiquetas`. |
| `usuarios`    | Moderada   | `nombre_completo`, `email` (regex de formato), `rol` (enum: cliente, vendedor, admin). Array de `direcciones`. |
| `comunidades` | Estricta   | `nombre_comunidad`, `etnia`, `ubicacion_geografica` (requiere formato válido `GeoJSON Point` estricto). |
| `reseñas`     | Estricta   | `articulo_id`, `usuario_id`, `puntuacion` (rango numérico de 1 a 5). |
| `categorias`  | Estricta   | `slug`, `nombres_localizados.es`. Soporta jerarquía con llave `parent_id`. |

---

### Anexo B. Estrategia de Índices
Script: [`scripts/setup/02_crear_indices.js`](../scripts/setup/02_crear_indices.js)

| Índice                          | Colección    | Tipo          | Propósito                                        |
|---------------------------------|--------------|---------------|--------------------------------------------------|
| `{ sku: 1 }`                    | `articulos`  | Único         | Evitar SKU duplicados en inventario              |
| `{ email: 1 }`                  | `usuarios`   | Único         | Prevenir registro de cuentas con email duplicado |
| `{ categoria_id: 1, precio: 1 }`| `articulos`  | Compuesto     | Optimizar vista de catálogo ordenado             |
| `{ nombres.es, descripciones.es }`| `articulos`| Texto         | Motor de búsqueda por relevancia                 |
| `coordenadas: "2dsphere"`       | `comunidades`| Geoespacial   | Búsqueda de proximidad (`$near`, `$geoWithin`)   |
| `{ articulo_id: 1, created_at: -1 }`| `reseñas`| Compuesto     | Historial cronológico de reseñas de un artículo  |
| `{ cliente_id: 1 }`             | `pedidos`    | Simple        | Historial de transacciones de un usuario         |
| `{ estado: 1 }`                 | `pedidos`    | Simple        | Filtrado de pedidos (ej. dashboard de logística) |
| `{ vendedor_id: 1 }`            | `articulos`  | Simple        | Catálogo específico de un vendedor               |

---
*Documentación estructurada para presentación académica e implementación en arquitecturas NoSQL.*
