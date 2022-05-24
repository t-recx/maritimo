extern crate decoder;
use decoder::error::NMEADecoderErrorType;
use decoder::MessageData;

use crate::support::*;

pub mod support;

#[test]
fn decode_when_message_size_incorrect_should_return_error() {
    let result = decoder::decode(
        "!AIVDM,1,1,,B,C5N3SRgPEnJGEBT>NhWAwwo862PaLELTBJ:V00000000S0D:R22,0*0B",
        &mut get_redis_connection(),
        "",
    )
    .unwrap_err();

    assert_eq!(
        result.error_type,
        NMEADecoderErrorType::IncorrectMessageSize
    );
}

#[test]
fn decode_should_decode_extended_position_report_class_b() {
    let message = decoder::decode(
        "!AIVDM,1,1,,B,C5N3SRgPEnJGEBT>NhWAwwo862PaLELTBJ:V00000000S0D:R220,0*0B",
        &mut get_redis_connection(),
        "",
    )
    .unwrap()
    .unwrap();

    assert_eq!(message.message_type, 19);
    assert_eq!(message.repeat_indicator, 0);
    assert_eq!(message.mmsi, 367059850);

    match message.data {
        MessageData::ExtendedPositionReportClassB {
            speed_over_ground,
            position_accuracy,
            longitude,
            latitude,
            course_over_ground,
            true_heading,
            timestamp,
            name,
            ship_type,
            dimension_to_bow,
            dimension_to_stern,
            dimension_to_port,
            dimension_to_starboard,
            position_fix_type,
            raim_flag,
            dte,
            assigned,
            magnetic_declination: _,
        } => {
            assert_eq!(speed_over_ground, Some(8.7));
            assert_eq!(position_accuracy, false);
            assert_eq!(longitude, Some(-88.8103916667));
            assert_eq!(latitude, Some(29.543694));
            assert_eq!(course_over_ground, Some(335.9));
            assert_eq!(true_heading, None);
            assert_eq!(timestamp, 46);
            assert_eq!(name, "CAPT.J.RIMES");
            assert_eq!(ship_type, 70);
            assert_eq!(dimension_to_bow, 5);
            assert_eq!(dimension_to_stern, 21);
            assert_eq!(dimension_to_port, 4);
            assert_eq!(dimension_to_starboard, 4);
            assert_eq!(position_fix_type, 1);
            assert_eq!(raim_flag, false);
            assert_eq!(dte, false);
            assert_eq!(assigned, false);
        }
        _ => panic!(),
    };
}
