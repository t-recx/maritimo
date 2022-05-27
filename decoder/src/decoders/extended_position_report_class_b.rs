use crate::conversions::*;
use crate::error::*;
use crate::magnetic_declination::get_magnetic_declination;
use crate::MessageData;

pub fn get(bytestring: &str) -> Result<MessageData, NMEADecoderError> {
    if bytestring.len() < 312 {
        return Err(NMEADecoderError {
            error_type: NMEADecoderErrorType::IncorrectMessageSize,
        });
    }

    let speed_over_ground = match get_unsigned_number(&bytestring[46..56]) {
        Ok(n) => n as u16,
        Err(e) => return Err(e),
    };

    let speed_over_ground = match speed_over_ground {
        1023 => None,
        _ => Some(speed_over_ground as f32 / 10.0),
    };

    let position_accuracy = match get_unsigned_number(&bytestring[56..57]) {
        Ok(n) => (n as u8) == 1,
        Err(e) => return Err(e),
    };

    let longitude = match get_signed_number(&bytestring[57..85]) {
        Ok(n) => (n as f32) / 600000.0,
        Err(e) => return Err(e),
    };

    let longitude = if longitude >= 181.0 {
        None
    } else {
        Some(longitude)
    };

    let latitude = match get_signed_number(&bytestring[85..112]) {
        Ok(n) => (n as f32) / 600000.0,
        Err(e) => return Err(e),
    };

    let latitude = if latitude >= 91.0 {
        None
    } else {
        Some(latitude)
    };

    let course_over_ground = match get_unsigned_number(&bytestring[112..124]) {
        Ok(n) => n,
        Err(e) => return Err(e),
    };

    let course_over_ground = if course_over_ground == 3600 {
        None
    } else {
        Some(course_over_ground as f32 / 10.0)
    };

    let true_heading = match get_unsigned_number(&bytestring[124..133]) {
        Ok(n) => match n {
            511 => None,
            _ => Some(n as u16),
        },
        Err(e) => return Err(e),
    };

    let timestamp = match get_unsigned_number(&bytestring[133..139]) {
        Ok(n) => n as u8,
        Err(e) => return Err(e),
    };

    let name = get_string(&bytestring[143..263]);

    let ship_type = match get_unsigned_number(&bytestring[263..271]) {
        Ok(n) => match n {
            0..=99 => n as u8,
            _ => 0,
        },
        Err(e) => return Err(e),
    };

    let dimension_to_bow = match get_unsigned_number(&bytestring[271..280]) {
        Ok(n) => n as u16,
        Err(e) => return Err(e),
    };

    let dimension_to_stern = match get_unsigned_number(&bytestring[280..289]) {
        Ok(n) => n as u16,
        Err(e) => return Err(e),
    };

    let dimension_to_port = match get_unsigned_number(&bytestring[289..295]) {
        Ok(n) => n as u8,
        Err(e) => return Err(e),
    };

    let dimension_to_starboard = match get_unsigned_number(&bytestring[295..301]) {
        Ok(n) => n as u8,
        Err(e) => return Err(e),
    };

    let position_fix_type = match get_unsigned_number(&bytestring[301..305]) {
        Ok(n) => n as u8,
        Err(e) => return Err(e),
    };

    let raim_flag = match get_unsigned_number(&bytestring[305..306]) {
        Ok(n) => (n as u8) == 1,
        Err(e) => return Err(e),
    };

    let dte = match get_unsigned_number(&bytestring[306..307]) {
        Ok(n) => n == 1,
        Err(e) => return Err(e),
    };

    let assigned = match get_unsigned_number(&bytestring[307..308]) {
        Ok(n) => (n as u8) == 1,
        Err(e) => return Err(e),
    };

    let magnetic_declination = get_magnetic_declination(latitude, longitude);

    return Ok(MessageData::ExtendedPositionReportClassB {
        speed_over_ground,
        position_accuracy,
        longitude,
        latitude,
        course_over_ground,
        true_heading,
        timestamp,
        name,
        ship_type,
        dimension_to_bow,
        dimension_to_stern,
        dimension_to_port,
        dimension_to_starboard,
        position_fix_type,
        raim_flag,
        dte,
        assigned,
        magnetic_declination,
    });
}
