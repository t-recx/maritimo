using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Database.Lib.Migrations
{
    public partial class AddMagneticDeclination : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<float>(
                name: "magnetic_declination",
                table: "Objects",
                type: "real",
                nullable: true);

            migrationBuilder.AddColumn<float>(
                name: "magnetic_declination",
                table: "Messages",
                type: "real",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "magnetic_declination",
                table: "Objects");

            migrationBuilder.DropColumn(
                name: "magnetic_declination",
                table: "Messages");
        }
    }
}
