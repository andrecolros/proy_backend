/**
 * Middleware de validación para Express usando Joi
 *
 * @param {Object} schema - Esquema Joi que define cómo deben ser los datos
 * @param {String} target - Parte del request a validar (body, query, params)
 *
 * Este middleware:
 * 1. Verifica que existan datos en la petición
 * 2. Valida los datos contra un esquema Joi
 * 3. Devuelve errores claros si la validación falla
 * 4. Reemplaza los datos originales por los datos validados
 * 5. Continúa con el siguiente middleware o controller
 */
function validate(schema, target = 'body') {

  // Devuelve un middleware que Express ejecutará
  return (req, res, next) => {

    // Obtener los datos del request según el target
    // Puede ser: req.body, req.query, req.params, etc.
    const data = req[target];

    /**
     * Paso 1: Verificar que existan datos
     * Si no hay datos o el objeto está vacío,
     * se devuelve un error HTTP 400
     */
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        message: `El ${target} no puede estar vacío`,
      });
    }

    /**
     * Paso 2: Validar los datos contra el esquema Joi
     *
     * abortEarly: false
     *   → No detenerse en el primer error, mostrar todos los errores
     *
     * stripUnknown: true
     *   → Eliminar campos que no están definidos en el schema
     */
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    /**
     * Paso 3: Si hay errores de validación,
     * devolver respuesta 400 con los mensajes
     */
    if (error) {
      return res.status(400).json({
        message: `Error de validación en ${target}`,
        errors: error.details.map((err) => err.message),
      });
    }

    /**
     * Paso 4: Reemplazar los datos originales
     * por los datos validados y limpiados
     */
    req[target] = value;

    /**
     * Continuar con el siguiente middleware
     * o con el controller
     */
    next();
  };
}

// Exportar el middleware para usarlo en las rutas
export default validate;