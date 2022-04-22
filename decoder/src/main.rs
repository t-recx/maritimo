use std::collections::HashMap;
use std::env;
use std::fs::File;
use std::io::{self, BufRead};
use std::path::Path;

fn main() {
    let mut acc = HashMap::new();
    let args: Vec<String> = env::args().collect();

    if let Ok(lines) = read_lines(&args.get(1).expect("File argument not supplied")) {
        for line in lines {
            if let Ok(message) = line {
                match decoder::decode(&message, &mut acc) {
                    Ok(opt) => match opt {
                        Some(value) => println!("{:?}", value),
                        _ => (),
                    },
                    Err(e) => println!("{:?}", e),
                }
            }
        }
    }
}

fn read_lines<P>(filename: P) -> io::Result<io::Lines<io::BufReader<File>>>
where
    P: AsRef<Path>,
{
    let file = File::open(filename)?;
    Ok(io::BufReader::new(file).lines())
}
