using LosSantosAutoMarket.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LosSantosAutoMarket.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Vehiculo> Vehiculos => Set<Vehiculo>();
}