#[derive(Debug, Clone, PartialEq)]
pub enum NMEADecoderErrorType {
    IncorrectPartNumber,
    IncorrectMessageSize,
    UnableToConvertNumberFromPayload,
    PreviousFragmentsNotPresentForMessageId,
    IncorrectFieldType,
    MissingFields,
    CheckSumNotPresent,
    Other
}

#[derive(Debug, Clone)]
pub struct NMEADecoderError {
    pub error_type: NMEADecoderErrorType
}