use crate::MessageData;
use crate::error::*;
use crate::conversions::*;

pub fn get(bytestring: &str) -> Result<MessageData, NMEADecoderError> {
	if bytestring.len() < 168 {
		return Err(NMEADecoderError { error_type: NMEADecoderErrorType::IncorrectMessageSize });
	}

	let speed_over_ground = match get_unsigned_number(&bytestring[46..56]) {
		Ok(n) => n as u16,
		Err(e) => return Err(e)
	};

	let speed_over_ground = match speed_over_ground {
		1023 => None,
		_ => Some(speed_over_ground as f32 / 10.0)
	};

	let position_accuracy = match get_unsigned_number(&bytestring[56..57]) {
		Ok(n) => (n as u8) == 1,
		Err(e) => return Err(e)
	};

    let longitude = match get_signed_number(&bytestring[57..85]) {
        Ok(n) => (n as f32) / 600000.0, 
        Err(e) => return Err(e)
    };

    let longitude = if longitude >= 181.0 {
        None
    } else {
        Some(longitude)
    };

    let latitude = match get_signed_number(&bytestring[85..112]) {
        Ok(n) => (n as f32) / 600000.0, 
        Err(e) => return Err(e)
    };

    let latitude = if latitude >= 91.0 {
        None
    } else {
        Some(latitude)
    };

	let course_over_ground = match get_unsigned_number(&bytestring[112..124]) {
        Ok(n) => n,
        Err(e) => return Err(e)
	};

	let true_heading = match get_unsigned_number(&bytestring[124..133]) {
        Ok(n) => match n {
			511 => None,
			_ => Some(n as u8)
		},
        Err(e) => return Err(e)
	};

	let timestamp = match get_unsigned_number(&bytestring[133..139]) {
        Ok(n) => n as u8,
        Err(e) => return Err(e)
	};

	let cs_unit = match get_unsigned_number(&bytestring[141..142]) {
		Ok(n) => (n as u8) == 1,
		Err(e) => return Err(e)
	};

	let display_flag = match get_unsigned_number(&bytestring[142..143]) {
		Ok(n) => (n as u8) == 1,
		Err(e) => return Err(e)
	};

	let dsc_flag = match get_unsigned_number(&bytestring[143..144]) {
		Ok(n) => (n as u8) == 1,
		Err(e) => return Err(e)
	};

	let band_flag = match get_unsigned_number(&bytestring[144..145]) {
		Ok(n) => (n as u8) == 1,
		Err(e) => return Err(e)
	};

	let message_22_flag = match get_unsigned_number(&bytestring[145..146]) {
		Ok(n) => (n as u8) == 1,
		Err(e) => return Err(e)
	};

	let assigned = match get_unsigned_number(&bytestring[146..147]) {
		Ok(n) => (n as u8) == 1,
		Err(e) => return Err(e)
	};

	let raim_flag = match get_unsigned_number(&bytestring[147..148]) {
		Ok(n) => (n as u8) == 1,
		Err(e) => return Err(e)
	};

	return Ok(MessageData::PositionReportClassB {
		speed_over_ground,
        position_accuracy,
        longitude,
        latitude,
		course_over_ground: if course_over_ground == 3600 { None } else { Some(course_over_ground as f32 / 10.0) },
		true_heading,
		timestamp,
        cs_unit,
        display_flag,
        dsc_flag,
        band_flag,
        message_22_flag,
        assigned,
		raim_flag
	});
}

