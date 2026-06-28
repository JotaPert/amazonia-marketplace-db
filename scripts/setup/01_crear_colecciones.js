// ==========================================================
// SCRIPT 01: Creación de Colecciones con Validación
// Proyecto: Marketplace de la Amazonía — BD Documental
// Ejecutar en: mongosh  |  use amazonia_db
// NOTA: Ejecutar ANTES de 02_crear_indices.js
// ==========================================================

// ----------------------------------------------------------
// 1. PEDIDOS
// ----------------------------------------------------------
db.createCollection("pedidos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["cliente_id", "fecha_pedido", "estado", "detalles_articulos", "total_pago", "metodo_pago"],
      properties: {
        cliente_id: {
          bsonType: "objectId",
          description: "Referencia al usuario que realizó el pedido (requerido)"
        },
        fecha_pedido: {
          bsonType: "date",
          description: "Fecha y hora de creación del pedido (ISODate)"
        },
        estado: {
          enum: ["pendiente", "pagado", "en_preparacion", "en_camino", "enviado", "entregado", "cancelado"],
          description: "Estado actual del pedido en su ciclo de vida"
        },
        metodo_pago: {
          bsonType: "string",
          enum: ["tarjeta_credito", "tarjeta_debito", "transferencia", "efectivo", "paypal"],
          description: "Medio de pago utilizado para la transacción"
        },
        total_pago: {
          bsonType: ["double", "decimal"],
          minimum: 0,
          description: "Monto total pagado. Debe ser un número positivo"
        },
        detalles_articulos: {
          bsonType: "array",
          minItems: 1,
          description: "Lista de artículos comprados. Debe tener al menos uno",
          items: {
            bsonType: "object",
            required: ["sku", "cantidad", "precio_comprado"],
            properties: {
              sku: {
                bsonType: "string",
                description: "Código único del artículo comprado"
              },
              nombre: {
                bsonType: "string",
                description: "Nombre del artículo al momento de la compra (desnormalizado)"
              },
              precio_comprado: {
                bsonType: ["double", "decimal"],
                minimum: 0,
                description: "Precio unitario al momento de la compra (histórico)"
              },
              cantidad: {
                bsonType: ["int", "long", "double"],
                minimum: 1,
                description: "Número de unidades compradas"
              }
            }
          }
        },
        direccion_entrega: {
          bsonType: "object",
          required: ["calle", "ciudad", "pais"],
          description: "Dirección de envío del pedido",
          properties: {
            calle: { bsonType: "string" },
            ciudad: { bsonType: "string" },
            codigo_postal: { bsonType: "string" },
            pais: { bsonType: "string" }
          }
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// ----------------------------------------------------------
// 2. ARTICULOS
// ----------------------------------------------------------
db.createCollection("articulos", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["sku", "vendedor_id", "comunidad_id", "nombres", "precio", "stock", "categoria_id"],
      properties: {
        sku: {
          bsonType: "string",
          description: "Código único del artículo (ej: BOLS-TIK-001). Requerido"
        },
        vendedor_id: {
          bsonType: "objectId",
          description: "Referencia al usuario vendedor"
        },
        comunidad_id: {
          bsonType: "objectId",
          description: "Referencia a la comunidad artesana de origen"
        },
        comunidad_resumen: {
          bsonType: "object",
          description: "Datos desnormalizados de la comunidad para consultas rápidas",
          properties: {
            nombre: { bsonType: "string" },
            etnia: { bsonType: "string" }
          }
        },
        nombres: {
          bsonType: "object",
          required: ["es"],
          description: "Nombre del artículo localizado. Español es obligatorio",
          properties: {
            es: { bsonType: "string" },
            en: { bsonType: "string" }
          }
        },
        descripciones: {
          bsonType: "object",
          properties: {
            es: { bsonType: "string" },
            en: { bsonType: "string" }
          }
        },
        historia_cultural: {
          bsonType: "object",
          description: "Contexto cultural del artículo (campo enriquecido)",
          properties: {
            es: { bsonType: "string" },
            en: { bsonType: "string" }
          }
        },
        precio: {
          bsonType: ["double", "decimal"],
          minimum: 0,
          description: "Precio de venta. Debe ser positivo"
        },
        moneda: {
          bsonType: "string",
          enum: ["USD", "COP", "BRL", "EUR"],
          description: "Divisa del precio"
        },
        stock: {
          bsonType: ["int", "long", "double"],
          minimum: 0,
          description: "Unidades disponibles en inventario"
        },
        dimensiones: {
          bsonType: "object",
          description: "Dimensiones físicas del artículo",
          properties: {
            alto_cm: { bsonType: ["int", "double", "decimal"] },
            ancho_cm: { bsonType: ["int", "double", "decimal"] },
            peso_g: { bsonType: ["int", "double", "decimal"] }
          }
        },
        categoria_id: {
          bsonType: "objectId",
          description: "Referencia a la categoría del catálogo"
        },
        promedio_calificacion: {
          bsonType: ["double", "decimal"],
          minimum: 0,
          maximum: 5,
          description: "Promedio de puntuaciones. Rango: 0.0 – 5.0"
        },
        total_reseñas: {
          bsonType: ["int", "long", "double"],
          minimum: 0,
          description: "Contador desnormalizado del total de reseñas"
        },
        etiquetas: {
          bsonType: "array",
          description: "Palabras clave para búsqueda y filtrado",
          items: { bsonType: "string" }
        },
        fotos_url: {
          bsonType: "array",
          minItems: 1,
          description: "URLs de las imágenes del artículo. Mínimo una foto",
          items: { bsonType: "string" }
        },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

// ----------------------------------------------------------
// 3. USUARIOS
// ----------------------------------------------------------
db.createCollection("usuarios", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre_completo", "email", "rol"],
      properties: {
        nombre_completo: {
          bsonType: "string",
          description: "Nombre y apellido del usuario. Requerido"
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$",
          description: "Correo electrónico válido. Requerido"
        },
        rol: {
          enum: ["cliente", "vendedor", "admin"],
          description: "Rol del usuario en la plataforma"
        },
        preferencias_idioma: {
          bsonType: "string",
          enum: ["es", "en", "pt"],
          description: "Idioma preferido del usuario"
        },
        direcciones: {
          bsonType: "array",
          description: "Lista de direcciones guardadas por el usuario",
          items: {
            bsonType: "object",
            required: ["calle", "ciudad"],
            properties: {
              tipo: { bsonType: "string", enum: ["casa", "oficina", "otro"] },
              calle: { bsonType: "string" },
              ciudad: { bsonType: "string" },
              is_default: { bsonType: "bool" }
            }
          }
        },
        created_at: { bsonType: "date" }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

// ----------------------------------------------------------
// 4. COMUNIDADES
// ----------------------------------------------------------
db.createCollection("comunidades", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre_comunidad", "etnia", "ubicacion_geografica"],
      properties: {
        nombre_comunidad: {
          bsonType: "string",
          description: "Nombre oficial de la comunidad. Requerido"
        },
        etnia: {
          bsonType: "string",
          description: "Pueblo o grupo étnico al que pertenece. Requerido"
        },
        ubicacion_geografica: {
          bsonType: "object",
          required: ["coordenadas"],
          description: "Datos de ubicación. Las coordenadas GeoJSON son requeridas",
          properties: {
            rio: { bsonType: "string" },
            departamento: { bsonType: "string" },
            coordenadas: {
              bsonType: "object",
              required: ["type", "coordinates"],
              description: "Punto GeoJSON para consultas geoespaciales ($near, $geoWithin)",
              properties: {
                type: { enum: ["Point"] },
                coordinates: {
                  bsonType: "array",
                  minItems: 2,
                  maxItems: 2,
                  items: { bsonType: ["double", "decimal"] }
                }
              }
            }
          }
        },
        lenguas_principales: {
          bsonType: "array",
          description: "Idiomas y lenguas habladas en la comunidad",
          items: { bsonType: "string" }
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// ----------------------------------------------------------
// 5. RESEÑAS
// ----------------------------------------------------------
db.createCollection("reseñas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["articulo_id", "usuario_id", "puntuacion"],
      properties: {
        articulo_id: {
          bsonType: "objectId",
          description: "Referencia al artículo evaluado. Requerido"
        },
        usuario_id: {
          bsonType: "objectId",
          description: "Referencia al usuario que escribió la reseña. Requerido"
        },
        puntuacion: {
          bsonType: ["int", "double"],
          minimum: 1,
          maximum: 5,
          description: "Calificación del 1 al 5"
        },
        comentario: {
          bsonType: "object",
          description: "Comentario opcional estructurado en título y cuerpo",
          properties: {
            titulo: { bsonType: "string" },
            cuerpo: { bsonType: "string" }
          }
        },
        created_at: { bsonType: "date" }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

// ----------------------------------------------------------
// 6. CATEGORIAS
// ----------------------------------------------------------
db.createCollection("categorias", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["slug", "nombres_localizados"],
      properties: {
        slug: {
          bsonType: "string",
          description: "Identificador URL-friendly único (ej: bolsos-tejidos). Requerido"
        },
        nombres_localizados: {
          bsonType: "object",
          required: ["es"],
          description: "Nombre de la categoría localizado. Español obligatorio",
          properties: {
            es: { bsonType: "string" },
            en: { bsonType: "string" }
          }
        },
        ruta: {
          bsonType: "string",
          description: "Ruta jerárquica completa de la categoría (ej: /raiz/artesanias/...)"
        },
        parent_id: {
          bsonType: ["objectId", "null"],
          description: "Referencia a la categoría padre. Null si es categoría raíz"
        }
      }
    }
  },
  validationLevel: "strict",
  validationAction: "error"
});

print("Las 6 colecciones fueron creadas con sus esquemas de validación.");