import { describe, expect, it } from 'vitest'

import {
    crearMensajeCompra,
    crearMensajeVenta,
    crearUrlWhatsApp,
} from './contacto'

describe('crearMensajeVenta', () => {
    it('crea el mensaje para publicar un vehículo', () => {
        // Arrange

        // Act
        const resultado = crearMensajeVenta()

        // Assert
        expect(resultado).toBe(
        'Hola, estoy interesado en publicar un vehículo en Los Santos Auto Market.'
        )
    })
})

describe('crearMensajeCompra', () => {
    it('crea el mensaje con marca, nombre y precio', () => {
        // Arrange
        const vehiculo = {
        marca: 'Truffade',
        nombre: 'Adder',
        precio: 1000000,
        }

        // Act
        const resultado = crearMensajeCompra(vehiculo)

        // Assert
        expect(resultado).toContain('Truffade Adder')
        expect(resultado).toContain(
        `$${vehiculo.precio.toLocaleString()}`
        )
    })

    it('lanza un error si no se recibe un vehículo', () => {
        // Arrange
        const vehiculo = null

        // Act + Assert
        expect(() => crearMensajeCompra(vehiculo))
        .toThrow('Se requiere un vehículo.')
    })
})

describe('crearUrlWhatsApp', () => {
    it('crea una URL con el mensaje codificado', () => {
        // Arrange
        const mensaje = 'Hola, quiero comprar un Adder.'

        // Act
        const resultado = crearUrlWhatsApp(mensaje)

        // Assert
        expect(resultado).toBe(
        'https://wa.me/541156535589?text=' +
            encodeURIComponent(mensaje)
        )
    })

    it('permite utilizar otro número de WhatsApp', () => {
        // Arrange
        const mensaje = 'Hola'
        const numero = '5493511234567'

        // Act
        const resultado = crearUrlWhatsApp(
        mensaje,
        numero
        )

        // Assert
        expect(resultado).toBe(
        `https://wa.me/${numero}?text=Hola`
        )
    })

    it.each(['', '   '])(
        'rechaza mensajes vacíos',
        (mensaje) => {
        // Arrange

        // Act + Assert
        expect(() => crearUrlWhatsApp(mensaje))
            .toThrow(
            'El mensaje de WhatsApp no puede estar vacío.'
            )
        }
    )
})