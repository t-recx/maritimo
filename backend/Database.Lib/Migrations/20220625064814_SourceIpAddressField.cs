using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Database.Lib.Migrations
{
    public partial class SourceIpAddressField : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "source_ip_address",
                table: "Objects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "source_ip_address",
                table: "Messages",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "source_ip_address",
                table: "Objects");

            migrationBuilder.DropColumn(
                name: "source_ip_address",
                table: "Messages");
        }
    }
}
