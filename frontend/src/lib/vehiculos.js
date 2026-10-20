export function construirUrlVehiculos(buscar = '', concesionaria = '') {
    const params = new URLSearchParams()

    if (buscar) {
        params.append('buscar', buscar)
    }

    if (concesionaria) {
        params.append('concesionaria', concesionaria)
    }

    return `/api/vehiculos?${params.toString()}`
    }

    export function filtrarVehiculosFavoritos(
    vehiculos,
    favoritos,
    mostrarFavoritos
    ) {
    if (!mostrarFavoritos) {
        return vehiculos
    }

    return vehiculos.filter((vehiculo) =>
        favoritos.includes(vehiculo.id)
    )
    }

    export async function cargarVehiculos(
    buscar,
    concesionaria,
    clienteHttp = fetch
    ) {
    const url = construirUrlVehiculos(buscar, concesionaria)

    const response = await clienteHttp(url)

    if (!response.ok) {
        throw new Error('No se pudieron cargar los vehículos.')
    }

    return response.json()
}