using System.ComponentModel.DataAnnotations;

namespace Database.Lib;

public class StationOperator
{
    [Key]
    public int station_operator_id { get; set; }
    public string name { get; set; } = default!;
    public string? homepage { get; set; }
    public List<Station> stations { get; set; } = default!;
}
