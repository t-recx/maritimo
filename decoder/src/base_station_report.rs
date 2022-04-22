use crate::MessageData;
use crate::error::*;
use crate::conversions::*;

pub fn get(bytestring: &str) -> Result<MessageData, NMEADecoderError> {
	if bytestring.len() < 168 {
		return Err(NMEADecoderError { error_type: NMEADecoderErrorType::IncorrectMessageSize });
	}

	let utc_year = match get_unsigned_number(&bytestring[38..52]) {
		Ok(n) => match n {
            0 => None,
            _ => Some(n as u16)
        },
		Err(e) => return Err(e)
	};

	let utc_month = match get_unsigned_number(&bytestring[52..56]) {
		Ok(n) => match n {
            0 => None,
            _ => Some(n as u8)
        },
		Err(e) => return Err(e)
	};

	let utc_day = match get_unsigned_number(&bytestring[56..61]) {
		Ok(n) => match n {
            0 => None,
            _ => Some(n as u8)
        },
		Err(e) => return Err(e)
	};

	let utc_hour = match get_unsigned_number(&bytestring[61..66]) {
		Ok(n) => match n {
            0..=23 => Some(n as u8),
            _ => None
        },
		Err(e) => return Err(e)
	};

	let utc_minute = match get_unsigned_number(&bytestring[66..72]) {
		Ok(n) => match n {
            0..=59 => Some(n as u8),
            _ => None
        },
		Err(e) => return Err(e)
	};

	let utc_second = match get_unsigned_number(&bytestring[72..78]) {
		Ok(n) => match n {
            0..=59 => Some(n as u8),
            _ => None
        },
		Err(e) => return Err(e)
	};

	let position_accuracy = match get_unsigned_number(&bytestring[78..79]) {
		Ok(n) => (n as u8) == 1,
		Err(e) => return Err(e)
	};

    let longitude = match get_signed_number(&bytestring[79..107]) {
        Ok(n) => (n as f32) / 600000.0, 
        Err(e) => return Err(e)
    };

    let longitude = if longitude >= 181.0 {
        None
    } else {
        Some(longitude)
    };

    let latitude = match get_signed_number(&bytestring[107..134]) {
        Ok(n) => (n as f32) / 600000.0, 
        Err(e) => return Err(e)
    };

    let latitude = if latitude >= 91.0 {
        None
    } else {
        Some(latitude)
    };

	let position_fix_type = match get_unsigned_number(&bytestring[134..138]) {
		Ok(n) => n as u8,
		Err(e) => return Err(e)
	};

	let raim_flag = match get_unsigned_number(&bytestring[148..149]) {
		Ok(n) => (n as u8) == 1,
		Err(e) => return Err(e)
	};

    return Ok(MessageData::BaseStationReport { 
            utc_year, utc_month, utc_day, utc_hour, utc_minute,
            utc_second, position_accuracy, longitude,
            latitude, raim_flag, position_fix_type
        });
}
