using LosSantosAutoMarket.Api.Data;
using Microsoft.EntityFrameworkCore;
using LosSantosAutoMarket.Api.Services;
using LosSantosAutoMarket.Api.Models;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseSentry(o =>
{
    o.Dsn = builder.Configuration["SENTRY_DSN"] ?? "";
    o.TracesSampleRate = 1.0;
});

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

builder.Services.AddScoped<IVehiculoRepository, VehiculoRepository>();
builder.Services.AddScoped<VehiculoService>();

var app = builder.Build();

app.UseCors("Frontend");

app.MapMethods("/health", new[] { "GET", "HEAD" }, () =>
{
    return Results.Ok(new { status = "ok" });
});

app.MapGet("/api/vehiculos", async (
    VehiculoService servicio,
    string? categoria,
    string? concesionaria,
    string? buscar,
    decimal? precioMin,
    decimal? precioMax) =>
{
    var vehiculos = await servicio
        .Filtrar(
            categoria,
            concesionaria,
            buscar,
            precioMin,
            precioMax)
        .ToListAsync();

    return Results.Ok(vehiculos);
});

app.MapPost("/api/vehiculos", async (
    Vehiculo vehiculo,
    AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(vehiculo.Nombre))
    {
        return Results.BadRequest(new
        {
            error = "El nombre es obligatorio"
        });
    }

    vehiculo.Id = 0;

    db.Vehiculos.Add(vehiculo);
    await db.SaveChangesAsync();

    return Results.Created(
        $"/api/vehiculos/{vehiculo.Id}",
        vehiculo
    );
});

app.MapDelete("/api/vehiculos/{id:int}", async (
    int id,
    AppDbContext db) =>
{
    var vehiculo = await db.Vehiculos.FindAsync(id);

    if (vehiculo is null)
    {
        return Results.NotFound();
    }

    db.Vehiculos.Remove(vehiculo);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.MapGet("/api/falla", string () =>
    throw new InvalidOperationException("Falla de prueba del TP9"));

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
