use wasm_bindgen::prelude::*;
use console_error_panic_hook;

use std::cmp::min;
use std::cmp::max;

#[wasm_bindgen]
pub fn init_panic_hook() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub struct ProgressClock {
	name: String,
	size: i32,
	ticks: i32,
	positive: bool
}

#[wasm_bindgen]
impl ProgressClock {
	pub fn new(name : &str, positive: bool) -> ProgressClock {
		ProgressClock {
			name: name.to_string(),
			size: 4,
			ticks: 0,
			positive: positive
		}
	}
	
	pub fn get_name(&self) -> String { self.name.to_string() }
	pub fn get_size(&self) -> i32 { self.size }
	pub fn get_ticks(&self) -> i32 { self.ticks }
	pub fn is_positive(&self) -> bool { self.positive }
	
	pub fn enlarge(&mut self) {
		self.size = min(max(2, self.size+2), 12);
	}
	
	pub fn reduce(&mut self) {
		self.size = min(max(2, self.size-2), 12);
		if self.ticks > self.size { self.ticks = self.size; }
	}
	
	pub fn set_tick(&mut self, amount : i32) {
		self.ticks = min(max(0, amount), self.size);
	}
	
	pub fn tick(&mut self) {
		self.set_tick(self.ticks + 1);
	}
	
	pub fn untick(&mut self) {
		self.set_tick(self.ticks - 1);
	}
	
	pub fn get_tick_color(&self) -> String {
		match self.positive {
			true => "#ADD8E6".to_string(),
			false => "#FF7518".to_string()
		}
	}
}
