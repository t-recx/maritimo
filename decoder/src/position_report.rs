use crate::MessageData;
use crate::error::*;
use crate::conversions::*;

pub fn get(bytestring: &str) -> Result<MessageData, NMEADecoderError> {
	let navigation_status = match get_number_from_payload(&bytestring[38..42]) {
		Ok(n) => n as u8,
		Err(e) => return Err(e)
	};

	let rate_of_turn = match get_signed_number_from_payload(&bytestring[42..50]) {
		Ok(n) => (n as f32 / 4.733).powf(2.0) * (if n > 0 { 1.0 } else { -1.0 }),
		Err(e) => return Err(e)
	};

	let speed_over_ground = match get_number_from_payload(&bytestring[50..60]) {
		Ok(n) => n as u16,
		Err(e) => return Err(e)
	};

	let speed_over_ground = match speed_over_ground {
		1023 => None,
		_ => Some(speed_over_ground as f32 / 10.0)
	};

	let position_accuracy = match get_number_from_payload(&bytestring[60..61]) {
		Ok(n) => (n as i16) == 1,
		Err(e) => return Err(e)
	};

    let longitude = match get_signed_number_from_payload(&bytestring[61..89]) {
        Ok(n) => (n as f32) / 600000.0, 
        Err(e) => return Err(e)
    };

    let longitude = if longitude >= 181.0 {
        None
    } else {
        Some(longitude)
    };

    let latitude = match get_signed_number_from_payload(&bytestring[89..116]) {
        Ok(n) => (n as f32) / 600000.0, 
        Err(e) => return Err(e)
    };

    let latitude = if latitude >= 91.0 {
        None
    } else {
        Some(latitude)
    };

	return Ok(MessageData::PositionReport {
		navigation_status,
		rate_of_turn,
		speed_over_ground,
        position_accuracy,
        longitude,
        latitude
	});
}
