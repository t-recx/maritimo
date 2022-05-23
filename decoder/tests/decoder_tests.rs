use std::collections::HashMap;

extern crate decoder;
use decoder::error::NMEADecoderErrorType;

#[test]
fn decode_when_no_checksum_present_should_return_error() {
    let err =
        decoder::decode("!AIVDM,1,1,,B,177KQJ5000G?tO`K>RA1", &mut HashMap::new()).unwrap_err();

    assert_eq!(err.error_type, NMEADecoderErrorType::CheckSumNotPresent);
}

#[test]
fn decode_when_fields_are_missing_should_return_error() {
    let err = decoder::decode(
        "!AIVDM,1,177KQJ5000G?tO`K>RA1wUbN0TKH,0*5C",
        &mut HashMap::new(),
    )
    .unwrap_err();

    assert_eq!(err.error_type, NMEADecoderErrorType::MissingFields);
}

#[test]
fn decode_when_fragment_count_field_is_of_incorrect_type_should_return_error() {
    assert_decode_when_field_is_of_incorrect_type_should_return_error(
        "!AIVDM,invalid,1,,B,177KQJ5000G?tO`K>RA1wUbN0TKH,0*5C",
    );
}

#[test]
fn decode_when_fragment_number_field_is_of_incorrect_type_should_return_error() {
    assert_decode_when_field_is_of_incorrect_type_should_return_error(
        "!AIVDM,1,invalid,,B,177KQJ5000G?tO`K>RA1wUbN0TKH,0*5C",
    );
}

#[test]
fn decode_when_fill_bits_field_is_of_incorrect_type_should_return_error() {
    assert_decode_when_field_is_of_incorrect_type_should_return_error(
        "!AIVDM,1,1,,B,177KQJ5000G?tO`K>RA1wUbN0TKH,invalid*5C",
    );
}

#[test]
fn decode_when_more_than_one_fragment_should_store_fragment_payload() {
    let mut h = HashMap::new();

    let result = decoder::decode(
        "!AIVDM,2,1,3,B,55P5TL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        &mut h,
    )
    .unwrap();

    assert!(result.is_none());
    assert_eq!(h[""][&3].len(), 1);
    assert_eq!(
        h[""][&3][0],
        "55P5TL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
}

#[test]
fn decode_when_more_than_one_fragment_but_no_message_id_should_return_error() {
    let err = decoder::decode(
        "!AIVDM,2,1,,B,55P5TL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        &mut HashMap::new(),
    )
    .unwrap_err();

    assert_eq!(err.error_type, NMEADecoderErrorType::MissingFields);
}

#[test]
fn decode_when_more_than_one_fragment_and_current_fragment_not_first_one_but_no_existing_key_for_message_id_should_return_error(
) {
    let err = decoder::decode(
        "!AIVDM,2,2,3,B,55P5TL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        &mut HashMap::new(),
    )
    .unwrap_err();

    assert_eq!(
        err.error_type,
        NMEADecoderErrorType::PreviousFragmentsNotPresentForMessageId
    );
}

#[test]
fn decode_when_more_than_one_fragment_and_message_contains_last_fragment_should_clean_accumulator()
{
    let mut h = HashMap::new();

    decoder::decode(
        "!AIVDM,3,1,3,B,55P5TL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        &mut h,
    )
    .unwrap();
    assert_eq!(h[""][&3].len(), 1);
    decoder::decode(
        "!AIVDM,3,2,3,B,55P5TL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        &mut h,
    )
    .unwrap();
    assert_eq!(h[""][&3].len(), 2);
    decoder::decode(
        "!AIVDM,3,3,3,B,55P5TL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        &mut h,
    )
    .unwrap();
    assert_eq!(h[""].contains_key(&3), false);
}

#[test]
fn decode_should_decode_basic_message_info() {
    let message = decoder::decode(
        "!AIVDM,1,1,,B,177KQJ5000G?tO`K>RA1wUbN0TKH,0*5C",
        &mut HashMap::new(),
    )
    .unwrap()
    .unwrap();

    assert_eq!(message.message_type, 1);
    assert_eq!(message.repeat_indicator, 0);
    assert_eq!(message.mmsi, 477553000);
    assert_eq!(message.source_id, None);
}

#[test]
fn decode_should_extract_source_id_when_present_testcase1() {
    let message = decoder::decode(
        "\\s:2573315,c:1653148247*05\\!AIVDM,1,1,,B,177KQJ5000G?tO`K>RA1wUbN0TKH,0*5C",
        &mut HashMap::new(),
    )
    .unwrap()
    .unwrap();

    assert_eq!(message.source_id.unwrap(), "2573315");
}

#[test]
fn decode_should_extract_source_id_when_present_testcase2() {
    let message = decoder::decode(
        "\\s:STX348i-93A*05\\!AIVDM,1,1,,B,177KQJ5000G?tO`K>RA1wUbN0TKH,0*5C",
        &mut HashMap::new(),
    )
    .unwrap()
    .unwrap();

    assert_eq!(message.source_id.unwrap(), "STX348i-93A");
}

#[test]
fn decode_should_extract_source_id_when_present_testcase3() {
    let message = decoder::decode(
        "\\c:3423423,s:S43209c,y:3432432*05\\!AIVDM,1,1,,B,177KQJ5000G?tO`K>RA1wUbN0TKH,0*5C",
        &mut HashMap::new(),
    )
    .unwrap()
    .unwrap();

    assert_eq!(message.source_id.unwrap(), "S43209c");
}

#[test]
fn decode_when_source_id_present_should_store_fragments_correctly() {
    let mut h = HashMap::new();

    decoder::decode(
        "\\s:STATIONONE*05\\!AIVDM,3,1,3,B,FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        &mut h,
    )
    .unwrap();
    assert_eq!(h["STATIONONE"].len(), 1);
    assert_eq!(h["STATIONONE"][&3].len(), 1);
    assert_eq!(
        h["STATIONONE"][&3][0],
        "FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    decoder::decode(
        "\\c:439843,s:STATIONTWO,y:34984398\\!AIVDM,3,1,3,B,SECOND01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        &mut h,
    )
    .unwrap();
    assert_eq!(h["STATIONONE"].len(), 1);
    assert_eq!(h["STATIONTWO"].len(), 1);
    assert_eq!(h["STATIONONE"][&3].len(), 1);
    assert_eq!(h["STATIONTWO"][&3].len(), 1);
    assert_eq!(
        h["STATIONTWO"][&3][0],
        "SECOND01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    decoder::decode(
        "\\c:439843,s:STATIONTWO,y:34984398\\!AIVDM,3,2,3,B,MORESECONDaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        &mut h,
    )
    .unwrap();
    assert_eq!(h["STATIONONE"].len(), 1);
    assert_eq!(h["STATIONTWO"].len(), 1);
    assert_eq!(h["STATIONTWO"][&3].len(), 2);
    assert_eq!(
        h["STATIONTWO"][&3][0],
        "SECOND01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    assert_eq!(
        h["STATIONTWO"][&3][1],
        "MORESECONDaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    decoder::decode(
        "\\s:STATIONONE*05\\!AIVDM,3,1,4,B,ANOTHERVIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        &mut h,
    )
    .unwrap();
    assert_eq!(h["STATIONONE"].len(), 2);
    assert_eq!(h["STATIONONE"][&3].len(), 1);
    assert_eq!(h["STATIONONE"][&4].len(), 1);
    assert_eq!(
        h["STATIONONE"][&3][0],
        "FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    assert_eq!(
        h["STATIONONE"][&4][0],
        "ANOTHERVIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    assert_eq!(h["STATIONTWO"].len(), 1);
    assert_eq!(h["STATIONTWO"][&3].len(), 2);
}

fn assert_decode_when_field_is_of_incorrect_type_should_return_error(input: &str) {
    let err = decoder::decode(input, &mut HashMap::new()).unwrap_err();

    assert_eq!(err.error_type, NMEADecoderErrorType::IncorrectFieldType);
}
