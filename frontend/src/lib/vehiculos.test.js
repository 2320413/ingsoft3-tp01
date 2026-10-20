import { describe, expect, it, vi } from 'vitest'

import {
    cargarVehiculos,
    construirUrlVehiculos,
    filtrarVehiculosFavoritos,
} from './vehiculos'

describe('construirUrlVehiculos', () => {
    it.each([
        ['', '', '/api/vehiculos?'],
        ['adder', '', '/api/vehiculos?buscar=adder'],
        [
        '',
        'Legendary Motorsport',
        '/api/vehiculos?concesionaria=Legendary+Motorsport',
        ],
    ])(
        'construye correctamente la URL',
        (buscar, concesionaria, esperado) => {
        // Arrange
        // Los datos entran como parámetros del test.

        // Act
        const resultado = construirUrlVehiculos(
            buscar,
            concesionaria
        )

        // Assert
        expect(resultado).toBe(esperado)
        }
    )
})

describe('filtrarVehiculosFavoritos', () => {
    const vehiculos = [
        { id: 1, nombre: 'Adder' },
        { id: 2, nombre: 'Zentorno' },
        { id: 3, nombre: 'Banshee' },
    ]

    it('devuelve todos los vehículos si favoritos está desactivado', () => {
        // Arrange
        const favoritos = [1]

        // Act
        const resultado = filtrarVehiculosFavoritos(
        vehiculos,
        favoritos,
        false
        )

        // Assert
        expect(resultado).toEqual(vehiculos)
    })

    it('devuelve solamente los vehículos favoritos', () => {
        // Arrange
        const favoritos = [1, 3]

        // Act
        const resultado = filtrarVehiculosFavoritos(
        vehiculos,
        favoritos,
        true
        )

        // Assert
        expect(resultado.map((v) => v.nombre)).toEqual([
        'Adder',
        'Banshee',
        ])
    })
})

describe('cargarVehiculos', () => {
    it('usa el cliente HTTP con la URL correcta', async () => {
        // Arrange
        const clienteHttp = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue([]),
        })

        // Act
        await cargarVehiculos(
        'adder',
        'Legendary Motorsport',
        clienteHttp
        )

        // Assert
        expect(clienteHttp).toHaveBeenCalledTimes(1)

        expect(clienteHttp).toHaveBeenCalledWith(
        '/api/vehiculos?buscar=adder&concesionaria=Legendary+Motorsport'
        )
    })

    it('devuelve los vehículos entregados por la API', async () => {
        // Arrange
        const vehiculos = [
        { id: 1, nombre: 'Adder' },
        { id: 2, nombre: 'Zentorno' },
        ]

        const clienteHttp = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(vehiculos),
        })

        // Act
        const resultado = await cargarVehiculos(
        '',
        '',
        clienteHttp
        )

        // Assert
        expect(resultado).toEqual(vehiculos)
    })

    it('lanza un error cuando la API responde con error', async () => {
        // Arrange
        const clienteHttp = vi.fn().mockResolvedValue({
        ok: false,
        })

        // Act + Assert
        await expect(
        cargarVehiculos('', '', clienteHttp)
        ).rejects.toThrow(
        'No se pudieron cargar los vehículos.'
        )
    })
})