using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Database.Lib.Migrations
{
    public partial class StationTables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "StationId",
                table: "Objects",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StationId",
                table: "Messages",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "StationOperators",
                columns: table => new
                {
                    StationOperatorId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Homepage = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StationOperators", x => x.StationOperatorId);
                });

            migrationBuilder.CreateTable(
                name: "Stations",
                columns: table => new
                {
                    StationId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CountryCode = table.Column<string>(type: "text", nullable: false),
                    EquipmentDescription = table.Column<string>(type: "text", nullable: true),
                    SourceId = table.Column<string>(type: "text", nullable: true),
                    Latitude = table.Column<float>(type: "real", nullable: true),
                    Longitude = table.Column<float>(type: "real", nullable: true),
                    StationOperatorId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stations", x => x.StationId);
                    table.ForeignKey(
                        name: "FK_Stations_StationOperators_StationOperatorId",
                        column: x => x.StationOperatorId,
                        principalTable: "StationOperators",
                        principalColumn: "StationOperatorId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "StationAddresses",
                columns: table => new
                {
                    StationAddressId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SourceIpAddress = table.Column<string>(type: "text", nullable: false),
                    StationId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StationAddresses", x => x.StationAddressId);
                    table.ForeignKey(
                        name: "FK_StationAddresses_Stations_StationId",
                        column: x => x.StationId,
                        principalTable: "Stations",
                        principalColumn: "StationId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Objects_StationId",
                table: "Objects",
                column: "StationId");

            migrationBuilder.CreateIndex(
                name: "IX_Messages_StationId",
                table: "Messages",
                column: "StationId");

            migrationBuilder.CreateIndex(
                name: "IX_StationAddresses_StationId",
                table: "StationAddresses",
                column: "StationId");

            migrationBuilder.CreateIndex(
                name: "IX_Stations_StationOperatorId",
                table: "Stations",
                column: "StationOperatorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_Stations_StationId",
                table: "Messages",
                column: "StationId",
                principalTable: "Stations",
                principalColumn: "StationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Objects_Stations_StationId",
                table: "Objects",
                column: "StationId",
                principalTable: "Stations",
                principalColumn: "StationId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Messages_Stations_StationId",
                table: "Messages");

            migrationBuilder.DropForeignKey(
                name: "FK_Objects_Stations_StationId",
                table: "Objects");

            migrationBuilder.DropTable(
                name: "StationAddresses");

            migrationBuilder.DropTable(
                name: "Stations");

            migrationBuilder.DropTable(
                name: "StationOperators");

            migrationBuilder.DropIndex(
                name: "IX_Objects_StationId",
                table: "Objects");

            migrationBuilder.DropIndex(
                name: "IX_Messages_StationId",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "StationId",
                table: "Objects");

            migrationBuilder.DropColumn(
                name: "StationId",
                table: "Messages");
        }
    }
}
