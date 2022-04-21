use crate::MessageData;
use crate::error::*;
use crate::conversions::*;

pub fn get(mmsi: u32, bytestring: &str) -> Result<MessageData, NMEADecoderError> {
    if bytestring.len() < 160 {
		return Err(NMEADecoderError { error_type: NMEADecoderErrorType::IncorrectMessageSize });
    }

	let part_number = match get_unsigned_number(&bytestring[38..40]) {
		Ok(n) => n as u8,
		Err(e) => return Err(e)
	};

    return match part_number {
        0 => get_part_a(bytestring),
        1 => get_part_b(mmsi, bytestring),
        _ => Err(NMEADecoderError { error_type: NMEADecoderErrorType::IncorrectPartNumber })
    }
}

fn get_part_a(bytestring: &str) -> Result<MessageData, NMEADecoderError> {
	let vessel_name = get_string(&bytestring[40..160]);

    return Ok(MessageData::StaticDataReportPartA { vessel_name });
}

fn get_part_b(mmsi: u32, bytestring: &str) -> Result<MessageData, NMEADecoderError> {
    if bytestring.len() < 168 {
		return Err(NMEADecoderError { error_type: NMEADecoderErrorType::IncorrectMessageSize });
    }

	let ship_type = match get_unsigned_number(&bytestring[40..48]) {
		Ok(n) => match n {
            0..=99 => {
                n as u8
            },
            _ => 0
        },
		Err(e) => return Err(e)
	};

	let vendor_id = get_string(&bytestring[48..90]);

	let call_sign = get_string(&bytestring[90..132]);

    return match is_auxiliary_craft(mmsi) {
        true => get_part_b_auxiliary_craft(&bytestring, ship_type, vendor_id, call_sign),
        false => get_part_b_dimensions(&bytestring, ship_type, vendor_id, call_sign)
    }
}

fn is_auxiliary_craft(mmsi: u32) -> bool {
    // https://www.navcen.uscg.gov/?pageName=mtmmsi -  Craft Associated with a Parent Ship
    let mmsi = mmsi.to_string();

    return mmsi.len() >= 9 && mmsi.starts_with("98");
}

fn get_part_b_dimensions(bytestring: &str, ship_type: u8, vendor_id: String, call_sign: String) -> Result<MessageData, NMEADecoderError> {
	let dimension_to_bow = match get_unsigned_number(&bytestring[132..141]) {
		Ok(n) => n as u16,
		Err(e) => return Err(e)
	};

	let dimension_to_stern = match get_unsigned_number(&bytestring[141..150]) {
		Ok(n) => n as u16,
		Err(e) => return Err(e)
	};

	let dimension_to_port = match get_unsigned_number(&bytestring[150..156]) {
		Ok(n) => n as u8,
		Err(e) => return Err(e)
	};

	let dimension_to_starboard = match get_unsigned_number(&bytestring[156..162]) {
		Ok(n) => n as u8,
		Err(e) => return Err(e)
	};

    return Ok(MessageData::StaticDataReportPartBDimensions { 
        ship_type,
        vendor_id,
        call_sign,
        dimension_to_bow,
        dimension_to_stern,
        dimension_to_port,
        dimension_to_starboard,
    });
}

fn get_part_b_auxiliary_craft(bytestring: &str, ship_type: u8, vendor_id: String, call_sign: String) -> Result<MessageData, NMEADecoderError> {
	let mothership_mmsi = match get_unsigned_number(&bytestring[132..162]) {
		Ok(n) => n as u32,
		Err(e) => return Err(e)
	};

    return Ok(MessageData::StaticDataReportPartBAuxiliaryCraft { 
        ship_type,
        vendor_id,
        call_sign,
        mothership_mmsi
    });
}