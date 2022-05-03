use std::collections::HashMap;

extern crate decoder;
use decoder::error::NMEADecoderErrorType;
use decoder::MessageData;

#[test]
fn decode_when_message_size_incorrect_should_return_error() {
    let mut acc = HashMap::new();

    decoder::decode(
        "!AIVDM,2,1,0,A,58wt8Ui`g??r21`7S=:22058<v05Htp000000015>8OA;0sk,0*7B",
        &mut acc,
    )
    .unwrap();
    let result =
        decoder::decode("!AIVDM,2,2,0,A,eQ8823mDm3kP000000000,2*5D", &mut acc).unwrap_err();

    assert_eq!(
        result.error_type,
        NMEADecoderErrorType::IncorrectMessageSize
    );
}

#[test]
fn decode_should_decode_static_and_voyage_data() {
    let mut acc = HashMap::new();

    decoder::decode(
        "!AIVDM,2,1,0,A,58wt8Ui`g??r21`7S=:22058<v05Htp000000015>8OA;0sk,0*7B",
        &mut acc,
    )
    .unwrap();
    let message = decoder::decode("!AIVDM,2,2,0,A,eQ8823mDm3kP00000000000,2*5D", &mut acc)
        .unwrap()
        .unwrap();

    assert_eq!(message.message_type, 5);
    assert_eq!(message.repeat_indicator, 0);
    assert_eq!(message.mmsi, 603916439);

    match message.data {
        MessageData::StaticAndVoyageData {
            ais_version,
            imo_number,
            call_sign,
            name,
            ship_type,
            dimension_to_bow,
            dimension_to_stern,
            dimension_to_port,
            dimension_to_starboard,
            position_fix_type,
            eta_month,
            eta_day,
            eta_hour,
            eta_minute,
            draught,
            destination,
            dte,
        } => {
            assert_eq!(ais_version, 0);
            assert_eq!(imo_number, 439303422);
            assert_eq!(call_sign, "ZA83R");
            assert_eq!(name, "ARCO AVON");
            assert_eq!(ship_type, 69);
            assert_eq!(dimension_to_bow, 113);
            assert_eq!(dimension_to_stern, 31);
            assert_eq!(dimension_to_port, 17);
            assert_eq!(dimension_to_starboard, 11);
            assert_eq!(position_fix_type, 0);
            assert_eq!(eta_month, Some(3));
            assert_eq!(eta_day, Some(23));
            assert_eq!(eta_hour, Some(19));
            assert_eq!(eta_minute, Some(45));
            assert_eq!(draught, 13.2);
            assert_eq!(destination, "HOUSTON");
            assert_eq!(dte, Some(false));
        }
        _ => panic!(),
    };
}

#[test]
fn decode_should_decode_static_and_voyage_data2() {
    let mut acc = HashMap::new();

    decoder::decode(
        "!AIVDM,2,1,3,B,55P5TL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        &mut acc,
    )
    .unwrap();
    let message = decoder::decode("!AIVDM,2,2,3,B,1@0000000000000,2*55", &mut acc)
        .unwrap()
        .unwrap();

    assert_eq!(message.message_type, 5);
    assert_eq!(message.repeat_indicator, 0);
    assert_eq!(message.mmsi, 369190000);

    match message.data {
        MessageData::StaticAndVoyageData {
            ais_version,
            imo_number,
            call_sign,
            name,
            ship_type,
            dimension_to_bow,
            dimension_to_stern,
            dimension_to_port,
            dimension_to_starboard,
            position_fix_type,
            eta_month,
            eta_day,
            eta_hour,
            eta_minute,
            draught,
            destination,
            dte,
        } => {
            assert_eq!(ais_version, 0);
            assert_eq!(imo_number, 6710932);
            assert_eq!(call_sign, "WDA9674");
            assert_eq!(name, "MT.MITCHELL");
            assert_eq!(ship_type, 99);
            assert_eq!(dimension_to_bow, 90);
            assert_eq!(dimension_to_stern, 90);
            assert_eq!(dimension_to_port, 10);
            assert_eq!(dimension_to_starboard, 10);
            assert_eq!(position_fix_type, 1);
            assert_eq!(eta_month, Some(1));
            assert_eq!(eta_day, Some(2));
            assert_eq!(eta_hour, Some(8));
            assert_eq!(eta_minute, Some(0));
            assert_eq!(draught, 6.0);
            assert_eq!(destination, "SEATTLE");
            assert_eq!(dte, Some(false));
        }
        _ => panic!(),
    };
}

#[test]
fn decode_when_message_is_slightly_truncated_should_still_decode_gracefully() {
    let mut acc = HashMap::new();

    decoder::decode(
        "!AIVDM,2,1,0,A,58wt8Ui`g??r21`7S=:22058<v05Htp000000015>8OA;0sk,0*7B",
        &mut acc,
    )
    .unwrap();
    let message = decoder::decode("!AIVDM,2,2,0,A,eQ8823mDm3kP0000000000,2*5D", &mut acc)
        .unwrap()
        .unwrap();

    assert_eq!(message.message_type, 5);
    assert_eq!(message.repeat_indicator, 0);
    assert_eq!(message.mmsi, 603916439);

    match message.data {
        MessageData::StaticAndVoyageData {
            ais_version,
            imo_number,
            call_sign,
            name,
            ship_type,
            dimension_to_bow,
            dimension_to_stern,
            dimension_to_port,
            dimension_to_starboard,
            position_fix_type,
            eta_month,
            eta_day,
            eta_hour,
            eta_minute,
            draught,
            destination,
            dte,
        } => {
            assert_eq!(ais_version, 0);
            assert_eq!(imo_number, 439303422);
            assert_eq!(call_sign, "ZA83R");
            assert_eq!(name, "ARCO AVON");
            assert_eq!(ship_type, 69);
            assert_eq!(dimension_to_bow, 113);
            assert_eq!(dimension_to_stern, 31);
            assert_eq!(dimension_to_port, 17);
            assert_eq!(dimension_to_starboard, 11);
            assert_eq!(position_fix_type, 0);
            assert_eq!(eta_month, Some(3));
            assert_eq!(eta_day, Some(23));
            assert_eq!(eta_hour, Some(19));
            assert_eq!(eta_minute, Some(45));
            assert_eq!(draught, 13.2);
            assert_eq!(destination, "HOUSTON");
            assert_eq!(dte, None);
        }
        _ => panic!(),
    };
}
