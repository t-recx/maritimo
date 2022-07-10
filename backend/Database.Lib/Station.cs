using System.ComponentModel.DataAnnotations;

namespace Database.Lib;

public class Station
{
    [Key]
    public int station_id { get; set; }
    public string name { get; set; } = default!;
    public string country_code { get; set; } = default!;
    public string? equipment_description { get; set; }
    public string? source_id { get; set; }
    public float? latitude { get; set; }
    public float? longitude { get; set; }
    public int station_operator_id { get; set; }
    public StationOperator station_operator { get; set; } = default!;
    public List<StationAddress> station_addresses { get; set; } = default!;

}