// ==========================================================
// SCRIPT 02: Creación de Índices de Optimización
// Proyecto: Marketplace de la Amazonía — BD Documental
// Ejecutar DESPUÉS de 01_crear_colecciones.js
// Ejecutar en: mongosh  |  use amazonia_db
// ==========================================================

// -- Colección: articulos -----------------------------------

// Índice Único: garantiza que no se repitan productos por SKU
db.articulos.createIndex({ "sku": 1 }, { unique: true });

// Índice Compuesto: optimiza filtrado por categoría + ordenamiento por precio
// Ejemplo: "Mostrar artículos de la categoría X ordenados por precio"
db.articulos.createIndex({ "categoria_id": 1, "precio": 1 });

// Índice Simple: agiliza la búsqueda de artículos por vendedor
db.articulos.createIndex({ "vendedor_id": 1 });

// Índice de Texto (Full-Text Search): habilita el motor de búsqueda por relevancia
// Permite buscar palabras clave en nombres y descripciones
// "nombres.es" tiene el doble de peso que "descripciones.es"
db.articulos.createIndex({
  "nombres.es": "text",
  "descripciones.es": "text"
}, {
  weights: { "nombres.es": 10, "descripciones.es": 5 },
  name: "Buscador_Catalogo"
});

// -- Colección: comunidades (Índice Geoespacial) ------------
// Requerido para que funcionen las consultas con $near y $geoWithin
db.comunidades.createIndex({ "ubicacion_geografica.coordenadas": "2dsphere" });

// -- Colección: reseñas ------------------------------------
// Índice para agilizar las búsquedas de reseñas por artículo
db.reseñas.createIndex({ "articulo_id": 1, "created_at": -1 });

// -- Colección: pedidos ------------------------------------
// Índice para agilizar la búsqueda del historial de pedidos por cliente
db.pedidos.createIndex({ "cliente_id": 1 });

// Índice para agilizar consultas por estado del pedido (ej. dashboard de administrador)
db.pedidos.createIndex({ "estado": 1 });

// -- Colección: usuarios -----------------------------------
// Índice Único: garantiza que no se puedan registrar dos usuarios con el mismo email
db.usuarios.createIndex({ "email": 1 }, { unique: true });

print("Índices creados correctamente.");
