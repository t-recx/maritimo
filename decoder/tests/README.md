To execute these tests a redis server - configured using the MARITIMO_TEST_REDIS_URI environment variable - must be running and the tests must execute consecutively to avoid overlapping state:

$ cargo test -- --test-threads=1
