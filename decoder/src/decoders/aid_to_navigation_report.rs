use crate::conversions::*;
use crate::error::*;
use crate::magnetic_declination::*;
use crate::MessageData;

pub fn get(bytestring: &str) -> Result<MessageData, NMEADecoderError> {
    if bytestring.len() < 272 {
        return Err(NMEADecoderError {
            error_type: NMEADecoderErrorType::IncorrectMessageSize,
        });
    }

    let aid_type = match get_unsigned_number(&bytestring[38..43]) {
        Ok(n) => match n {
            0 => None,
            _ => Some(n as u8),
        },
        Err(e) => return Err(e),
    };

    let mut name = get_string(&bytestring[43..163]);

    if bytestring.len() >= 272 {
        let name_extension = get_string(&bytestring[272..bytestring.len()]);

        name += &name_extension;
    }

    let position_accuracy = match get_unsigned_number(&bytestring[163..164]) {
        Ok(n) => (n as u8) == 1,
        Err(e) => return Err(e),
    };

    let longitude = match get_signed_number(&bytestring[164..192]) {
        Ok(n) => (n as f32) / 600000.0,
        Err(e) => return Err(e),
    };

    let longitude = if longitude >= 181.0 {
        None
    } else {
        Some(longitude)
    };

    let latitude = match get_signed_number(&bytestring[192..219]) {
        Ok(n) => (n as f32) / 600000.0,
        Err(e) => return Err(e),
    };

    let latitude = if latitude >= 91.0 {
        None
    } else {
        Some(latitude)
    };

    let dimension_to_bow = match get_unsigned_number(&bytestring[219..228]) {
        Ok(n) => n as u16,
        Err(e) => return Err(e),
    };

    let dimension_to_stern = match get_unsigned_number(&bytestring[228..237]) {
        Ok(n) => n as u16,
        Err(e) => return Err(e),
    };

    let dimension_to_port = match get_unsigned_number(&bytestring[237..243]) {
        Ok(n) => n as u8,
        Err(e) => return Err(e),
    };

    let dimension_to_starboard = match get_unsigned_number(&bytestring[243..249]) {
        Ok(n) => n as u8,
        Err(e) => return Err(e),
    };

    let timestamp = match get_unsigned_number(&bytestring[253..259]) {
        Ok(n) => n as u8,
        Err(e) => return Err(e),
    };

    let off_position = match get_unsigned_number(&bytestring[259..260]) {
        Ok(n) => (n as u8) == 1,
        Err(e) => return Err(e),
    };

    let raim_flag = match get_unsigned_number(&bytestring[268..269]) {
        Ok(n) => (n as u8) == 1,
        Err(e) => return Err(e),
    };

    let virtual_aid_flag = match get_unsigned_number(&bytestring[269..270]) {
        Ok(n) => (n as u8) == 1,
        Err(e) => return Err(e),
    };

    let assigned = match get_unsigned_number(&bytestring[270..271]) {
        Ok(n) => (n as u8) == 1,
        Err(e) => return Err(e),
    };

    let magnetic_declination = get_magnetic_declination(latitude, longitude);

    return Ok(MessageData::AidToNavigationReport {
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
        magnetic_declination,
    });
}
