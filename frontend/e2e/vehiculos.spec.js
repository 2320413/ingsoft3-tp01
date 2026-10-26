import { expect, test } from '@playwright/test'

async function registrarUsuario(page) {
    const email = `e2e-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}@test.com`

    await page.goto('/')

    await page
        .getByRole('button', { name: 'Log In or Sign Up' })
        .click()

    await page
        .getByRole('button', {
        name: '¿No tenés cuenta? Crear cuenta',
        })
        .click()

    await page.getByLabel('Email').fill(email)

    await page
        .getByLabel('Contraseña')
        .fill('Password123!')

    await page
        .getByRole('button', {
        name: 'Crear cuenta',
        exact: true,
        })
        .click()

    await expect(
        page.getByRole('button', { name: 'Log Out' })
    ).toBeVisible()
    }


    async function publicarVehiculo(page, nombre) {
    await page
        .getByRole('button', { name: 'Sell With Us' })
        .click()

    await expect(
        page.getByRole('heading', {
        name: 'Publicar vehículo',
        })
    ).toBeVisible()

    await page
        .getByLabel('Nombre del vehículo')
        .fill(nombre)

    await page
        .getByLabel('Marca')
        .fill('Bravado')

    await page
        .getByLabel('Categoría')
        .fill('Sports')

    await page
        .getByLabel('Concesionaria')
        .fill('Particular')

    await page
        .getByLabel('Precio')
        .fill('123456')

    await page
        .getByRole('button', {
        name: 'Publicar vehículo',
        exact: true,
        })
        .click()

    await expect(
        page.getByRole('heading', {
        name: `Bravado ${nombre}`,
        })
    ).toBeVisible()
    }


    async function eliminarVehiculo(page, nombre) {
    await page
        .getByRole('button', {
        name: `Eliminar ${nombre}`,
        })
        .click()

    await expect(
        page.getByRole('heading', {
        name: 'Eliminar vehículo',
        })
    ).toBeVisible()

    await page
        .getByRole('button', {
        name: 'Sí, eliminar vehículo',
        })
        .click()

    await expect(
        page.getByRole('heading', {
        name: `Bravado ${nombre}`,
        })
    ).toHaveCount(0)
    }


    test(
    'un usuario puede publicar y eliminar su vehículo',
    async ({ page }) => {
        const nombre = `E2E-Auto-${Date.now()}`

        await registrarUsuario(page)

        await publicarVehiculo(page, nombre)

        await eliminarVehiculo(page, nombre)
    }
    )


    test(
    'no permite publicar un vehículo sin nombre',
    async ({ page }) => {
        await registrarUsuario(page)

        await expect(
            page.locator('.vehiculo-card').first()
        ).toBeVisible()

        const cantidadAntes =
        await page.locator('.vehiculo-card').count()

        await page
        .getByRole('button', {
            name: 'Sell With Us',
        })
        .click()

        await page
        .getByRole('button', {
            name: 'Publicar vehículo',
            exact: true,
        })
        .click()

        await expect(
        page.getByRole('alert')
        ).toHaveText(
        'El nombre es obligatorio.'
        )

        const cantidadDespues =
        await page.locator('.vehiculo-card').count()

        expect(cantidadDespues).toBe(cantidadAntes)
    }
)


test(
    'un usuario puede buscar un vehículo que publicó',
    async ({ page }) => {
        const nombre = `E2E-Busca-${Date.now()}`

        await registrarUsuario(page)

        await publicarVehiculo(page, nombre)

        await page
        .getByPlaceholder('Buscar autos...')
        .fill(nombre)

        await expect(
        page.getByRole('heading', {
            name: `Bravado ${nombre}`,
        })
        ).toBeVisible()

        await eliminarVehiculo(page, nombre)
    }
)