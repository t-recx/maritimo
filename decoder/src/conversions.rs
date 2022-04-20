use std::str;
use std::collections::HashMap;

use crate::error::*;

lazy_static! {
    static ref SIXBIT_ASCII: HashMap<&'static str, &'static str> = { 
        return HashMap::from([
            ("000000", "@"),
            ("010000", "P"),
            ("100000", " "),
            ("110000", "0"),
            ("000001", "A"),
            ("010001", "Q"),
            ("100001", "!"),
            ("110001", "1"),
            ("000010", "B"),
            ("010010", "R"),
            ("100010", "\""),
            ("110010", "2"),
            ("000011", "C"),
            ("010011", "S"),
            ("100011", "#"),
            ("110011", "3"),
            ("000100", "D"),
            ("010100", "T"),
            ("100100", "$"),
            ("110100", "4"),
            ("000101", "E"),
            ("010101", "U"),
            ("100101", "%"),
            ("110101", "5"),
            ("000110", "F"),
            ("010110", "V"),
            ("100110", "&"),
            ("110110", "6"),
            ("000111", "G"),
            ("010111", "W"),
            ("100111", "'"),
            ("110111", "7"),
            ("001000", "H"),
            ("011000", "X"),
            ("101000", "("),
            ("111000", "8"),
            ("001001", "I"),
            ("011001", "Y"),
            ("101001", ")"),
            ("111001", "9"),
            ("001010", "J"),
            ("011010", "Z"),
            ("101010", "*"),
            ("111010", ":"),
            ("001011", "K"),
            ("011011", "["),
            ("101011", "+"),
            ("111011", ";"),
            ("001100", "L"),
            ("011100", "\\"),
            ("101100", ","),
            ("111100", "<"),
            ("001101", "M"),
            ("011101", "]"),
            ("101101", "-"),
            ("111101", "="),
            ("001110", "N"),
            ("011110", "^"),
            ("101110", "."),
            ("111110", ">"),
            ("001111", "O"),
            ("011111", "_"),
            ("101111", "/"),
            ("111111", "?"),
        ]);
    };
}

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

pub fn get_string(payload: &str) -> String {
    return payload.as_bytes()
        .chunks(6)
        .map(str::from_utf8)
        .map(|s| SIXBIT_ASCII.get(&s.unwrap_or("")).unwrap_or(&""))
        .map(|&x| x)
        .collect::<Vec<&str>>()
        .join("")
        .split("@")
        .next()
        .unwrap()
        .trim()
        .to_string();
}

pub fn payload_to_bytestring(payload: &str) -> String {
	return payload.bytes()
        .map(|n| n - 48)
        .map(|n| if n > 40 { n - 8 } else { n })
        .map(|n| format!("{:06b}", n))
		.collect();
}