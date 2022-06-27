use std::collections::HashMap;
extern crate decoder;
use decoder::error::NMEADecoderErrorType;
use decoder::MessageData;

#[test]
fn decode_when_message_size_incorrect_should_return_error() {
    let result = decoder::decode(
        "!AIVDM,1,1,,A,KCQ9r=hrFUnH7P0,0*41",
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
fn decode_should_decode_long_range_broadcast() {
    let message = decoder::decode(
        "!AIVDM,1,1,,A,KCQ9r=hrFUnH7P00,0*41",
        &mut HashMap::new(),
        "",
    )
    .unwrap()
    .unwrap();

    assert_eq!(message.message_type, 27);
    assert_eq!(message.repeat_indicator, 1);
    assert_eq!(message.mmsi, 236091959);

    match message.data {
        MessageData::LongRangeBroadcast {
            position_accuracy,
            raim_flag,
            navigation_status,
            longitude,
            latitude,
            speed_over_ground,
            course_over_ground,
            gnss_position_status: _,
            magnetic_declination: _,
        } => {
            assert_eq!(position_accuracy, false);
            assert_eq!(raim_flag, false);
            assert_eq!(navigation_status, 3);
            assert_eq!(longitude, Some(-154.20166));
            assert_eq!(latitude, Some(87.065));
            assert_eq!(speed_over_ground, Some(0.0));
            assert_eq!(course_over_ground, Some(0.0));
        }
        _ => panic!(),
    };
}

#[test]
fn decode_should_decode_full_slot_long_range_broadcast() {
    let message = decoder::decode(
        "!AIVDM,1,1,,B,KC5E2b@U19PFdLbMuc5=ROv62<7m,0*16",
        &mut HashMap::new(),
        "",
    )
    .unwrap()
    .unwrap();

    assert_eq!(message.message_type, 27);
    assert_eq!(message.repeat_indicator, 1);
    assert_eq!(message.mmsi, 206914217);

    match message.data {
        MessageData::LongRangeBroadcast {
            position_accuracy,
            raim_flag,
            navigation_status,
            longitude,
            latitude,
            speed_over_ground,
            course_over_ground,
            gnss_position_status: _,
            magnetic_declination: _,
        } => {
            assert_eq!(position_accuracy, false);
            assert_eq!(raim_flag, false);
            assert_eq!(navigation_status, 2);
            assert_eq!(longitude, Some(137.02333));
            assert_eq!(latitude, Some(4.84));
            assert_eq!(speed_over_ground, Some(57.0));
            assert_eq!(course_over_ground, Some(167.0));
        }
        _ => panic!(),
    };
}
