using LosSantosAutoMarket.Api.Models;

namespace LosSantosAutoMarket.Api.Services;

public interface IVehiculoRepository
{
    IQueryable<Vehiculo> ObtenerVehiculos();
}