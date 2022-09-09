using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Database.Lib.Migrations
{
    public partial class StationAddFieldHomepage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Homepage",
                table: "Stations",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Homepage",
                table: "Stations");
        }
    }
}
