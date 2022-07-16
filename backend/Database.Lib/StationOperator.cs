using System.ComponentModel.DataAnnotations;

namespace Database.Lib;

public class StationOperator
{
    [Key]
    public int StationOperatorId { get; set; }
    public string Name { get; set; } = default!;
    public string? Homepage { get; set; }
    public List<Station> Stations { get; set; } = default!;
}
