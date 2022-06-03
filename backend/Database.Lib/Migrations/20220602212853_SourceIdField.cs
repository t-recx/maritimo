using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Database.Lib.Migrations
{
    public partial class SourceIdField : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "source_id",
                table: "Objects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "source_id",
                table: "Messages",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "source_id",
                table: "Objects");

            migrationBuilder.DropColumn(
                name: "source_id",
                table: "Messages");
        }
    }
}
