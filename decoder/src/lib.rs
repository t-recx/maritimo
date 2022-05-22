#[macro_use]
extern crate lazy_static;

use regex::Regex;
use serde::Serialize;
use std::collections::HashMap;

mod conversions;
mod decoders;
pub mod error;
mod magnetic_declination;
mod nmea;

use conversions::*;
use decoders::*;
use error::*;

#[derive(Debug, Serialize, PartialEq)]
#[serde(untagged)]
pub enum MessageData {
    PositionReportClassA {
        navigation_status: u8,
        rate_of_turn: f32,
        speed_over_ground: Option<f32>,
        position_accuracy: bool,
        longitude: Option<f32>,
        latitude: Option<f32>,
        course_over_ground: Option<f32>,
        true_heading: Option<u8>,
        timestamp: u8,
        manuever_indicator: Option<u8>,
        raim_flag: bool,
        magnetic_declination: Option<f32>,
    },
    PositionReportClassB {
        speed_over_ground: Option<f32>,
        position_accuracy: bool,
        longitude: Option<f32>,
        latitude: Option<f32>,
        course_over_ground: Option<f32>,
        true_heading: Option<u8>,
        timestamp: u8,
        cs_unit: bool,
        display_flag: bool,
        dsc_flag: bool,
        band_flag: bool,
        message_22_flag: bool,
        assigned: bool,
        raim_flag: bool,
        magnetic_declination: Option<f32>,
    },
    ExtendedPositionReportClassB {
        speed_over_ground: Option<f32>,
        position_accuracy: bool,
        longitude: Option<f32>,
        latitude: Option<f32>,
        course_over_ground: Option<f32>,
        true_heading: Option<u8>,
        timestamp: u8,
        name: String,
        ship_type: u8,
        dimension_to_bow: u16,
        dimension_to_stern: u16,
        dimension_to_port: u8,
        dimension_to_starboard: u8,
        position_fix_type: u8,
        raim_flag: bool,
        dte: bool,
        assigned: bool,
        magnetic_declination: Option<f32>,
    },
    StaticAndVoyageData {
        ais_version: u8,
        imo_number: u32,
        call_sign: String,
        name: String,
        ship_type: u8,
        dimension_to_bow: u16,
        dimension_to_stern: u16,
        dimension_to_port: u8,
        dimension_to_starboard: u8,
        position_fix_type: u8,
        eta_month: Option<u8>,
        eta_day: Option<u8>,
        eta_hour: Option<u8>,
        eta_minute: Option<u8>,
        draught: f32,
        destination: String,
        dte: Option<bool>,
    },
    StaticDataReportPartA {
        name: String,
    },
    StaticDataReportPartBDimensions {
        ship_type: u8,
        vendor_id: String,
        call_sign: String,
        dimension_to_bow: u16,
        dimension_to_stern: u16,
        dimension_to_port: u8,
        dimension_to_starboard: u8,
    },
    StaticDataReportPartBAuxiliaryCraft {
        ship_type: u8,
        vendor_id: String,
        call_sign: String,
        mothership_mmsi: u32,
    },
    BaseStationReport {
        utc_year: Option<u16>,
        utc_month: Option<u8>,
        utc_day: Option<u8>,
        utc_hour: Option<u8>,
        utc_minute: Option<u8>,
        utc_second: Option<u8>,
        position_accuracy: bool,
        longitude: Option<f32>,
        latitude: Option<f32>,
        position_fix_type: u8,
        raim_flag: bool,
        magnetic_declination: Option<f32>,
    },
    AidToNavigationReport {
        aid_type: Option<u8>,
        name: String,
        position_accuracy: bool,
        longitude: Option<f32>,
        latitude: Option<f32>,
        dimension_to_bow: u16,
        dimension_to_stern: u16,
        dimension_to_port: u8,
        dimension_to_starboard: u8,
        timestamp: u8,
        raim_flag: bool,
        off_position: bool,
        virtual_aid_flag: bool,
        assigned: bool,
        magnetic_declination: Option<f32>,
    },
    LongRangeBroadcast {
        position_accuracy: bool,
        raim_flag: bool,
        navigation_status: u8,
        longitude: Option<f32>,
        latitude: Option<f32>,
        speed_over_ground: Option<f32>,
        course_over_ground: Option<f32>,
        gnss_position_status: bool,
        magnetic_declination: Option<f32>,
    },
    Other,
}

#[derive(Serialize, Debug)]
pub struct Message {
    pub message_type: u8,
    pub repeat_indicator: u8,
    pub mmsi: u32,
    pub source_id: Option<String>,
    #[serde(flatten)]
    pub data: MessageData,
}
// todo: take into account source id in message_acc
pub fn decode(
    input: &str,
    message_acc: &mut HashMap<u8, Vec<String>>,
) -> Result<Option<Message>, NMEADecoderError> {
    let tokens = input.split('!').collect::<Vec<&str>>();

    let source_id = get_source_id(tokens[0]);
    let ais_sentence = format!("!{}", tokens[1]);

    match nmea::decode_nmea(&ais_sentence) {
        Ok(nmea_message) => {
            let mut data_payload: Option<String> = None;

            if nmea_message.fragment_count > 1 {
                match nmea_message.message_id {
                    Some(id) => {
                        if nmea_message.fragment_number > 1 && !message_acc.contains_key(&id) {
                            return Err(NMEADecoderError {
                                error_type:
                                    NMEADecoderErrorType::PreviousFragmentsNotPresentForMessageId,
                            });
                        }

                        let payload_vector = message_acc.entry(id).or_insert(Vec::new());

                        payload_vector.push(nmea_message.data_payload);

                        if nmea_message.fragment_count == nmea_message.fragment_number {
                            data_payload = Some(message_acc[&id].join(""));

                            message_acc.remove_entry(&id);
                        }
                    }
                    None => {
                        return Err(NMEADecoderError {
                            error_type: NMEADecoderErrorType::MissingFields,
                        })
                    }
                }
            } else {
                data_payload = Some(nmea_message.data_payload);
            }

            if let Some(payload) = data_payload {
                let bytestring = payload_to_bytestring(&payload);

                let message_type = match get_unsigned_number(&bytestring[0..6]) {
                    Ok(n) => n as u8,
                    Err(e) => return Err(e),
                };

                let repeat_indicator = match get_unsigned_number(&bytestring[6..8]) {
                    Ok(n) => n as u8,
                    Err(e) => return Err(e),
                };

                let mmsi = match get_unsigned_number(&bytestring[8..38]) {
                    Ok(n) => n as u32,
                    Err(e) => return Err(e),
                };

                let data = match message_type {
                    1..=3 => match position_report_class_a::get(&bytestring) {
                        Ok(x) => x,
                        Err(e) => return Err(e),
                    },
                    4 => match base_station_report::get(&bytestring) {
                        Ok(x) => x,
                        Err(e) => return Err(e),
                    },
                    5 => match static_voyage_data::get(&bytestring) {
                        Ok(x) => x,
                        Err(e) => return Err(e),
                    },
                    18 => match position_report_class_b::get(&bytestring) {
                        Ok(x) => x,
                        Err(e) => return Err(e),
                    },
                    19 => match extended_position_report_class_b::get(&bytestring) {
                        Ok(x) => x,
                        Err(e) => return Err(e),
                    },
                    21 => match aid_to_navigation_report::get(&bytestring) {
                        Ok(x) => x,
                        Err(e) => return Err(e),
                    },
                    24 => match static_data_report::get(mmsi, &bytestring) {
                        Ok(x) => x,
                        Err(e) => return Err(e),
                    },
                    27 => match long_range_broadcast::get(&bytestring) {
                        Ok(x) => x,
                        Err(e) => return Err(e),
                    },
                    _ => MessageData::Other,
                };

                return Ok(Some(Message {
                    message_type,
                    repeat_indicator,
                    mmsi,
                    data,
                    source_id,
                }));
            }
        }
        Err(e) => return Err(e),
    }

    return Ok(None);
}

fn get_source_id(input: &str) -> Option<String> {
    lazy_static! {
        static ref RE: Regex = Regex::new(r"s:(.*?)[,|*]").unwrap();
    }

    match RE.captures(input) {
        Some(v) => v.get(1).map_or(None, |m| Some(m.as_str().to_string())),
        None => None,
    }
}
