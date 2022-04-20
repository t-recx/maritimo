#[macro_use]
extern crate lazy_static;

use std::collections::HashMap;

mod nmea;
mod conversions;
mod position_report;
mod static_voyage_data;
pub mod error;

use error::*;
use conversions::*;

#[derive(Debug, PartialEq)]
pub enum MessageData {
    PositionReport {
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
    },
    StaticAndVoyageData {
        ais_version: u8,
        imo_number: u32,
        call_sign: String,
        vessel_name: String,
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
        dte: Option<bool>
    },
    Other
}

#[derive(Debug)]
pub struct Message {
	pub message_type: u8,
	pub repeat_indicator: u8,
	pub mmsi: u32,
    pub data: MessageData
}

pub fn decode(input: &str, message_acc: &mut HashMap<u8, Vec<String>>) 
    -> Result<Option<Message>, NMEADecoderError> {

    match nmea::decode_nmea(&input) {
        Ok(nmea_message) => {
            let mut data_payload: Option<String> = None;

            if nmea_message.fragment_count > 1 {
                match nmea_message.message_id {
                    Some(id) => {
                        if nmea_message.fragment_number > 1 && !message_acc.contains_key(&id) {
                            return Err(NMEADecoderError { error_type: NMEADecoderErrorType::PreviousFragmentsNotPresentForMessageId });
                        }

                        let payload_vector = message_acc.entry(id).or_insert(Vec::new());

                        payload_vector.push(nmea_message.data_payload);

                        if nmea_message.fragment_count == nmea_message.fragment_number {
                            data_payload = Some(message_acc[&id].join(""));

                            message_acc.remove_entry(&id);
                        }
                    },
                    None => return Err(NMEADecoderError { error_type: NMEADecoderErrorType::MissingFields })
                }
            } else {
                data_payload = Some(nmea_message.data_payload);
            }

            if let Some(payload) = data_payload {
	            let bytestring = payload_to_bytestring(&payload);

	            let message_type = match get_unsigned_number(&bytestring[0..6]) {
		            Ok(n) => n as u8,
		            Err(e) => return Err(e)
	            };

	            let repeat_indicator = match get_unsigned_number(&bytestring[6..8]) {
		            Ok(n) => n as u8,
		            Err(e) => return Err(e)
	            };

	            let mmsi = match get_unsigned_number(&bytestring[8..38]) {
		            Ok(n) => n as u32,
		            Err(e) => return Err(e)
	            };

	            let data = match message_type {
		            1..=3 => {
			            match position_report::get(&bytestring) {
				            Ok(x) => x,
				            Err(e) => return Err(e)
			            }
		            },
                    5 => {
                        match static_voyage_data::get(&bytestring) {
				            Ok(x) => x,
				            Err(e) => return Err(e)
			            }
                    },
		            _ => MessageData::Other
	            };

                return Ok(Some(Message {
		            message_type,
		            repeat_indicator,
		            mmsi,
                    data
                }));
            }
        },
        Err(e) => return Err(e)
    }

    return Ok(None);
}