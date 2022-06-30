use std::collections::HashMap;
extern crate decoder;
use decoder::error::NMEADecoderErrorType;

use crate::support::*;

pub mod support;

#[test]
fn decode_when_no_checksum_present_should_return_error() {
    let err = decoder::decode(
        "!AIVDM,1,1,,B,177KQJ5000G?tO`K>RA1",
        &mut HashMap::new(),
        "",
    )
    .unwrap_err();

    assert_eq!(err.error_type, NMEADecoderErrorType::CheckSumNotPresent);
}

#[test]
fn decode_when_no_payload_present_should_return_error() {
    let err = decoder::decode("!AIVDM,1,1,,A,,0*26", &mut HashMap::new(), "").unwrap_err();

    assert_eq!(err.error_type, NMEADecoderErrorType::MissingFields);
}

#[test]
fn decode_when_fields_are_missing_should_return_error() {
    let err = decoder::decode(
        "!AIVDM,1,177KQJ5000G?tO`K>RA1wUbN0TKH,0*5C",
        &mut HashMap::new(),
        "",
    )
    .unwrap_err();

    assert_eq!(err.error_type, NMEADecoderErrorType::MissingFields);
}

#[test]
fn decode_when_fields_are_missing_should_return_error_testcase2() {
    let err = decoder::decode("!AIVDM,1,1,,,,0*26", &mut HashMap::new(), "").unwrap_err();

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
    let acc = &mut HashMap::new();
    let result = decoder::decode(
        "!AIVDM,2,1,3,B,55P5TL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        acc,
        "test",
    )
    .unwrap();

    assert!(result.is_none());
    assert_eq!(
        acc["test::3"][&1],
        "55P5TL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
}

#[test]
fn decode_when_more_than_one_fragment_but_no_message_id_should_return_error() {
    let err = decoder::decode(
        "!AIVDM,2,1,,B,55P5TL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        &mut HashMap::new(),
        "",
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
        "",
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
    let acc = &mut HashMap::new();

    decoder::decode(
        "!AIVDM,3,1,3,B,55P5TL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        acc,
        "",
    )
    .unwrap();
    assert_eq!(
        get_payload(&acc["3"]),
        "55P5TL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    decoder::decode(
        "!AIVDM,3,2,3,B,34444444444444444444444444444444444444444444444444444445,0*3E",
        acc,
        "",
    )
    .unwrap();
    assert_eq!(
        get_payload(&acc["3"]),
 "55P5TL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E5334444444444444444444444444444444444444444444444444444445");
    decoder::decode(
        "!AIVDM,3,3,3,B,55P5TL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        acc,
        "",
    )
    .unwrap();
    assert_eq!(get_payload(&acc["3"]), "");
}

#[test]
fn decode_should_decode_basic_message_info() {
    let message = decoder::decode(
        "!AIVDM,1,1,,B,177KQJ5000G?tO`K>RA1wUbN0TKH,0*5C",
        &mut HashMap::new(),
        "",
    )
    .unwrap()
    .unwrap();

    assert_eq!(message.message_type, 1);
    assert_eq!(message.repeat_indicator, 0);
    assert_eq!(message.mmsi, 477553000);
    assert_eq!(message.source_id, None);
    assert_eq!(message.source_ip_address, None);
}

#[test]
fn decode_should_extract_source_ip_address_when_present_testcase1() {
    let message = decoder::decode(
        "[2001:0db8:85a3:0000:0000:8a2e:0370:7334]!AIVDM,1,1,,B,177KQJ5000G?tO`K>RA1wUbN0TKH,0*5C",
        &mut HashMap::new(),
        "",
    )
    .unwrap()
    .unwrap();

    assert_eq!(message.source_id, None);
    assert_eq!(
        message.source_ip_address.unwrap(),
        "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
    );
}

#[test]
fn decode_should_extract_source_ip_address_when_present_testcase2() {
    let message = decoder::decode(
        "[90.20.1.44]\\s:2573315,c:1653148247*05\\!AIVDM,1,1,,B,177KQJ5000G?tO`K>RA1wUbN0TKH,0*5C",
        &mut HashMap::new(),
        "",
    )
    .unwrap()
    .unwrap();

    assert_eq!(message.source_id.unwrap(), "2573315");
    assert_eq!(message.source_ip_address.unwrap(), "90.20.1.44");
}

#[test]
fn decode_should_extract_source_ip_address_when_present_testcase3() {
    let message = decoder::decode(
        "[]\\s:2573315,c:1653148247*05\\!AIVDM,1,1,,B,177KQJ5000G?tO`K>RA1wUbN0TKH,0*5C",
        &mut HashMap::new(),
        "",
    )
    .unwrap()
    .unwrap();

    assert_eq!(message.source_id.unwrap(), "2573315");
    assert_eq!(message.source_ip_address, None);
}

#[test]
fn decode_should_extract_source_id_when_present_testcase1() {
    let message = decoder::decode(
        "\\s:2573315,c:1653148247*05\\!AIVDM,1,1,,B,177KQJ5000G?tO`K>RA1wUbN0TKH,0*5C",
        &mut HashMap::new(),
        "",
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
        "",
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
        "",
    )
    .unwrap()
    .unwrap();

    assert_eq!(message.source_id.unwrap(), "S43209c");
}

#[test]
fn decode_should_store_fragments_correctly() {
    let acc = &mut HashMap::new();

    decoder::decode(
        "!AIVDM,3,1,3,B,FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        acc,
        "",
    )
    .unwrap();
    assert_eq!(
        get_payload(&acc["3"]),
        "FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );

    decoder::decode("!AIVDM,3,2,3,B,SECOND<PDhh00000000143984329,0*3E", acc, "").unwrap();
    assert_eq!(
        get_payload(&acc["3"]),
        "FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53SECOND<PDhh00000000143984329"
    );
}

#[test]
fn decode_when_stream_id_present_should_store_fragments_correctly() {
    let acc = &mut HashMap::new();

    decoder::decode(
        "!AIVDM,3,1,3,B,FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        acc,
        "test_stream",
    )
    .unwrap();
    assert_eq!(
        get_payload(&acc["test_stream::3"]),
        "FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );

    decoder::decode(
        "!AIVDM,3,2,3,B,SECOND<PDhh00000000143984329,0*3E",
        acc,
        "test_stream",
    )
    .unwrap();
    assert_eq!(
        get_payload(&acc["test_stream::3"]),
        "FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53SECOND<PDhh00000000143984329"
    );
}

#[test]
fn decode_when_source_id_present_should_store_fragments_correctly() {
    let acc = &mut HashMap::new();

    decoder::decode(
        "\\s:STATIONONE*05\\!AIVDM,3,1,3,B,FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        acc,
        "",
    )
    .unwrap();
    assert_eq!(
        get_payload(&acc["STATIONONE::3"]),
        "FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    decoder::decode(
        "\\c:439843,s:STATIONTWO,y:34984398\\!AIVDM,3,1,3,B,SECOND01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        acc,
        ""
    )
    .unwrap();
    assert_eq!(
        get_payload(&acc["STATIONONE::3"]),
        "FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    assert_eq!(
        get_payload(&acc["STATIONTWO::3"]),
        "SECOND01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    decoder::decode(
        "\\c:439843,s:STATIONTWO,y:34984398\\!AIVDM,3,2,3,B,MORESECONDaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        acc,
        ""
    )
    .unwrap();
    assert_eq!(
        get_payload(&acc["STATIONONE::3"]),
        "FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    assert_eq!(
        get_payload(&acc["STATIONTWO::3"]), "SECOND01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53MORESECONDaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53");
    decoder::decode(
        "\\s:STATIONONE*05\\!AIVDM,3,1,4,B,ANOTHERVIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        acc,
        "",
    )
    .unwrap();
    assert_eq!(
        get_payload(&acc["STATIONONE::3"]),
        "FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    assert_eq!(
        get_payload(&acc["STATIONONE::4"]),
        "ANOTHERVIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    assert_eq!(get_payload(&acc["STATIONTWO::3"]), "SECOND01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53MORESECONDaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53");
}

#[test]
fn decode_when_source_id_present_and_when_stream_id_present_should_store_fragments_correctly() {
    let acc = &mut HashMap::new();
    let stream_id = "test_stream";

    decoder::decode(
        "\\s:STATIONONE*05\\!AIVDM,3,1,3,B,FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        acc,
        stream_id,
    )
    .unwrap();
    assert_eq!(
        get_payload(&acc["test_stream::STATIONONE::3"]),
        "FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    decoder::decode(
        "\\c:439843,s:STATIONTWO,y:34984398\\!AIVDM,3,1,3,B,SECOND01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        acc,
        stream_id,
    )
    .unwrap();
    assert_eq!(
        get_payload(&acc["test_stream::STATIONONE::3"]),
        "FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    assert_eq!(
        get_payload(&acc["test_stream::STATIONTWO::3"]),
        "SECOND01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    decoder::decode(
        "\\c:439843,s:STATIONTWO,y:34984398\\!AIVDM,3,2,3,B,MORESECONDaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        acc,
        stream_id,
    )
    .unwrap();
    assert_eq!(
        get_payload(&acc["test_stream::STATIONONE::3"]),
        "FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    assert_eq!(get_payload(&acc["test_stream::STATIONTWO::3"]), "SECOND01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53MORESECONDaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53");
    decoder::decode(
        "\\s:STATIONONE*05\\!AIVDM,3,1,4,B,ANOTHERVIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        acc,
        stream_id,
    )
    .unwrap();
    assert_eq!(
        get_payload(&acc["test_stream::STATIONONE::3"]),
        "FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    assert_eq!(
        get_payload(&acc["test_stream::STATIONONE::4"]),
        "ANOTHERVIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    assert_eq!(get_payload(&acc["test_stream::STATIONTWO::3"]), "SECOND01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53MORESECONDaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53");
}

#[test]
fn decode_when_source_id_present_and_when_stream_id_present_and_when_source_ip_address_present_should_store_fragments_correctly(
) {
    let acc = &mut HashMap::new();
    let stream_id = "test_stream";

    decoder::decode(
        "[140.2.44.1]\\s:STATIONONE*05\\!AIVDM,3,1,3,B,FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        acc,
        stream_id,
    )
    .unwrap();
    assert_eq!(
        get_payload(&acc["test_stream::140.2.44.1::STATIONONE::3"]),
        "FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    decoder::decode(
        "[140.2.44.1]\\c:439843,s:STATIONTWO,y:34984398\\!AIVDM,3,1,3,B,SECOND01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        acc,
        stream_id,
    )
    .unwrap();
    assert_eq!(
        get_payload(&acc["test_stream::140.2.44.1::STATIONONE::3"]),
        "FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    assert_eq!(
        get_payload(&acc["test_stream::140.2.44.1::STATIONTWO::3"]),
        "SECOND01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    decoder::decode(
        "[140.2.44.1]\\c:439843,s:STATIONTWO,y:34984398\\!AIVDM,3,2,3,B,MORESECONDaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        acc,
        stream_id,
    )
    .unwrap();
    assert_eq!(
        get_payload(&acc["test_stream::140.2.44.1::STATIONONE::3"]),
        "FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    assert_eq!(
        get_payload(&acc["test_stream::140.2.44.1::STATIONTWO::3"]),
"SECOND01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53MORESECONDaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53");
    decoder::decode(
        "[140.2.44.1]\\s:STATIONONE*05\\!AIVDM,3,1,4,B,ANOTHERVIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        acc,
        stream_id,
    )
    .unwrap();
    assert_eq!(
        get_payload(&acc["test_stream::140.2.44.1::STATIONONE::3"]),
        "FIRSTL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    assert_eq!(
        get_payload(&acc["test_stream::140.2.44.1::STATIONONE::4"]),
        "ANOTHERVIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53"
    );
    assert_eq!(
        get_payload(&acc["test_stream::140.2.44.1::STATIONTWO::3"]),
 "SECOND01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53MORESECONDaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53");
}

#[test]
fn decode_when_message_is_in_an_incorrect_format_should_return_error() {
    let err = decoder::decode(
        "VDM,2,2,3,B,55P5TL01VIaAL@7WKO@mBplU@<PDhh000000001S;AJ::4A80?4i@E53,0*3E",
        &mut HashMap::new(),
        "",
    )
    .unwrap_err();

    assert_eq!(err.error_type, NMEADecoderErrorType::IncorrectMessageFormat);
}

#[test]
fn decode_when_message_is_in_an_incorrect_format_should_return_error_testcase2() {
    let err =
        decoder::decode("$AITXT,01,01,91,FREQ,2087,2088*57", &mut HashMap::new(), "").unwrap_err();

    assert_eq!(err.error_type, NMEADecoderErrorType::IncorrectMessageFormat);
}

#[test]
fn decode_when_message_has_an_incorrect_message_size_should_return_error() {
    let err = decoder::decode("!AIVDM,1,1,,B,15H8,0*17", &mut HashMap::new(), "").unwrap_err();

    assert_eq!(err.error_type, NMEADecoderErrorType::IncorrectMessageSize);
}

fn assert_decode_when_field_is_of_incorrect_type_should_return_error(input: &str) {
    let err = decoder::decode(input, &mut HashMap::new(), "").unwrap_err();

    assert_eq!(err.error_type, NMEADecoderErrorType::IncorrectFieldType);
}
