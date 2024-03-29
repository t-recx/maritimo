use std::error::Error;
use std::fmt;

#[derive(Debug, Clone, PartialEq)]
pub enum NMEADecoderErrorType {
    IncorrectPartNumber,
    IncorrectMessageSize,
    UnableToConvertNumberFromPayload,
    PreviousFragmentsNotPresentForMessageId,
    IncorrectFieldType,
    MissingFields,
    CheckSumNotPresent,
    NumberOfRecordedFragmentsDoesNotMatchMessageFragmentCount,
    IncorrectMessageFormat,
    Other,
}

#[derive(Debug, Clone)]
pub struct NMEADecoderError {
    pub error_type: NMEADecoderErrorType,
}

#[derive(Debug, Clone)]
pub struct MissingEnvironmentVariableError {
    pub message: String,
}

impl fmt::Display for MissingEnvironmentVariableError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl Error for MissingEnvironmentVariableError {
    fn description(&self) -> &str {
        &self.message
    }
}

#[derive(Debug, Clone)]
pub struct IncorrectEnvironmentVariableValueError {
    pub message: String,
}

impl fmt::Display for IncorrectEnvironmentVariableValueError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl Error for IncorrectEnvironmentVariableValueError {
    fn description(&self) -> &str {
        &self.message
    }
}
