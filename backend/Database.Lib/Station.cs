using System.ComponentModel.DataAnnotations;

namespace Database.Lib;

public class Station
{
    [Key]
    public int StationId { get; set; }
    public string Name { get; set; } = default!;
    public string CountryCode { get; set; } = default!;
    public string? EquipmentDescription { get; set; }
    public string? SourceId { get; set; }
    public float? Latitude { get; set; }
    public float? Longitude { get; set; }
    public int StationOperatorId { get; set; }
    public StationOperator StationOperator { get; set; } = default!;
    public List<StationAddress> StationAddresses { get; set; } = default!;

}