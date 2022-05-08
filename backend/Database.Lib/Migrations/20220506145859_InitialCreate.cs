using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Database.Lib.Migrations
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Messages",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    message_type = table.Column<byte>(type: "smallint", nullable: false),
                    repeat_indicator = table.Column<byte>(type: "smallint", nullable: false),
                    mmsi = table.Column<long>(type: "bigint", nullable: false),
                    navigation_status = table.Column<byte>(type: "smallint", nullable: true),
                    rate_of_turn = table.Column<float>(type: "real", nullable: false),
                    speed_over_ground = table.Column<float>(type: "real", nullable: true),
                    position_accuracy = table.Column<bool>(type: "boolean", nullable: true),
                    longitude = table.Column<float>(type: "real", nullable: true),
                    latitude = table.Column<float>(type: "real", nullable: true),
                    course_over_ground = table.Column<float>(type: "real", nullable: true),
                    true_heading = table.Column<byte>(type: "smallint", nullable: true),
                    timestamp = table.Column<byte>(type: "smallint", nullable: true),
                    manuever_indicator = table.Column<byte>(type: "smallint", nullable: true),
                    raim_flag = table.Column<bool>(type: "boolean", nullable: true),
                    cs_unit = table.Column<bool>(type: "boolean", nullable: true),
                    display_flag = table.Column<bool>(type: "boolean", nullable: true),
                    dsc_flag = table.Column<bool>(type: "boolean", nullable: true),
                    band_flag = table.Column<bool>(type: "boolean", nullable: true),
                    message_22_flag = table.Column<bool>(type: "boolean", nullable: true),
                    assigned = table.Column<bool>(type: "boolean", nullable: true),
                    name = table.Column<string>(type: "text", nullable: true),
                    ship_type = table.Column<byte>(type: "smallint", nullable: true),
                    dimension_to_bow = table.Column<int>(type: "integer", nullable: true),
                    dimension_to_stern = table.Column<int>(type: "integer", nullable: true),
                    dimension_to_port = table.Column<byte>(type: "smallint", nullable: true),
                    dimension_to_starboard = table.Column<byte>(type: "smallint", nullable: true),
                    position_fix_type = table.Column<byte>(type: "smallint", nullable: true),
                    dte = table.Column<bool>(type: "boolean", nullable: true),
                    ais_version = table.Column<byte>(type: "smallint", nullable: true),
                    imo_number = table.Column<long>(type: "bigint", nullable: true),
                    call_sign = table.Column<string>(type: "text", nullable: true),
                    eta_month = table.Column<byte>(type: "smallint", nullable: true),
                    eta_day = table.Column<byte>(type: "smallint", nullable: true),
                    eta_hour = table.Column<byte>(type: "smallint", nullable: true),
                    eta_minute = table.Column<byte>(type: "smallint", nullable: true),
                    draught = table.Column<float>(type: "real", nullable: true),
                    destination = table.Column<string>(type: "text", nullable: true),
                    vendor_id = table.Column<string>(type: "text", nullable: true),
                    mothership_mmsi = table.Column<long>(type: "bigint", nullable: true),
                    utc_year = table.Column<int>(type: "integer", nullable: true),
                    utc_month = table.Column<byte>(type: "smallint", nullable: true),
                    utc_day = table.Column<byte>(type: "smallint", nullable: true),
                    utc_hour = table.Column<byte>(type: "smallint", nullable: true),
                    utc_minute = table.Column<byte>(type: "smallint", nullable: true),
                    utc_second = table.Column<byte>(type: "smallint", nullable: true),
                    aid_type = table.Column<byte>(type: "smallint", nullable: true),
                    off_position = table.Column<bool>(type: "boolean", nullable: true),
                    virtual_aid_flag = table.Column<bool>(type: "boolean", nullable: true),
                    gnss_position_status = table.Column<bool>(type: "boolean", nullable: true),
                    created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Messages", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Objects",
                columns: table => new
                {
                    mmsi = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    navigation_status = table.Column<byte>(type: "smallint", nullable: true),
                    rate_of_turn = table.Column<float>(type: "real", nullable: false),
                    speed_over_ground = table.Column<float>(type: "real", nullable: true),
                    position_accuracy = table.Column<bool>(type: "boolean", nullable: true),
                    longitude = table.Column<float>(type: "real", nullable: true),
                    latitude = table.Column<float>(type: "real", nullable: true),
                    course_over_ground = table.Column<float>(type: "real", nullable: true),
                    true_heading = table.Column<byte>(type: "smallint", nullable: true),
                    timestamp = table.Column<byte>(type: "smallint", nullable: true),
                    manuever_indicator = table.Column<byte>(type: "smallint", nullable: true),
                    raim_flag = table.Column<bool>(type: "boolean", nullable: true),
                    cs_unit = table.Column<bool>(type: "boolean", nullable: true),
                    display_flag = table.Column<bool>(type: "boolean", nullable: true),
                    dsc_flag = table.Column<bool>(type: "boolean", nullable: true),
                    band_flag = table.Column<bool>(type: "boolean", nullable: true),
                    message_22_flag = table.Column<bool>(type: "boolean", nullable: true),
                    assigned = table.Column<bool>(type: "boolean", nullable: true),
                    name = table.Column<string>(type: "text", nullable: true),
                    ship_type = table.Column<byte>(type: "smallint", nullable: true),
                    dimension_to_bow = table.Column<int>(type: "integer", nullable: true),
                    dimension_to_stern = table.Column<int>(type: "integer", nullable: true),
                    dimension_to_port = table.Column<byte>(type: "smallint", nullable: true),
                    dimension_to_starboard = table.Column<byte>(type: "smallint", nullable: true),
                    position_fix_type = table.Column<byte>(type: "smallint", nullable: true),
                    dte = table.Column<bool>(type: "boolean", nullable: true),
                    ais_version = table.Column<byte>(type: "smallint", nullable: true),
                    imo_number = table.Column<long>(type: "bigint", nullable: true),
                    call_sign = table.Column<string>(type: "text", nullable: true),
                    eta_month = table.Column<byte>(type: "smallint", nullable: true),
                    eta_day = table.Column<byte>(type: "smallint", nullable: true),
                    eta_hour = table.Column<byte>(type: "smallint", nullable: true),
                    eta_minute = table.Column<byte>(type: "smallint", nullable: true),
                    draught = table.Column<float>(type: "real", nullable: true),
                    destination = table.Column<string>(type: "text", nullable: true),
                    vendor_id = table.Column<string>(type: "text", nullable: true),
                    mothership_mmsi = table.Column<long>(type: "bigint", nullable: true),
                    utc_year = table.Column<int>(type: "integer", nullable: true),
                    utc_month = table.Column<byte>(type: "smallint", nullable: true),
                    utc_day = table.Column<byte>(type: "smallint", nullable: true),
                    utc_hour = table.Column<byte>(type: "smallint", nullable: true),
                    utc_minute = table.Column<byte>(type: "smallint", nullable: true),
                    utc_second = table.Column<byte>(type: "smallint", nullable: true),
                    aid_type = table.Column<byte>(type: "smallint", nullable: true),
                    off_position = table.Column<bool>(type: "boolean", nullable: true),
                    virtual_aid_flag = table.Column<bool>(type: "boolean", nullable: true),
                    gnss_position_status = table.Column<bool>(type: "boolean", nullable: true),
                    created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Objects", x => x.mmsi);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Messages");

            migrationBuilder.DropTable(
                name: "Objects");
        }
    }
}
