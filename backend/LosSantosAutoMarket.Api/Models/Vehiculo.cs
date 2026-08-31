namespace LosSantosAutoMarket.Api.Models;

public class Vehiculo
{
    public int Id { get; set; }

    public string Nombre { get; set; } = string.Empty;

    public string Marca { get; set; } = string.Empty;

    public string Categoria { get; set; } = string.Empty;

    public string Concesionaria { get; set; } = string.Empty;

    public decimal Precio { get; set; }

    public string ImagenUrl { get; set; } = string.Empty;

    public bool Disponible { get; set; } = true;
}