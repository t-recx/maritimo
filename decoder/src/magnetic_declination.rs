use time::OffsetDateTime;
use wmm::declination;

pub fn get_magnetic_declination(latitude: Option<f32>, longitude: Option<f32>) -> Option<f32> {
    if latitude.is_none() || longitude.is_none() {
        return None;
    }

    return match declination(
        OffsetDateTime::now_utc().date(),
        latitude.unwrap(),
        longitude.unwrap(),
    ) {
        Ok(n) => Some(n),
        Err(_) => None,
    };
}
