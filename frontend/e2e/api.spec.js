import { expect, test } from '@playwright/test'

const API = process.env.API_BASE_URL || 'http://localhost:8080'

async function listarVehiculos(request, query = '') {
    const respuesta = await request.get(
        `${API}/api/vehiculos${query}`
    )

    expect(respuesta.status()).toBe(200)

    return await respuesta.json()
    }

async function borrarVehiculo(request, id) {
    const respuesta = await request.delete(
        `${API}/api/vehiculos/${id}`
    )

    expect(respuesta.status()).toBe(204)
    }

async function limpiarVehiculo(request, id) {
    if (!id) {
        return
    }

    const respuesta = await request.delete(
        `${API}/api/vehiculos/${id}`
    )

    expect([204, 404]).toContain(respuesta.status())
}


test(
    'crear un vehículo lo guarda en la base y luego puede borrarse',
    async ({ request }) => {
        const nombre = `E2E-Integra-${Date.now()}`
        let idCreado = null

        const alta = await request.post(
        `${API}/api/vehiculos`,
        {
            data: {
            nombre,
            marca: 'Bravado',
            categoria: 'Sports',
            concesionaria:
                'Southern San Andreas Super Autos',
            precio: 123456,
            disponible: true,
            },
        }
        )

        expect(alta.status()).toBe(201)

        const creado = await alta.json()
        idCreado = creado.id

        try {
        const vehiculos =
            await listarVehiculos(request)

        expect(
            vehiculos.some(
            (vehiculo) =>
                vehiculo.nombre === nombre
            )
        ).toBe(true)

        await borrarVehiculo(
            request,
            creado.id
        )

        idCreado = null

        const despues =
            await listarVehiculos(request)

        expect(
            despues.some(
            (vehiculo) =>
                vehiculo.nombre === nombre
            )
        ).toBe(false)
        } finally {
        await limpiarVehiculo(
            request,
            idCreado
        )
        }
    }
)


test(
    'un vehículo sin nombre es rechazado y no se crea',
    async ({ request }) => {
        const antes = await listarVehiculos(request)

        const alta = await request.post(
            `${API}/api/vehiculos`,
            {
            data: {
                nombre: '',
                marca: 'Bravado',
                categoria: 'Sports',
                concesionaria:
                    'Southern San Andreas Super Autos',
                precio: 123456,
                disponible: true,
                },
            }
        )

        expect(alta.status()).toBe(400)

        const despues =
            await listarVehiculos(request)

        expect(despues.length).toBe(
            antes.length
            )
    }
)


test(
    'buscar un vehículo creado devuelve ese vehículo desde la base',
    async ({ request }) => {
        const nombre = `Busca-${Date.now()}`
        let idCreado = null

    const alta = await request.post(
        `${API}/api/vehiculos`,
        {
        data: {
            nombre,
            marca: 'Truffade',
            categoria: 'Super',
            concesionaria:
                'Legendary Motorsport',
            precio: 654321,
            disponible: true,
            },
        }
    )

    expect(alta.status()).toBe(201)

    const creado = await alta.json()
    idCreado = creado.id

    try {
        const encontrados =
            await listarVehiculos(
            request,
            `?buscar=${encodeURIComponent(nombre)}`
            )

        expect(encontrados).toHaveLength(1)
        expect(encontrados[0].nombre).toBe(
            nombre
        )

        await borrarVehiculo(
            request,
            creado.id
        )

        idCreado = null

        const despues =
            await listarVehiculos(
            request,
            `?buscar=${encodeURIComponent(nombre)}`
            )

        expect(despues).toHaveLength(0)
        } finally {
        await limpiarVehiculo(
            request,
            idCreado
        )
        }
    }
)