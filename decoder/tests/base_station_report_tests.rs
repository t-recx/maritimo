use std::collections::HashMap;

extern crate decoder;
use decoder::error::NMEADecoderErrorType;
use decoder::MessageData;

#[test]
fn decode_when_message_size_incorrect_should_return_error() {
    let result = decoder::decode(
        "!AIVDM,1,1,,A,403OviQuMGCqWrRO9>E6fE700@G,0*4D",
        &mut HashMap::new(),
        "",
    )
    .unwrap_err();

    assert_eq!(
        result.error_type,
        NMEADecoderErrorType::IncorrectMessageSize
    );
}

#[test]
fn decode_should_decode_base_station_report() {
    let message = decoder::decode(
        "!AIVDM,1,1,,A,403OviQuMGCqWrRO9>E6fE700@GO,0*4D",
        &mut HashMap::new(),
        "",
    )
    .unwrap()
    .unwrap();

    assert_eq!(message.message_type, 4);
    assert_eq!(message.repeat_indicator, 0);
    assert_eq!(message.mmsi, 3669702);

    match message.data {
        MessageData::BaseStationReport {
            utc_year,
            utc_month,
            utc_day,
            utc_hour,
            utc_minute,
            utc_second,
            position_accuracy,
            longitude,
            latitude,
            raim_flag,
            position_fix_type,
            magnetic_declination: _,
        } => {
            assert_eq!(utc_year, Some(2007));
            assert_eq!(utc_month, Some(5));
            assert_eq!(utc_day, Some(14));
            assert_eq!(utc_hour, Some(19));
            assert_eq!(utc_minute, Some(57));
            assert_eq!(utc_second, Some(39));
            assert_eq!(longitude, Some(-76.35236));
            assert_eq!(latitude, Some(36.883766));
            assert_eq!(position_accuracy, true);
            assert_eq!(position_fix_type, 7);
            assert_eq!(raim_flag, false);
        }
        _ => panic!(),
    };
}
