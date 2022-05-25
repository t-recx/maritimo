extern crate decoder;
use decoder::error::NMEADecoderErrorType;
use decoder::MessageData;

use crate::support::*;

pub mod support;

#[test]
fn decode_when_message_size_incorrect_should_return_error() {
    let result = decoder::decode(
        "!AIVDM,1,1,,B,177KQJ5000G?tO`K>RA1wUbN,0*5C",
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
fn decode_should_decode_position_report_class_a() {
    let message = decoder::decode(
        "!AIVDM,1,1,,B,177KQJ5000G?tO`K>RA1wUbN0TKH,0*5C",
        &mut get_redis_connection(),
        "",
    )
    .unwrap()
    .unwrap();

    assert_eq!(message.message_type, 1);
    assert_eq!(message.repeat_indicator, 0);
    assert_eq!(message.mmsi, 477553000);

    match message.data {
        MessageData::PositionReportClassA {
            navigation_status,
            rate_of_turn,
            speed_over_ground,
            position_accuracy,
            longitude,
            latitude,
            course_over_ground,
            true_heading,
            manuever_indicator,
            timestamp,
            raim_flag,
            magnetic_declination: _,
        } => {
            assert_eq!(navigation_status, 5);
            assert_eq!(rate_of_turn, 0.0);
            assert_eq!(speed_over_ground, Some(0.0));
            assert_eq!(position_accuracy, false);
            assert!((-122.34584..-122.34583).contains(&longitude.unwrap()));
            assert_eq!(latitude, Some(47.5828333));
            assert_eq!(course_over_ground, Some(51.0));
            assert_eq!(true_heading, Some(181));
            assert_eq!(manuever_indicator, None);
            assert_eq!(timestamp, 15);
            assert_eq!(raim_flag, false);
        }
        _ => panic!(),
    };
}

#[test]
fn decode_should_decode_position_report_class_a2() {
    let message = decoder::decode(
        "!AIVDM,1,1,,A,15RTgt0PAso;90TKcjM8h6g208CQ,0*4A",
        &mut get_redis_connection(),
        "",
    )
    .unwrap()
    .unwrap();

    assert_eq!(message.message_type, 1);
    assert_eq!(message.repeat_indicator, 0);
    assert_eq!(message.mmsi, 371798000);

    match message.data {
        MessageData::PositionReportClassA {
            navigation_status,
            rate_of_turn,
            speed_over_ground,
            position_accuracy,
            longitude,
            latitude,
            course_over_ground,
            true_heading,
            manuever_indicator,
            timestamp,
            raim_flag,
            magnetic_declination: _,
        } => {
            assert_eq!(navigation_status, 0);
            assert_eq!(rate_of_turn.round(), -720.0);
            assert_eq!(speed_over_ground, Some(12.3));
            assert_eq!(position_accuracy, true);
            assert_eq!(longitude, Some(-123.3953833));
            assert_eq!(latitude, Some(48.3816333));
            assert_eq!(course_over_ground, Some(224.0));
            assert_eq!(true_heading, Some(215));
            assert_eq!(manuever_indicator, None);
            assert_eq!(timestamp, 33);
            assert_eq!(raim_flag, false);
        }
        _ => panic!(),
    };
}

#[test]
fn decode_should_decode_position_report_class_a3() {
    let message = decoder::decode(
        "!AIVDM,1,1,,A,13u?etPv2;0n:dDPwUM1U1Cb069D,0*23",
        &mut get_redis_connection(),
        "",
    )
    .unwrap()
    .unwrap();

    assert_eq!(message.message_type, 1);
    assert_eq!(message.repeat_indicator, 0);
    assert_eq!(message.mmsi, 265547250);

    match message.data {
        MessageData::PositionReportClassA {
            navigation_status,
            rate_of_turn,
            speed_over_ground,
            position_accuracy,
            longitude,
            latitude,
            course_over_ground,
            true_heading,
            manuever_indicator,
            timestamp,
            raim_flag,
            magnetic_declination: _,
        } => {
            assert_eq!(navigation_status, 0);
            assert!((-2.9..-2.85).contains(&rate_of_turn));
            assert_eq!(speed_over_ground, Some(13.9));
            assert_eq!(position_accuracy, false);
            assert_eq!(longitude, Some(11.8329767));
            assert_eq!(latitude, Some(57.6603533));
            assert_eq!(course_over_ground, Some(40.4));
            assert_eq!(true_heading, Some(41));
            assert_eq!(manuever_indicator, None);
            assert_eq!(timestamp, 53);
            assert_eq!(raim_flag, false);
        }
        _ => panic!(),
    };
}
