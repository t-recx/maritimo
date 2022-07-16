using System.ComponentModel.DataAnnotations;

namespace Database.Lib;

public class StationAddress
{
    [Key]
    public int StationAddressId { get; set; }
    public string SourceIpAddress { get; set; } = default!;

    public int StationId { get; set; }
    public Station Station { get; set; } = default!;
}