using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Database.Lib.Migrations
{
    public partial class AddIndexObjectTypeFieldOnObjects : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Objects_object_type",
                table: "Objects",
                column: "object_type");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Objects_object_type",
                table: "Objects");
        }
    }
}
