// ==========================================================
// CONSULTAS REPRESENTATIVAS — Marketplace de la Amazonía
// Proyecto: BD Documental (MongoDB)
// Ejecutar en: mongosh  |  use amazonia_db
// ==========================================================

print("=== INICIANDO EJECUCIÓN DE CONSULTAS ===");

// 1. BÚSQUEDA EXACTA
print("\n--- 1. Búsqueda Exacta: Artículo por SKU ---");
printjson(db.articulos.findOne({ "sku": "BOLS-TIK-001" }));


// 2. FILTRO + ORDENAMIENTO
print("\n--- 2. Filtro + Ordenamiento: Artículos por categoría ordenados por precio ---");
printjson(db.articulos
  .find({ "categoria_id": ObjectId("65a1b2c3d4e5f6001234567b") })
  .sort({ "precio": 1 })
  .toArray()
);


// 3. BÚSQUEDA DE TEXTO (Full-Text Search)
print("\n--- 3. Búsqueda de Texto: 'bolso tejido natural' ---");
printjson(db.articulos.find({ $text: { $search: "bolso tejido natural" } }).toArray());


// 4. RELACIÓN UNO-A-MUCHOS
print("\n--- 4. Relación Uno-a-Muchos: Pedidos de un cliente ---");
printjson(db.pedidos.find({ "cliente_id": ObjectId("65a1b2c3d4e5f60012345679") }).toArray());


// 5. HISTÓRICO CRONOLÓGICO
print("\n--- 5. Histórico Cronológico: Reseñas de un artículo ordenadas por fecha ---");
printjson(db.reseñas
  .find({ "articulo_id": ObjectId("65a1b2c3d4e5f60012345678") })
  .sort({ "created_at": -1 })
  .toArray()
);


// 6. CONSULTA GEOESPACIAL
print("\n--- 6. Consulta Geoespacial: Comunidades en un radio de 50km ---");
printjson(db.comunidades.find({
  "ubicacion_geografica.coordenadas": {
    $near: {
      $geometry: { type: "Point", coordinates: [-70.00, -3.80] },
      $maxDistance: 50000
    }
  }
}).toArray());


// 7. CONSULTA SOBRE ARREGLOS (Array Querying)
print("\n--- 7. Consulta sobre Arreglos: Artículos con etiquetas 'ancestral' y 'tejido' ---");
printjson(db.articulos.find({ "etiquetas": { $all: ["ancestral", "tejido"] } }).toArray());


// 8. PROYECCIÓN DE DOCUMENTOS (Projection)
print("\n--- 8. Proyección: Solo nombres, precios y stock (sin _id) ---");
printjson(db.articulos.find(
  { "precio": { $gt: 20 } },
  { "_id": 0, "nombres.es": 1, "precio": 1, "stock": 1 }
).toArray());


// 9. FRAMEWORK DE AGREGACIÓN (Aggregation Pipeline)
print("\n--- 9. Agregación: Ingresos totales por pedidos activos (en_camino o entregado) ---");
printjson(db.pedidos.aggregate([
  { $match: { "estado": { $in: ["en_camino", "entregado"] } } },
  { $group: {
      _id: null,
      ingresos_totales: { $sum: "$total_pago" },
      cantidad_pedidos: { $sum: 1 }
  }}
]).toArray());


// 10. ACTUALIZACIÓN ATÓMICA (Atomic Update)
print("\n--- 10. Actualización Atómica: Restar stock ---");
printjson(db.articulos.updateOne(
  { "sku": "BOLS-TIK-001" },
  { $inc: { "stock": -1 } }
));

print("\n=== EJECUCIÓN FINALIZADA ===");
