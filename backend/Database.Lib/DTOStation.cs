namespace Database.Lib;

public class DTOStation
{
    public int StationId { get; set; }
    public string Name { get; set; } = default!;
    public string CountryCode { get; set; } = default!;
    public string? EquipmentDescription { get; set; }
    public string? SourceId { get; set; }
    public float? Latitude { get; set; }
    public float? Longitude { get; set; }
    public int StationOperatorId { get; set; }
    public string StationOperatorName { get; set; } = default!;
    public string? StationOperatorHomepage { get; set; }
    public DateTime? LastMessageUpdated { get; set; }
    public string? Homepage { get; set; }
    public uint? MMSI { get; set; }
    public bool Online => LastMessageUpdated != null && DateTime.UtcNow - LastMessageUpdated < TimeSpan.FromHours(1);
}