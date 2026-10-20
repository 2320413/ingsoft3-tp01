using LosSantosAutoMarket.Api.Models;

namespace LosSantosAutoMarket.Api.Services;

public class VehiculoService
{
    private readonly IVehiculoRepository _repository;

    public VehiculoService(IVehiculoRepository repository)
    {
        _repository = repository;
    }

    public IQueryable<Vehiculo> Filtrar(
        string? categoria,
        string? concesionaria,
        string? buscar,
        decimal? precioMin,
        decimal? precioMax)
    {
        var query = _repository.ObtenerVehiculos();

        if (!string.IsNullOrWhiteSpace(categoria))
        {
            query = query.Where(v =>
                v.Categoria.ToLower() == categoria.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(concesionaria))
        {
            query = query.Where(v =>
                v.Concesionaria.ToLower() == concesionaria.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(buscar))
        {
            var texto = buscar.ToLower();

            query = query.Where(v =>
                v.Nombre.ToLower().Contains(texto) ||
                v.Marca.ToLower().Contains(texto));
        }

        if (precioMin.HasValue)
        {
            query = query.Where(v =>
                v.Precio >= precioMin.Value);
        }

        if (precioMax.HasValue)
        {
            query = query.Where(v =>
                v.Precio <= precioMax.Value);
        }

        return query.OrderBy(v => v.Precio);
    }
}