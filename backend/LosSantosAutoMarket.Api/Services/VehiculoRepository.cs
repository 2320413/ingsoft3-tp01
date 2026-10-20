using LosSantosAutoMarket.Api.Data;
using LosSantosAutoMarket.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LosSantosAutoMarket.Api.Services;

public class VehiculoRepository : IVehiculoRepository
{
    private readonly AppDbContext _db;

    public VehiculoRepository(AppDbContext db)
    {
        _db = db;
    }

    public IQueryable<Vehiculo> ObtenerVehiculos()
    {
        return _db.Vehiculos.AsNoTracking();
    }
}