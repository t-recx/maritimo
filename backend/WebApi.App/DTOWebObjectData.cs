namespace WebApi.App;

public class DTOWebObjectData
{
    public uint mmsi { get; set; }

    public byte? navigation_status { get; set; }
    public float? speed_over_ground { get; set; }
    public float? longitude { get; set; }
    public float? latitude { get; set; }
    public float? course_over_ground { get; set; }
    public int? true_heading { get; set; }
    public string? name { get; set; }
    public byte? ship_type { get; set; }
    public ushort? dimension_to_bow { get; set; }
    public ushort? dimension_to_stern { get; set; }
    public byte? dimension_to_port { get; set; }
    public byte? dimension_to_starboard { get; set; }
    public uint? imo_number { get; set; }
    public string? call_sign { get; set; }
    public float? draught { get; set; }
    public string? destination { get; set; }
    public uint? mothership_mmsi { get; set; }
    public byte? aid_type { get; set; }
    public int? station_id { get; set; }
    public string? station_name { get; set; }

    public DateTime updated { get; set; }
    public WebObjectType? object_type { get; set; }
    public int? country_code { get; set; }
}
