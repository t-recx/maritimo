use crate::error::*;

#[derive(Debug)]
pub enum RadioChannel {
	A,
	B,
	Unknown
}

#[derive(Debug)]
pub enum PacketType {
	AIVDM,
	AIVDO,
	Unknown
}

#[derive(Debug)]
pub struct NMEAMessage {
	pub packet_type: PacketType,
	pub fragment_count: u8,
	pub fragment_number: u8,
	pub message_id: Option<u8>,
	pub radio_channel: RadioChannel,
	pub data_payload: String,
	pub fill_bits: u8,
	pub checksum: String
}

pub fn decode_nmea(input: &str) -> Result<NMEAMessage, NMEADecoderError> {
	let tokens : Vec<&str> = input.trim().split('*').collect();

	if tokens.len() < 2 {
		return Err(NMEADecoderError { error_type: NMEADecoderErrorType::CheckSumNotPresent });
	}

	let checksum = tokens[1].to_string();

	let tokens : Vec<&str> = tokens[0].split(',').collect();

	if tokens.len() < 7 {
		return Err(NMEADecoderError { error_type: NMEADecoderErrorType::MissingFields});
	}

	let packet_type = match tokens[0] {
		"!AIVDM" => PacketType::AIVDM,
		"!AIVDO" => PacketType::AIVDO,
		_ => PacketType::Unknown
	};

	let fragment_count = match tokens[1].parse::<u8>() {
		Ok(n) => n,
		Err(_e) => return Err(NMEADecoderError { error_type: NMEADecoderErrorType::IncorrectFieldType }),
	};

	let fragment_number = match tokens[2].parse::<u8>() {
		Ok(n) => n,
		Err(_e) => return Err(NMEADecoderError { error_type: NMEADecoderErrorType::IncorrectFieldType }),
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
		Err(_e) => return Err(NMEADecoderError { error_type: NMEADecoderErrorType::IncorrectFieldType }),
	};

	return Ok(NMEAMessage {
		packet_type,
		fragment_count,
		fragment_number,
		message_id,
		radio_channel,
		data_payload: tokens[5].to_string(),
		fill_bits,
		checksum,
	});
}