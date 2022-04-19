use crate::error::*;

pub fn get_unsigned_number(payload: &str) -> Result<usize, NMEADecoderError> {
	return match usize::from_str_radix(payload, 2) {
		Ok(n) => Ok(n),
		Err(_e) => Err(NMEADecoderError { error_type: NMEADecoderErrorType::UnableToConvertNumberFromPayload })
	};
}

pub fn get_signed_number(payload: &str) -> Result<isize, NMEADecoderError> {
    let value_bits = &payload[1..payload.len()];

    match get_unsigned_number(&payload[0..1]) {
        Ok(sign_bit) => {
            if sign_bit == 0 {
                match get_unsigned_number(value_bits) {
                    Ok(n) => return Ok(n as isize),
                    Err(e) => return Err(e)
                }
            } else {
                let value_bits = &value_bits.replace("0", " ").replace("1", "0").replace(" ", "1");

                match get_unsigned_number(value_bits) {
                    Ok(n) => return Ok(-1 - n as isize),
                    Err(e) => return Err(e)
                }
            }
        },
        Err(e) => return Err(e)
    };
}

pub fn payload_to_bytestring(payload: &str) -> String {
	return payload.bytes()
        .map(|n| n - 48)
        .map(|n| if n > 40 { n - 8 } else { n })
        .map(|n| format!("{:06b}", n))
		.collect();
}