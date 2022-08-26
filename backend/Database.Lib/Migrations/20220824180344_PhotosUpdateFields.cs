using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Database.Lib.Migrations
{
    public partial class PhotosUpdateFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Photos",
                newName: "FilenameThumbnail");

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Photos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Filename",
                table: "Photos",
                type: "text",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Photos");

            migrationBuilder.DropColumn(
                name: "Filename",
                table: "Photos");

            migrationBuilder.RenameColumn(
                name: "FilenameThumbnail",
                table: "Photos",
                newName: "Name");
        }
    }
}
