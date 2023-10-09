import init, { init_panic_hook, ProgressClock } from '../pkg/progress_clocks.js';

await init();
init_panic_hook();

function generateWedge(degrees) {
	// Generate a wedge shape with a specified arc.
	const path = new Path2D();
	path.arc(150, 150, 150, 0, (degrees * Math.PI) / 180, false);
	path.lineTo(150, 150);
	path.closePath();
	
	return path;
}

function drawClock(ctx, clock, x, y) {
	// Move our context to the correct position.
	ctx.translate(x, y);

	// Draw a progress clock to the canvas.
	const size = clock.get_size();
	const ticks = clock.get_ticks();
	
	// Dynamically create a wedge of the correct angle.
	const degrees = 360 / size;
	const wedge = generateWedge(degrees);
	
	// Set up the context.
	ctx.strokeStyle = "#FFF";
	ctx.lineWidth = 10;
	
	// Initial rotation to orient the clock correctly.
	ctx.translate(150, 150);
	ctx.rotate((270 * Math.PI) / 180);
	ctx.translate(-150, -150);
	
	// Iterate through all wedges and draw them in the correct position.
	for (let i = 0; i < size; i++) {
		if (ticks > i) {
			ctx.fillStyle = clock.get_tick_color();
		} else {
			ctx.fillStyle = "#CCCCCC";
		}
		ctx.fill(wedge);
		ctx.stroke(wedge);
		
		ctx.translate(150, 150);
		ctx.rotate((degrees * Math.PI) / 180);
		ctx.translate(-150, -150);
	}
		
	// Clean up our transformations.		
	ctx.resetTransform();
}

function addClockToParent(parent, clock) {
	// Create a div for the clock to live in.
	const div = document.createElement("div");
	div.id = Math.random().toString(36).substring(2,13);
	parent.appendChild(div);

	// Set the clock's title.
	const title = document.createElement("input");
	title.value = clock.get_name();
	div.appendChild(title);
	
	// Add event listener for the clock's title to update the underlying object.
	title.addEventListener("change", event => {
		clock.set_name(title.value);
	});
	
	div.appendChild(document.createElement("br"));
	
	// Create a canvas to draw the clock on.
	const canvas = document.createElement("canvas");
	canvas.width = 300;
	canvas.height = 300;
	div.appendChild(canvas);
	
	div.appendChild(document.createElement("br"));
	
	// Create the buttons to tick/untick/enlarge/reduce the clock.
	
	const tick = document.createElement("button");
	tick.innerHTML = "Tick";
	div.appendChild(tick);
	
	const untick = document.createElement("button");
	untick.innerHTML = "Untick";
	div.appendChild(untick);
	
	div.appendChild(document.createElement("br"));
	
	const enlarge = document.createElement("button");
	enlarge.innerHTML = "Enlarge";
	div.appendChild(enlarge);
	
	const reduce = document.createElement("button");
	reduce.innerHTML = "Reduce";
	div.appendChild(reduce);
	
	// Add event listeners to connect the buttons to the clock's exported functions.
	
	tick.addEventListener("click", event => {
		clock.tick();
	});
	untick.addEventListener("click", event => {
		clock.untick();
	});
	enlarge.addEventListener("click", event => {
		clock.enlarge();
	});
	reduce.addEventListener("click", event => {
		clock.reduce();
	});
	
	return div.id;
}

function addClock(clocks, name, positive) {
	const parent = document.getElementById("clock-area");
	const clock = ProgressClock.new(name, positive);
	const clock_id = addClockToParent(parent, clock);
	
	clocks[clock_id] = clock;
	return clocks;
}

let clocks = {};
clocks = addClock(clocks, "Guards Arrive", false);
clocks = addClock(clocks, "You Have Escaped!", true);

// Recursive rendering loop to animate the page.
const renderLoop = () => {
	for(var id in clocks) {
		const clock = clocks[id];
		const div = document.getElementById(id);
		
		const canvas = div.children[2];
		const ctx = canvas.getContext('2d');
		
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawClock(ctx, clock, 0, 0);
	}
	requestAnimationFrame(renderLoop);
};

// Start animating the page.
requestAnimationFrame(renderLoop);
