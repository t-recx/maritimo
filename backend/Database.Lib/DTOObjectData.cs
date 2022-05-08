namespace Database.Lib;

public class DTOObjectData
{
    public uint mmsi;

    public byte? navigation_status;
    public float rate_of_turn;
    public float? speed_over_ground;
    public bool? position_accuracy;
    public float? longitude;
    public float? latitude;
    public float? course_over_ground;
    public byte? true_heading;
    public byte? timestamp;
    public byte? manuever_indicator;
    public bool? raim_flag;
    public bool? cs_unit;
    public bool? display_flag;
    public bool? dsc_flag;
    public bool? band_flag;
    public bool? message_22_flag;
    public bool? assigned;
    public string? name;
    public byte? ship_type;
    public ushort? dimension_to_bow;
    public ushort? dimension_to_stern;
    public byte? dimension_to_port;
    public byte? dimension_to_starboard;
    public byte? position_fix_type;
    public bool? dte;
    public byte? ais_version;
    public uint? imo_number;
    public string? call_sign;
    public byte? eta_month;
    public byte? eta_day;
    public byte? eta_hour;
    public byte? eta_minute;
    public float? draught;
    public string? destination;
    public string? vendor_id;
    public uint? mothership_mmsi;
    public ushort? utc_year;
    public byte? utc_month;
    public byte? utc_day;
    public byte? utc_hour;
    public byte? utc_minute;
    public byte? utc_second;
    public byte? aid_type;
    public bool? off_position;
    public bool? virtual_aid_flag;
    public bool? gnss_position_status;
}

