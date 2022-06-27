use std::collections::HashMap;

pub fn get_payload(hmap: &HashMap<u8, String>) -> String {
    let mut payload = "".to_string();
    let mut v = hmap.keys().cloned().collect::<Vec<u8>>();
    v.sort();

    for x in v {
        payload += hmap.get(&x).unwrap();
    }

    return payload;
}
