using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Database.Lib.Migrations
{
    public partial class StationAdditionalData : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "station_name",
                table: "Objects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "station_operator_name",
                table: "Objects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "station_name",
                table: "Messages",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "station_operator_name",
                table: "Messages",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "station_name",
                table: "Objects");

            migrationBuilder.DropColumn(
                name: "station_operator_name",
                table: "Objects");

            migrationBuilder.DropColumn(
                name: "station_name",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "station_operator_name",
                table: "Messages");
        }
    }
}
