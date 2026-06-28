// ==========================================================
// CONSULTAS REPRESENTATIVAS — Marketplace de la Amazonía
// Proyecto: BD Documental (MongoDB)
// Ejecutar en: mongosh  |  use amazonia_db
// ==========================================================


// 1. BÚSQUEDA EXACTA
// Recuperar un artículo específico por su código (SKU)
db.articulos.findOne({ "sku": "BOLS-TIK-001" });


// 2. FILTRO + ORDENAMIENTO
// Listar artículos de una categoría, ordenados por precio ascendente
db.articulos
  .find({ "categoria_id": ObjectId("65a1b2c3d4e5f6001234567b") })
  .sort({ "precio": 1 });


// 3. BÚSQUEDA DE TEXTO (Full-Text Search)
// Requiere el índice "Buscador_Catalogo" del script 02_crear_indices.js
db.articulos.find({ $text: { $search: "bolso tejido natural" } });


// 4. RELACIÓN UNO-A-MUCHOS
// Obtener el historial de pedidos de un cliente
db.pedidos.find({ "cliente_id": ObjectId("65a1b2c3d4e5f60012345679") });


// 5. HISTÓRICO CRONOLÓGICO
// Ver las reseñas de un artículo, del más reciente al más antiguo
db.reseñas
  .find({ "articulo_id": ObjectId("65a1b2c3d4e5f60012345678") })
  .sort({ "created_at": -1 });


// 6. CONSULTA GEOESPACIAL
// Requiere el índice 2dsphere del script 02_crear_indices.js
// Encontrar comunidades en un radio de 50 km a unas coordenadas dadas
db.comunidades.find({
  "ubicacion_geografica.coordenadas": {
    $near: {
      $geometry: { type: "Point", coordinates: [-70.00, -3.80] },
      $maxDistance: 50000
    }
  }
});
