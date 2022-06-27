use std::collections::HashMap;

extern crate decoder;
use decoder::error::NMEADecoderErrorType;
use decoder::MessageData;

#[test]
fn decode_when_message_size_incorrect_should_return_error() {
    let result = decoder::decode(
        "!AIVDM,1,1,,B,E1mg=5J1T4h97aRh6ba84;W:Te=evH,0*46",
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
fn decode_should_decode_aid_to_navigation_report() {
    let mut acc = HashMap::new();

    decoder::decode(
        "!AIVDM,2,1,5,B,E1mg=5J1T4W0h97aRh6ba84<h2d;W:Te=eLvH50```q,0*46",
        &mut acc,
        "",
    )
    .unwrap();

    let message = decoder::decode("!AIVDM,2,2,5,B,:D44QDlp0C1DU00,2*36", &mut acc, "")
        .unwrap()
        .unwrap();

    assert_eq!(message.message_type, 21);
    assert_eq!(message.repeat_indicator, 0);
    assert_eq!(message.mmsi, 123456789);

    match message.data {
        MessageData::AidToNavigationReport {
            aid_type,
            name,
            position_accuracy,
            longitude,
            latitude,
            dimension_to_bow,
            dimension_to_stern,
            dimension_to_port,
            dimension_to_starboard,
            timestamp,
            raim_flag,
            off_position,
            virtual_aid_flag,
            assigned,
            magnetic_declination: _,
        } => {
            assert_eq!(aid_type, Some(20));
            assert_eq!(name, "CHINA ROSE MURPHY EXPRESS ALERT");
            assert_eq!(position_accuracy, false);
            assert_eq!(longitude, Some(-122.698586));
            assert_eq!(latitude, Some(47.9206183333));
            assert_eq!(dimension_to_bow, 5);
            assert_eq!(dimension_to_stern, 5);
            assert_eq!(dimension_to_port, 5);
            assert_eq!(dimension_to_starboard, 5);
            assert_eq!(timestamp, 50);
            assert_eq!(off_position, false);
            assert_eq!(raim_flag, false);
            assert_eq!(virtual_aid_flag, false);
            assert_eq!(assigned, false);
        }
        _ => panic!(),
    };
}
