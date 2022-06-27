use std::collections::HashMap;
extern crate decoder;
use decoder::error::NMEADecoderErrorType;
use decoder::MessageData;

#[test]
fn decode_when_message_part_a_and_message_size_incorrect_should_return_error() {
    let result = decoder::decode(
        "!AIVDM,1,1,,A,H42O55i18tMET0000000000000,2*6D",
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
fn decode_when_message_part_b_and_message_size_incorrect_should_return_error() {
    let result = decoder::decode(
        "!AIVDM,1,1,,A,H42O55lti4hhhilD3nink000?05,0*40",
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
fn decode_should_decode_static_data_report_part_a() {
    let message = decoder::decode(
        "!AIVDM,1,1,,A,H42O55i18tMET00000000000000,2*6D",
        &mut HashMap::new(),
        "",
    )
    .unwrap()
    .unwrap();

    assert_eq!(message.message_type, 24);
    assert_eq!(message.repeat_indicator, 0);
    assert_eq!(message.mmsi, 271041815);

    match message.data {
        MessageData::StaticDataReportPartA { name } => {
            assert_eq!(name, "PROGUY");
        }
        _ => panic!(),
    };
}

#[test]
fn decode_should_decode_static_data_report_part_b() {
    let message = decoder::decode(
        "!AIVDM,1,1,,A,H42O55lti4hhhilD3nink000?050,0*40",
        &mut HashMap::new(),
        "",
    )
    .unwrap()
    .unwrap();

    assert_eq!(message.message_type, 24);
    assert_eq!(message.repeat_indicator, 0);
    assert_eq!(message.mmsi, 271041815);

    match message.data {
        MessageData::StaticDataReportPartBDimensions {
            ship_type,
            vendor_id,
            call_sign,
            dimension_to_bow,
            dimension_to_stern,
            dimension_to_port,
            dimension_to_starboard,
        } => {
            assert_eq!(ship_type, 60);
            assert_eq!(vendor_id, "1D00014");
            assert_eq!(call_sign, "TC6163");
            assert_eq!(dimension_to_bow, 0);
            assert_eq!(dimension_to_stern, 15);
            assert_eq!(dimension_to_port, 0);
            assert_eq!(dimension_to_starboard, 5);
        }
        _ => panic!(),
    };
}

// todo: find specimen of message of type 24, part B, auxiliary craft and test it here
