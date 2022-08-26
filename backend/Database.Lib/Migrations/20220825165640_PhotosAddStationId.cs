using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Database.Lib.Migrations
{
    public partial class PhotosAddStationId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<long>(
                name: "mmsi",
                table: "Photos",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddColumn<int>(
                name: "StationId",
                table: "Photos",
                type: "integer",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StationId",
                table: "Photos");

            migrationBuilder.AlterColumn<long>(
                name: "mmsi",
                table: "Photos",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);
        }
    }
}
