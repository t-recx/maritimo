use redis::ConnectionLike;
use std::env;

use redis::{Client, Connection};

pub fn get_redis_connection() -> Connection {
    let redis_uri_env_var_name = "MARITIMO_TEST_REDIS_URI";
    let redis_uri = env::var(redis_uri_env_var_name).expect(
        format!(
            "Please set the {} environment variable",
            redis_uri_env_var_name
        )
        .as_str(),
    );
    let redis_client = Client::open(redis_uri).unwrap();

    let mut connection = redis_client.get_connection().unwrap();

    redis::cmd("FLUSHALL").execute(&mut connection);

    return connection;
}

pub fn get_from_redis(k1: &str, k2: i32, con: &mut dyn ConnectionLike) -> String {
    return redis::cmd("HGET")
        .arg(k1)
        .arg(k2)
        .query::<String>(con)
        .unwrap_or("".to_string());
}
