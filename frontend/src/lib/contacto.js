const NUMERO_WHATSAPP = '541156535589'

export function crearMensajeVenta() {
    return 'Hola, estoy interesado en publicar un vehículo en Los Santos Auto Market.'
}

export function crearMensajeCompra(vehiculo) {
    if (!vehiculo) {
        throw new Error('Se requiere un vehículo.')
    }

    return (
        `Hola, estoy interesado en comprar el ` +
        `${vehiculo.marca} ${vehiculo.nombre} ` +
        `por $${vehiculo.precio.toLocaleString()}.`
    )
}

export function crearUrlWhatsApp(
    mensaje,
    numero = NUMERO_WHATSAPP
    ) {
    if (!mensaje || !mensaje.trim()) {
        throw new Error('El mensaje de WhatsApp no puede estar vacío.')
    }

    return (
        `https://wa.me/${numero}?text=` +
        encodeURIComponent(mensaje)
    )
}