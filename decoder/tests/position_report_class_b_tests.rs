use std::collections::HashMap;
extern crate decoder;
use decoder::error::NMEADecoderErrorType;
use decoder::MessageData;

#[test]
fn decode_when_message_size_incorrect_should_return_error() {
    let result = decoder::decode(
        "!AIVDM,1,1,,A,B6CdCm0t3`tba35f@V9faHi7kP0,0*58",
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
fn decode_should_decode_position_report_class_b() {
    let message = decoder::decode(
        "!AIVDM,1,1,,A,B6CdCm0t3`tba35f@V9faHi7kP06,0*58",
        &mut HashMap::new(),
        "",
    )
    .unwrap()
    .unwrap();

    assert_eq!(message.message_type, 18);
    assert_eq!(message.repeat_indicator, 0);
    assert_eq!(message.mmsi, 423302100);

    match message.data {
        MessageData::PositionReportClassB {
            speed_over_ground,
            position_accuracy,
            longitude,
            latitude,
            course_over_ground,
            true_heading,
            timestamp,
            cs_unit,
            raim_flag,
            dsc_flag,
            band_flag,
            message_22_flag,
            assigned,
            display_flag,
            magnetic_declination: _,
        } => {
            assert_eq!(speed_over_ground, Some(1.4));
            assert_eq!(position_accuracy, true);
            assert_eq!(longitude, Some(53.010998));
            assert_eq!(latitude, Some(40.005283));
            assert_eq!(course_over_ground, Some(177.0));
            assert_eq!(true_heading, Some(177));
            assert_eq!(timestamp, 34);
            assert_eq!(cs_unit, true);
            assert_eq!(display_flag, true);
            assert_eq!(dsc_flag, true);
            assert_eq!(band_flag, true);
            assert_eq!(message_22_flag, true);
            assert_eq!(assigned, false);
            assert_eq!(raim_flag, false);
        }
        _ => panic!(),
    };
}

#[test]
fn decode_should_decode_position_report_class_b2() {
    let message = decoder::decode(
        "!AIVDM,1,1,,A,B52K>;h00Fc>jpUlNV@ikwpUoP06,0*4C",
        &mut HashMap::new(),
        "",
    )
    .unwrap()
    .unwrap();

    assert_eq!(message.message_type, 18);
    assert_eq!(message.repeat_indicator, 0);
    assert_eq!(message.mmsi, 338087471);

    match message.data {
        MessageData::PositionReportClassB {
            speed_over_ground,
            position_accuracy,
            longitude,
            latitude,
            course_over_ground,
            true_heading,
            timestamp,
            cs_unit,
            raim_flag,
            dsc_flag,
            band_flag,
            message_22_flag,
            assigned,
            display_flag,
            magnetic_declination: _,
        } => {
            assert_eq!(speed_over_ground, Some(0.1));
            assert_eq!(position_accuracy, false);
            assert_eq!(longitude, Some(-74.072136));
            assert_eq!(latitude, Some(40.68454));
            assert_eq!(course_over_ground, Some(79.6));
            assert_eq!(true_heading, None);
            assert_eq!(timestamp, 49);
            assert_eq!(cs_unit, true);
            assert_eq!(display_flag, false);
            assert_eq!(dsc_flag, true);
            assert_eq!(band_flag, true);
            assert_eq!(message_22_flag, true);
            assert_eq!(assigned, false);
            assert_eq!(raim_flag, true);
        }
        _ => panic!(),
    };
}

#[test]
fn decode_should_decode_position_report_class_b3() {
    let message = decoder::decode(
        "!AIVDM,1,1,,A,B52KB8h006fu`Q6:g1McCwb5oP06,0*00",
        &mut HashMap::new(),
        "",
    )
    .unwrap()
    .unwrap();

    assert_eq!(message.message_type, 18);
    assert_eq!(message.repeat_indicator, 0);
    assert_eq!(message.mmsi, 338088483);

    match message.data {
        MessageData::PositionReportClassB {
            speed_over_ground,
            position_accuracy,
            longitude,
            latitude,
            course_over_ground,
            true_heading,
            timestamp,
            cs_unit,
            raim_flag,
            dsc_flag,
            band_flag,
            message_22_flag,
            assigned,
            display_flag,
            magnetic_declination: _,
        } => {
            assert_eq!(speed_over_ground, Some(0.0));
            assert_eq!(position_accuracy, false);
            assert_eq!(longitude, Some(-70.8112));
            assert_eq!(latitude, Some(43.11555833));
            assert_eq!(course_over_ground, Some(171.6));
            assert_eq!(true_heading, None);
            assert_eq!(timestamp, 20);
            assert_eq!(cs_unit, true);
            assert_eq!(display_flag, false);
            assert_eq!(dsc_flag, true);
            assert_eq!(band_flag, true);
            assert_eq!(message_22_flag, true);
            assert_eq!(assigned, false);
            assert_eq!(raim_flag, true);
        }
        _ => panic!(),
    };
}
