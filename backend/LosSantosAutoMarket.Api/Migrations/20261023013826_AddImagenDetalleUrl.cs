using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LosSantosAutoMarket.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddImagenDetalleUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImagenDetalleUrl",
                table: "Vehiculos",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImagenDetalleUrl",
                table: "Vehiculos");
        }
    }
}
