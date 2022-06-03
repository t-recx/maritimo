use crate::conversions::*;
use crate::error::*;
use crate::magnetic_declination::get_magnetic_declination;
use crate::MessageData;

pub fn get(bytestring: &str) -> Result<MessageData, NMEADecoderError> {
    if bytestring.len() < 168 {
        return Err(NMEADecoderError {
            error_type: NMEADecoderErrorType::IncorrectMessageSize,
        });
    }

    let navigation_status = match get_unsigned_number(&bytestring[38..42]) {
        Ok(n) => n as u8,
        Err(e) => return Err(e),
    };

    let rate_of_turn = match get_signed_number(&bytestring[42..50]) {
        Ok(n) => (n as f32 / 4.733).powf(2.0) * (if n > 0 { 1.0 } else { -1.0 }),
        Err(e) => return Err(e),
    };

    let speed_over_ground = match get_unsigned_number(&bytestring[50..60]) {
        Ok(n) => n as u16,
        Err(e) => return Err(e),
    };

    let speed_over_ground = match speed_over_ground {
        1023 => None,
        _ => Some(speed_over_ground as f32 / 10.0),
    };

    let position_accuracy = match get_unsigned_number(&bytestring[60..61]) {
        Ok(n) => (n as u8) == 1,
        Err(e) => return Err(e),
    };

    let longitude = match get_signed_number(&bytestring[61..89]) {
        Ok(n) => (n as f32) / 600000.0,
        Err(e) => return Err(e),
    };

    let longitude = if longitude >= 181.0 {
        None
    } else {
        Some(longitude)
    };

    let latitude = match get_signed_number(&bytestring[89..116]) {
        Ok(n) => (n as f32) / 600000.0,
        Err(e) => return Err(e),
    };

    let latitude = if latitude >= 91.0 {
        None
    } else {
        Some(latitude)
    };

    let course_over_ground = match get_unsigned_number(&bytestring[116..128]) {
        Ok(n) => n,
        Err(e) => return Err(e),
    };

    let course_over_ground = if course_over_ground == 3600 {
        None
    } else {
        Some(course_over_ground as f32 / 10.0)
    };

    let true_heading = match get_unsigned_number(&bytestring[128..137]) {
        Ok(n) => match n {
            511 => None,
            _ => Some(n as u16),
        },
        Err(e) => return Err(e),
    };

    let timestamp = match get_unsigned_number(&bytestring[137..143]) {
        Ok(n) => n as u8,
        Err(e) => return Err(e),
    };

    let manuever_indicator = match get_unsigned_number(&bytestring[143..145]) {
        Ok(n) => match n {
            0 => None,
            _ => Some(n as u8),
        },
        Err(e) => return Err(e),
    };

    let raim_flag = match get_unsigned_number(&bytestring[148..149]) {
        Ok(n) => (n as u8) == 1,
        Err(e) => return Err(e),
    };

    let magnetic_declination = get_magnetic_declination(latitude, longitude);

    return Ok(MessageData::PositionReportClassA {
        navigation_status,
        rate_of_turn,
        speed_over_ground,
        position_accuracy,
        longitude,
        latitude,
        course_over_ground,
        true_heading,
        timestamp,
        manuever_indicator,
        raim_flag,
        magnetic_declination,
    });
}
