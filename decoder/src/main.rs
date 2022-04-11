use std::io;

#[derive(Debug)]
enum RadioChannel {
	A,
	B,
	Unknown
}

#[derive(Debug)]
enum PacketType {
	AIVDM,
	AIVDO,
	Unknown
}

#[derive(Debug)]
struct NMEAMessage {
	packet_type: PacketType,
	fragments: u8,
	fragment_number: u8,
	message_id: Option<u8>,
	radio_channel: RadioChannel,
	data_payload: String,
	fill_bits: u8,
	checksum: String
}

#[derive(Debug)]
enum MessageData {
	PositionReport {
		navigation_status: u8,
		rate_of_turn: i8,
		speed_over_ground: Option<f32>,
	},
	Other
}

#[derive(Debug)]
struct Message {
	message_type: u8,
	repeat_indicator: u8,
	mmsi: u32,
	data: MessageData
}

#[derive(Debug, Clone)]
struct NMEADecoderError;

fn main() {
	let mut input = String::new();

	io::stdin()
		.read_line(&mut input)
		.expect("Failed to read from input");

	println!("{:?}", process_message(&input).unwrap());
}

fn process_message(input: &str) -> Result<Message, NMEADecoderError> {
	let nmea_message = to_nmea(&input).expect("Failed to decode message");
		
	println!("{:?}", nmea_message);

	let bytestring = payload_to_bytestring(&nmea_message.data_payload);

	let message_type = match get_number_from_payload(&bytestring[0..6]) {
		Ok(n) => n as u8,
		Err(_e) => return Err(NMEADecoderError)
	};

	let repeat_indicator = match get_number_from_payload(&bytestring[6..8]) {
		Ok(n) => n as u8,
		Err(_e) => return Err(NMEADecoderError)
	};

	let mmsi = match get_number_from_payload(&bytestring[8..38]) {
		Ok(n) => n as u32,
		Err(_e) => return Err(NMEADecoderError)
	};

	let data = match message_type {
		1..=3 => {
			match get_message_position_report(&bytestring) {
				Ok(x) => x,
				Err(e) => return Err(e)
			}
		},
		_ => MessageData::Other
	};

	return Ok(Message {
		message_type,
		repeat_indicator,
		mmsi,
		data
	});
}

fn get_message_position_report(bytestring: &str) -> Result<MessageData, NMEADecoderError> {
	let navigation_status = match get_number_from_payload(&bytestring[38..42]) {
		Ok(n) => n as u8,
		Err(e) => return Err(e)
	};

	let rate_of_turn = match get_number_from_payload(&bytestring[42..50]) {
		Ok(n) => n as i8,
		Err(e) => return Err(e)
	};

	let speed_over_ground = match get_number_from_payload(&bytestring[50..60]) {
		Ok(n) => n as i16,
		Err(e) => return Err(e)
	};

	let speed_over_ground = match speed_over_ground {
		1023 => None,
		_ => Some(speed_over_ground as f32 / 10.0)
	};

	return Ok(MessageData::PositionReport {
		navigation_status,
		rate_of_turn,
		speed_over_ground
	});
}

fn payload_to_bytestring(payload: &str) -> String {
	return payload.bytes()
        .map(|n| n - 48)
        .map(|n| if n > 40 { n - 8 } else { n })
        .map(|n| format!("{:06b}", n))
		.collect();
}

fn get_number_from_payload(payload: &str) -> Result<isize, NMEADecoderError> {
	return match isize::from_str_radix(payload, 2) {
		Ok(n) => Ok(n),
		Err(_e) => Err(NMEADecoderError)
	};
}

fn to_nmea(input: &str) -> Result<NMEAMessage, NMEADecoderError> {
	let tokens : Vec<&str> = input.trim().split('*').collect();

	if tokens.len() < 2 {
		return Err(NMEADecoderError);
	}

	let checksum = tokens[1].to_string();

	let tokens : Vec<&str> = tokens[0].split(',').collect();

	if tokens.len() < 7 {
		return Err(NMEADecoderError);
	}

	let packet_type = match tokens[0] {
		"!AIVDM" => PacketType::AIVDM,
		"!AIVDO" => PacketType::AIVDO,
		_ => PacketType::Unknown
	};

	let fragments = match tokens[1].parse::<u8>() {
		Ok(n) => n,
		Err(_e) => return Err(NMEADecoderError),
	};

	let fragment_number = match tokens[2].parse::<u8>() {
		Ok(n) => n,
		Err(_e) => return Err(NMEADecoderError)
	};

	let message_id = match tokens[3].parse::<u8>() {
		Ok(n) => Some(n),
		Err(_e) => None
	};

	let radio_channel = match tokens[4] {
		"A" | "1" => RadioChannel::A,
		"B" | "2" => RadioChannel::B,
		_ => RadioChannel::Unknown
	};

	let fill_bits = match tokens[6].parse::<u8>() {
		Ok(n) => n,
		Err(_e) => return Err(NMEADecoderError)
	};

	return Ok(NMEAMessage {
		packet_type,
		fragments,
		fragment_number,
		message_id,
		radio_channel,
		data_payload: tokens[5].to_string(),
		fill_bits,
		checksum,
	});
}


//let sixbit_ascii = HashMap::from([
    //("000000", "@"),
    //("010000", "P"),
    //("100000", " "),
    //("110000", "0"),
    //("000001", "A"),
    //("010001", "Q"),
    //("100001", "!"),
    //("110001", "1"),
    //("000010", "B"),
    //("010010", "R"),
    //("100010", "\""),
    //("110010", "2"),
    //("000011", "C"),
    //("010011", "S"),
    //("100011", "#"),
    //("110011", "3"),
    //("000100", "D"),
    //("010100", "T"),
    //("100100", "$"),
    //("110100", "4"),
    //("000101", "E"),
    //("010101", "U"),
    //("100101", "%"),
    //("110101", "5"),
    //("000110", "F"),
    //("010110", "V"),
    //("100110", "&"),
    //("110110", "6"),
    //("000111", "G"),
    //("010111", "W"),
    //("100111", "'"),
    //("110111", "7"),
    //("001000", "H"),
    //("011000", "X"),
    //("101000", "("),
    //("111000", "8"),
    //("001001", "I"),
    //("011001", "Y"),
    //("101001", ")"),
    //("111001", "9"),
    //("001010", "J"),
    //("011010", "Z"),
    //("101010", "*"),
    //("111010", ":"),
    //("001011", "K"),
    //("011011", "["),
    //("101011", "+"),
    //("111011", ";"),
    //("001100", "L"),
    //("011100", "\\"),
    //("101100", ","),
    //("111100", "<"),
    //("001101", "M"),
    //("011101", "]"),
    //("101101", "-"),
    //("111101", "="),
    //("001110", "N"),
    //("011110", "^"),
    //("101110", "."),
    //("111110", ">"),
    //("001111", "O"),
    //("011111", "_"),
    //("101111", "/"),
    //("111111", "?"),
//]);