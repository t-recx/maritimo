using System.ComponentModel.DataAnnotations;

namespace Database.Lib;

public class StationAddress
{
    [Key]
    public int station_address_id { get; set; }
    public string source_ip_address { get; set; } = default!;

    public int station_id { get; set; }
    public Station station { get; set; } = default!;
}