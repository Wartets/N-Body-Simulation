window.App = {
	sim: null,
	render: null,
	ui: null
};

class Body {
	constructor(mass, x, y, vx, vy, color) {
		this.mass = mass;
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.ax = 0;
		this.ay = 0;
		this.radius = Math.max(2, Math.log(mass) * 2);
		this.color = color || `hsl(${Math.random() * 360}, 70%, 60%)`;
		this.path = [];
	}
}

const Simulation = {
	bodies: [],
	G: 0.5,
	c: 50.0,
	dt: 1.0,
	paused: false,
	maxRadius: 0,
	
	showTrails: true,
	trailLength: 100,
	trailStep: 2,
	tickCount: 0,

	init: function() {
		this.reset();
	},

	reset: function() {
		this.bodies = [];
		this.addBody(2000, 0, 0, 0, 0, `hsl(${Math.random() * 360}, 70%, 60%)`);
	},

	addBody: function(m, x, y, vx, vy, col) {
		this.bodies.push(new Body(m, x, y, vx, vy, col));
	},

	update: function() {
		if (this.paused) return;

		const bodies = this.bodies;
		const count = bodies.length;
		const c2 = this.c * this.c;

		this.tickCount++;

		for (let i = 0; i < count; i++) {
			bodies[i].ax = 0;
			bodies[i].ay = 0;
		}

		for (let i = 0; i < count; i++) {
			for (let j = i + 1; j < count; j++) {
				const b1 = bodies[i];
				const b2 = bodies[j];

				const dx = b2.x - b1.x;
				const dy = b2.y - b1.y;
				const distSq = dx*dx + dy*dy;
				const dist = Math.sqrt(distSq);

				if (dist < (b1.radius + b2.radius) / 2) {
					continue;
				}

				let f_newton = (this.G * b1.mass * b2.mass) / distSq;
				const correctionFactor = 1 + (3 * (b1.mass + b2.mass)) / (dist * c2);
				const f_total = f_newton * correctionFactor;

				const fx = f_total * (dx / dist);
				const fy = f_total * (dy / dist);

				b1.ax += fx / b1.mass;
				b1.ay += fy / b1.mass;
				b2.ax -= fx / b2.mass;
				b2.ay -= fy / b2.mass;
			}
		}
	
		for (let i = 0; i < count; i++) {
			const b = bodies[i];

			b.vx += b.ax * this.dt;
			b.vy += b.ay * this.dt;

			const vSq = b.vx*b.vx + b.vy*b.vy;
			if (vSq > c2) {
				const v = Math.sqrt(vSq);
				const ratio = (this.c * 0.99) / v;
				b.vx *= ratio;
				b.vy *= ratio;
			}

			b.x += b.vx * this.dt;
			b.y += b.vy * this.dt;

			if (this.showTrails && (this.tickCount % this.trailStep === 0)) {
				b.path.push({x: b.x, y: b.y});
				if (b.path.length > this.trailLength) {
					b.path.shift();
				}
			} else if (!this.showTrails && b.path.length > 0) {
				b.path = [];
			}
		}

		this.maxRadius = bodies.reduce((max, b) => Math.max(max, Math.sqrt(b.x*b.x + b.y*b.y)), 0);
	},

	createSolarSystem: function() {
		this.bodies = [];
		this.addBody(5000, 0, 0, 0, 0, '#ffffff');

		for(let i=1; i<=5; i++) {
			let r = i * 120;
			let v = Math.sqrt((this.G * 5000) / r);
			this.addBody(Math.random() * 50 + 10, r, 0, 0, v * 1.1, null);
		}
	}
};

window.App.sim = Simulation;
Simulation.init();