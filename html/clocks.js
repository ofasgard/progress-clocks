import init, { init_panic_hook, ProgressClock } from '../pkg/progress_clocks.js';

await init();
init_panic_hook();

const CLOCK_RADIUS = 100;
const BACKGROUND_COLOR = "#333333";
const CLOCK_COLOR = "#444444";
const POSITIVE_TICK_COLOR = "#E0FFFF";
const NEGATIVE_TICK_COLOR = "#A31F34";

function generateWedge(degrees) {
	// Generate a wedge shape with a specified arc.
	const path = new Path2D();
	path.arc(CLOCK_RADIUS, CLOCK_RADIUS, CLOCK_RADIUS, 0, (degrees * Math.PI) / 180, false);
	path.lineTo(CLOCK_RADIUS, CLOCK_RADIUS);
	path.closePath();
	
	return path;
}

function drawClock(ctx, clock, x, y) {
	// Draws a progress clock to the canvas.
	const size = clock.get_size();
	const ticks = clock.get_ticks();
	
	// Move our context to the correct position.
	ctx.translate(x, y);
	
	// Dynamically create a wedge of the correct angle.
	const degrees = 360 / size;
	const wedge = generateWedge(degrees);
	
	// Set up the context.
	ctx.strokeStyle = BACKGROUND_COLOR;
	ctx.lineWidth = 10;
	
	// Initial rotation to orient the clock correctly.
	ctx.translate(CLOCK_RADIUS, CLOCK_RADIUS);
	ctx.rotate((270 * Math.PI) / 180);
	ctx.translate(-CLOCK_RADIUS, -CLOCK_RADIUS);
	
	// Iterate through all wedges and draw them in the correct position.
	for (let i = 0; i < size; i++) {
		if (ticks > i) {
			ctx.fillStyle = clock.is_positive() ? POSITIVE_TICK_COLOR : NEGATIVE_TICK_COLOR;
		} else {
			ctx.fillStyle = CLOCK_COLOR;
		}
		ctx.fill(wedge);
		ctx.stroke(wedge);
		
		ctx.translate(CLOCK_RADIUS, CLOCK_RADIUS);
		ctx.rotate((degrees * Math.PI) / 180);
		ctx.translate(-CLOCK_RADIUS, -CLOCK_RADIUS);
	}
		
	// Clean up our transformations.		
	ctx.resetTransform();
}

function checkTick(ctx, clock, clickX, clickY) {
	// Check which "tick" of the clock a click was in.
	const size = clock.get_size();
	
	// Dynamically create a wedge of the correct angle.
	const degrees = 360 / size;
	const wedge = generateWedge(degrees);
	
	// Initial rotation to orient the clock correctly.
	ctx.translate(CLOCK_RADIUS, CLOCK_RADIUS);
	ctx.rotate((270 * Math.PI) / 180);
	ctx.translate(-CLOCK_RADIUS, -CLOCK_RADIUS);
	
	// Iterate through all wedges and check whether the given point is inside each of them.
	for (let i = 0; i < size; i++) {
		if (ctx.isPointInPath(wedge, clickX, clickY)) {
			ctx.resetTransform();
			return i+1;
		}
		
		ctx.translate(CLOCK_RADIUS, CLOCK_RADIUS);
		ctx.rotate((degrees * Math.PI) / 180);
		ctx.translate(-CLOCK_RADIUS, -CLOCK_RADIUS);
	}
	
	// If not in any wedge, return -1.
	ctx.resetTransform();
	return -1;
}

function addClock(parent, clock) {
	// Create a div for the clock to live in.
	const div = document.createElement("div");
	div.id = clock.get_id();
	div.classList.add("clock-container");
	parent.appendChild(div);

	// Set the clock's title.
	const title = document.createElement("input");
	title.placeholder = "Clock";
	if (clock.get_name() != "") { title.value = clock.get_name(); }
	title.classList.add("clock-title");
	title.style.color = clock.is_positive() ? POSITIVE_TICK_COLOR : NEGATIVE_TICK_COLOR;
	div.appendChild(title);
	
	// Add event listener for the clock's title to update the underlying object.
	title.addEventListener("change", event => {
		clock.set_name(title.value);
	});
	
	// Create a canvas to draw the clock on.
	const canvas = document.createElement("canvas");
	canvas.classList.add("clock-canvas");
	canvas.width = CLOCK_RADIUS * 2;
	canvas.height = CLOCK_RADIUS * 2;
	div.appendChild(canvas);
	
	const ctx = canvas.getContext('2d');
	
	canvas.addEventListener("click", event => {
		const boundingRect = canvas.getBoundingClientRect();

		const scaleX = canvas.width / boundingRect.width;
		const scaleY = canvas.height / boundingRect.height;

		const canvasX = (event.clientX - boundingRect.left) * scaleX;
		const canvasY = (event.clientY - boundingRect.top) * scaleY;

		const clicked_wedge = checkTick(ctx, clock, canvasX, canvasY);
		if (clicked_wedge > 0) {
			clock.process_click(clicked_wedge);
		}
	});
	
	// Create the buttons to enlarge/reduce/remove the clock.
	
	const button_div = document.createElement("div");
	button_div.classList.add("clock-buttons");
	div.appendChild(button_div);
	
	const enlarge = document.createElement("button");
	enlarge.classList.add("button");
	enlarge.classList.add("clock-button");
	enlarge.innerHTML = "↟";
	button_div.appendChild(enlarge);
	
	const remove = document.createElement("button");
	remove.classList.add("button");
	remove.classList.add("clock-button");
	remove.innerHTML = "🗑";
	button_div.appendChild(remove);
	
	const reduce = document.createElement("button");
	reduce.classList.add("button");
	reduce.classList.add("clock-button");
	reduce.innerHTML = "↡";
	button_div.appendChild(reduce);
	
	// Add event listeners to connect the buttons to the clock's exported functions.

	enlarge.addEventListener("click", event => {
		clock.enlarge();
	});
	remove.addEventListener("click", event => {
		removeClock(clock);
	});
	reduce.addEventListener("click", event => {
		clock.reduce();
	});
	
	return clock.get_id();
}

function removeClock(clock) {
	const id = clock.get_id();
	const div = document.getElementById(id);
	div.remove();
	
	delete clocks[id];
}

var clocks = {}

const positive_button = document.getElementById("add-positive");
const negative_button = document.getElementById("add-negative");
const clock_area = document.getElementById("clock-area");

positive_button.addEventListener("click", event => {
	const clock = ProgressClock.new("", true);
	const clock_id = addClock(clock_area, clock);
	clocks[clock_id] = clock;
});

negative_button.addEventListener("click", event => {
	const clock = ProgressClock.new("", false);
	const clock_id = addClock(clock_area, clock);
	clocks[clock_id] = clock;
});

// Recursive rendering loop to animate the page.
const renderLoop = () => {
	for(var id in clocks) {
		const clock = clocks[id];
		const div = document.getElementById(id);
		
		const canvas = div.children[1];
		const ctx = canvas.getContext('2d');
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawClock(ctx, clock, 0, 0);
	}
	requestAnimationFrame(renderLoop);
};

// Start animating the page.
requestAnimationFrame(renderLoop);
