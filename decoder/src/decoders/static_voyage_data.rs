use crate::conversions::*;
use crate::error::*;
use crate::MessageData;

pub fn get(bytestring: &str) -> Result<MessageData, NMEADecoderError> {
    if bytestring.len() < 420 {
        return Err(NMEADecoderError {
            error_type: NMEADecoderErrorType::IncorrectMessageSize,
        });
    }

    let ais_version = match get_unsigned_number(&bytestring[38..40]) {
        Ok(n) => n as u8,
        Err(e) => return Err(e),
    };

    let imo_number = match get_unsigned_number(&bytestring[40..70]) {
        Ok(n) => n as u32,
        Err(e) => return Err(e),
    };

    let call_sign = get_string(&bytestring[70..112]);

    let name = get_string(&bytestring[112..232]);

    let ship_type = match get_unsigned_number(&bytestring[232..240]) {
        Ok(n) => match n {
            0..=99 => n as u8,
            _ => 0,
        },
        Err(e) => return Err(e),
    };

    let dimension_to_bow = match get_unsigned_number(&bytestring[240..249]) {
        Ok(n) => n as u16,
        Err(e) => return Err(e),
    };

    let dimension_to_stern = match get_unsigned_number(&bytestring[249..258]) {
        Ok(n) => n as u16,
        Err(e) => return Err(e),
    };

    let dimension_to_port = match get_unsigned_number(&bytestring[258..264]) {
        Ok(n) => n as u8,
        Err(e) => return Err(e),
    };

    let dimension_to_starboard = match get_unsigned_number(&bytestring[264..270]) {
        Ok(n) => n as u8,
        Err(e) => return Err(e),
    };

    let position_fix_type = match get_unsigned_number(&bytestring[270..274]) {
        Ok(n) => n as u8,
        Err(e) => return Err(e),
    };

    let eta_month = match get_unsigned_number(&bytestring[274..278]) {
        Ok(n) => match n {
            0 => None,
            _ => Some(n as u8),
        },
        Err(e) => return Err(e),
    };

    let eta_day = match get_unsigned_number(&bytestring[278..283]) {
        Ok(n) => match n {
            0 => None,
            _ => Some(n as u8),
        },
        Err(e) => return Err(e),
    };

    let eta_hour = match get_unsigned_number(&bytestring[283..288]) {
        Ok(n) => match n {
            0..=23 => Some(n as u8),
            _ => None,
        },
        Err(e) => return Err(e),
    };

    let eta_minute = match get_unsigned_number(&bytestring[288..294]) {
        Ok(n) => match n {
            0..=59 => Some(n as u8),
            _ => None,
        },
        Err(e) => return Err(e),
    };

    let draught = match get_unsigned_number(&bytestring[294..302]) {
        Ok(n) => n as f32 / 10.0,
        Err(e) => return Err(e),
    };

    let destination;

    if bytestring.len() < 422 {
        destination = get_string(&bytestring[302..bytestring.len()]);
    } else {
        destination = get_string(&bytestring[302..422]);
    };

    let dte = match bytestring.get(422..423) {
        Some(s) => match get_unsigned_number(&s) {
            Ok(n) => Some(n == 1),
            Err(_) => None,
        },
        None => None,
    };

    return Ok(MessageData::StaticAndVoyageData {
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
    });
}
