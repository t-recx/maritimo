namespace Database.Lib;

public class DTOPhoto
{
    public long PhotoId { get; set; }
    public uint? mmsi { get; set; }
    public int? StationId { get; set; }
    public string? Description { get; set; }
    public string? Author { get; set; }
    public string? Homepage { get; set; }
    public string? Filename { get; set; }
    public string? FilenameThumbnail { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
}
