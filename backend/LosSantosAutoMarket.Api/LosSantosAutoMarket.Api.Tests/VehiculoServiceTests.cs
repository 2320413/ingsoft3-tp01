using LosSantosAutoMarket.Api.Models;
using LosSantosAutoMarket.Api.Services;
using Moq;
using Xunit;

namespace LosSantosAutoMarket.Api.Tests;

public class VehiculoServiceTests
{
    private static List<Vehiculo> CrearVehiculos()
    {
        return new List<Vehiculo>
        {
            new()
            {
                Id = 1,
                Nombre = "Adder",
                Marca = "Truffade",
                Categoria = "Super",
                Concesionaria = "Legendary Motorsport",
                Precio = 1000000,
                ImagenUrl = "/adder.png",
                Disponible = true
            },
            new()
            {
                Id = 2,
                Nombre = "Zentorno",
                Marca = "Pegassi",
                Categoria = "Super",
                Concesionaria = "Legendary Motorsport",
                Precio = 725000,
                ImagenUrl = "/zentorno.png",
                Disponible = true
            },
            new()
            {
                Id = 3,
                Nombre = "Banshee",
                Marca = "Bravado",
                Categoria = "Sports",
                Concesionaria = "Southern San Andreas Super Autos",
                Precio = 90000,
                ImagenUrl = "/banshee.png",
                Disponible = true
            }
        };
    }

    private static VehiculoService CrearServicio(
        out Mock<IVehiculoRepository> repositoryMock)
    {
        repositoryMock = new Mock<IVehiculoRepository>();

        repositoryMock
            .Setup(r => r.ObtenerVehiculos())
            .Returns(CrearVehiculos().AsQueryable());

        return new VehiculoService(repositoryMock.Object);
    }

    [Theory]
    [InlineData("Super")]
    [InlineData("super")]
    [InlineData("SUPER")]
    public void Filtrar_CategoriaIgnoraMayusculas(string categoria)
    {
        // Arrange
        var servicio = CrearServicio(out _);

        // Act
        var resultado = servicio
            .Filtrar(categoria, null, null, null, null)
            .ToList();

        // Assert
        Assert.Equal(2, resultado.Count);
        Assert.All(resultado,
            v => Assert.Equal("Super", v.Categoria));
    }

    [Fact]
    public void Filtrar_ConcesionariaDevuelveSoloVehiculosCorrespondientes()
    {
        // Arrange
        var servicio = CrearServicio(out _);

        // Act
        var resultado = servicio
            .Filtrar(
                null,
                "legendary motorsport",
                null,
                null,
                null)
            .ToList();

        // Assert
        Assert.Equal(2, resultado.Count);
        Assert.All(resultado,
            v => Assert.Equal(
                "Legendary Motorsport",
                v.Concesionaria));
    }

    [Fact]
    public void Filtrar_BusquedaEncuentraVehiculoPorNombre()
    {
        // Arrange
        var servicio = CrearServicio(out _);

        // Act
        var resultado = servicio
            .Filtrar(null, null, "adder", null, null)
            .ToList();

        // Assert
        var vehiculo = Assert.Single(resultado);
        Assert.Equal("Adder", vehiculo.Nombre);
    }

    [Fact]
    public void Filtrar_BusquedaEncuentraVehiculoPorMarca()
    {
        // Arrange
        var servicio = CrearServicio(out _);

        // Act
        var resultado = servicio
            .Filtrar(null, null, "pegassi", null, null)
            .ToList();

        // Assert
        var vehiculo = Assert.Single(resultado);
        Assert.Equal("Zentorno", vehiculo.Nombre);
    }

    [Fact]
    public void Filtrar_PrecioMinimoIncluyeElValorLimite()
    {
        // Arrange
        var servicio = CrearServicio(out _);

        // Act
        var resultado = servicio
            .Filtrar(null, null, null, 725000, null)
            .ToList();

        // Assert
        Assert.Equal(2, resultado.Count);
        Assert.Contains(resultado, v => v.Nombre == "Zentorno");
        Assert.Contains(resultado, v => v.Nombre == "Adder");
    }

    [Fact]
    public void Filtrar_PrecioMaximoIncluyeElValorLimite()
    {
        // Arrange
        var servicio = CrearServicio(out _);

        // Act
        var resultado = servicio
            .Filtrar(null, null, null, null, 725000)
            .ToList();

        // Assert
        Assert.Equal(2, resultado.Count);
        Assert.Contains(resultado, v => v.Nombre == "Banshee");
        Assert.Contains(resultado, v => v.Nombre == "Zentorno");
    }

    [Fact]
    public void Filtrar_SinFiltrosOrdenaPorPrecioAscendente()
    {
        // Arrange
        var servicio = CrearServicio(out _);

        // Act
        var resultado = servicio
            .Filtrar(null, null, null, null, null)
            .ToList();

        // Assert
        Assert.Equal(
            new[] { "Banshee", "Zentorno", "Adder" },
            resultado.Select(v => v.Nombre));
    }

    [Fact]
    public void Filtrar_SolicitaLosVehiculosAlRepositorioUnaSolaVez()
    {
        // Arrange
        var servicio = CrearServicio(out var repositoryMock);

        // Act
        servicio
            .Filtrar(null, null, null, null, null)
            .ToList();

        // Assert
        repositoryMock.Verify(
            r => r.ObtenerVehiculos(),
            Times.Once);
    }
}