export function calcularFinanciacion(vehiculo, cuotas) {
    if (!vehiculo) {
        throw new Error('Se requiere un vehículo.')
    }

    if (typeof vehiculo.precio !== 'number') {
        throw new Error('El vehículo debe tener un precio válido.')
    }

    if (vehiculo.precio <= 0) {
        throw new Error('El precio debe ser mayor a cero.')
    }

    if (!Number.isInteger(cuotas)) {
        throw new Error('La cantidad de cuotas debe ser un número entero.')
    }

    if (cuotas < 1) {
        throw new Error('Debe elegirse al menos una cuota.')
    }

    if (cuotas > 24) {
        throw new Error('No se permiten más de 24 cuotas.')
    }

    const valorCuota = vehiculo.precio / cuotas

    return {
        cuotas,
        valorCuota,
        total: vehiculo.precio,
    }
}