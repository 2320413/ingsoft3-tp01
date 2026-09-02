using LosSantosAutoMarket.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("Default")
    )
);

var app = builder.Build();

app.UseCors("Frontend");

app.MapGet("/health", () =>
{
    return Results.Ok(new { status = "ok" });
});

app.MapGet("/api/vehiculos", async (
    AppDbContext db,
    string? categoria,
    string? concesionaria,
    string? buscar,
    decimal? precioMin,
    decimal? precioMax) =>
{
    var query = db.Vehiculos.AsQueryable();

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
        query = query.Where(v => v.Precio >= precioMin.Value);
    }

    if (precioMax.HasValue)
    {
        query = query.Where(v => v.Precio <= precioMax.Value);
    }

    var vehiculos = await query
        .OrderBy(v => v.Precio)
        .ToListAsync();

    return Results.Ok(vehiculos);
});

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    await db.Database.MigrateAsync();
    
    if (!await db.Vehiculos.AnyAsync())
    {
        db.Vehiculos.AddRange(
            new LosSantosAutoMarket.Api.Models.Vehiculo
            {
                Nombre = "Adder",
                Marca = "Truffade",
                Categoria = "Super",
                Concesionaria = "Legendary Motorsport",
                Precio = 1000000,
                ImagenUrl = "/autos/Legendary Motorsports/Adder/Adder1.png",
                Disponible = true
            },
            new LosSantosAutoMarket.Api.Models.Vehiculo
            {
                Nombre = "Zentorno",
                Marca = "Pegassi",
                Categoria = "Super",
                Concesionaria = "Legendary Motorsport",
                Precio = 725000,
                ImagenUrl = "/autos/Legendary Motorsports/Zentorno/Zentorno1.png",
                Disponible = true
            },
            new LosSantosAutoMarket.Api.Models.Vehiculo
            {
                Nombre = "Banshee",
                Marca = "Bravado",
                Categoria = "Sports",
                Concesionaria = "Southern San Andreas Super Autos",
                Precio = 90000,
                ImagenUrl = "/autos/Southern San Andreas/Banshee/Banshee1.png",
                Disponible = true
            }
        );

        await db.SaveChangesAsync();
    }
}

app.Run();
