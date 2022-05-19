use crate::conversions::*;
use crate::error::*;
use crate::magnetic_declination::get_magnetic_declination;
use crate::MessageData;

pub fn get(bytestring: &str) -> Result<MessageData, NMEADecoderError> {
    if bytestring.len() < 96 {
        return Err(NMEADecoderError {
            error_type: NMEADecoderErrorType::IncorrectMessageSize,
        });
    }

    let position_accuracy = match get_unsigned_number(&bytestring[38..39]) {
        Ok(n) => (n as u8) == 1,
        Err(e) => return Err(e),
    };

    let raim_flag = match get_unsigned_number(&bytestring[39..40]) {
        Ok(n) => (n as u8) == 1,
        Err(e) => return Err(e),
    };

    let navigation_status = match get_unsigned_number(&bytestring[40..44]) {
        Ok(n) => n as u8,
        Err(e) => return Err(e),
    };

    let longitude = match get_signed_number(&bytestring[44..62]) {
        Ok(n) => (n as f32) / 600.0,
        Err(e) => return Err(e),
    };

    let longitude = if longitude >= 181.0 {
        None
    } else {
        Some(longitude)
    };

    let latitude = match get_signed_number(&bytestring[62..79]) {
        Ok(n) => (n as f32) / 600.0,
        Err(e) => return Err(e),
    };

    let latitude = if latitude >= 91.0 {
        None
    } else {
        Some(latitude)
    };

    let speed_over_ground = match get_unsigned_number(&bytestring[79..85]) {
        Ok(n) => n as u16,
        Err(e) => return Err(e),
    };

    let speed_over_ground = match speed_over_ground {
        63 => None,
        _ => Some(speed_over_ground as f32),
    };

    let course_over_ground = match get_unsigned_number(&bytestring[85..94]) {
        Ok(n) => n,
        Err(e) => return Err(e),
    };

    let course_over_ground = if course_over_ground == 511 {
        None
    } else {
        Some(course_over_ground as f32)
    };

    let gnss_position_status = match get_unsigned_number(&bytestring[94..95]) {
        Ok(n) => (n as u8) == 1,
        Err(e) => return Err(e),
    };

    let magnetic_declination = get_magnetic_declination(latitude, longitude);

    return Ok(MessageData::LongRangeBroadcast {
        position_accuracy,
        raim_flag,
        navigation_status,
        longitude,
        latitude,
        speed_over_ground,
        course_over_ground,
        gnss_position_status,
        magnetic_declination,
    });
}
