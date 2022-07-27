namespace Transmitter.App;

public class DTOTransmitterObjectData
{
    public uint mmsi { get; set; }

    public byte? navigation_status { get; set; }
    public float rate_of_turn { get; set; }
    public float? speed_over_ground { get; set; }
    public bool? position_accuracy { get; set; }
    public float? longitude { get; set; }
    public float? latitude { get; set; }
    public float? course_over_ground { get; set; }
    public int? true_heading { get; set; }
    public byte? timestamp { get; set; }
    public byte? manuever_indicator { get; set; }
    public bool? raim_flag { get; set; }
    public bool? cs_unit { get; set; }
    public bool? display_flag { get; set; }
    public bool? dsc_flag { get; set; }
    public bool? band_flag { get; set; }
    public bool? message_22_flag { get; set; }
    public bool? assigned { get; set; }
    public string? name { get; set; }
    public byte? ship_type { get; set; }
    public ushort? dimension_to_bow { get; set; }
    public ushort? dimension_to_stern { get; set; }
    public byte? dimension_to_port { get; set; }
    public byte? dimension_to_starboard { get; set; }
    public byte? position_fix_type { get; set; }
    public bool? dte { get; set; }
    public byte? ais_version { get; set; }
    public uint? imo_number { get; set; }
    public string? call_sign { get; set; }
    public byte? eta_month { get; set; }
    public byte? eta_day { get; set; }
    public byte? eta_hour { get; set; }
    public byte? eta_minute { get; set; }
    public float? draught { get; set; }
    public string? destination { get; set; }
    public string? vendor_id { get; set; }
    public uint? mothership_mmsi { get; set; }
    public ushort? utc_year { get; set; }
    public byte? utc_month { get; set; }
    public byte? utc_day { get; set; }
    public byte? utc_hour { get; set; }
    public byte? utc_minute { get; set; }
    public byte? utc_second { get; set; }
    public byte? aid_type { get; set; }
    public bool? off_position { get; set; }
    public bool? virtual_aid_flag { get; set; }
    public bool? gnss_position_status { get; set; }
    public float? magnetic_declination { get; set; }
    public string? source_id { get; set; }
    public string? source_ip_address { get; set; }
    public int? station_id { get; set; }
    public string? station_name { get; set; }
    public string? station_operator_name { get; set; }

    public TransmitterObjectType? object_type { get; set; }
    public int? country_code { get; set; }
    public DateTime updated { get; set; }
}
