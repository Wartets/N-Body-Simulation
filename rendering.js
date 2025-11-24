const Rendering = {
	canvas: null,
	ctx: null,
	width: 0,
	height: 0,
	
	camX: 0,
	camY: 0,
	zoom: 1,
	
	isDragging: false,
	lastMouseX: 0,
	lastMouseY: 0,
	
	enableTracking: false,
	enableAutoZoom: false,
	userZoomFactor: 1.0, 

	gridDetail: 34,
	gridDistortion: 2.4,
	gridMinDist: 80,

	init: function() {
		this.canvas = document.getElementById('simCanvas');
		this.ctx = this.canvas.getContext('2d');
		
		window.addEventListener('resize', () => this.resize());
		this.resize();
		
		this.setupInputs();
		this.loop();
	},

	resize: function() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.canvas.width = this.width;
		this.canvas.height = this.height;
	},

	setupInputs: function() {
		this.canvas.addEventListener('wheel', (e) => {
			e.preventDefault();
			
			const zoomIntensity = 0.1;
			const delta = e.deltaY < 0 ? 1 : -1;
			const factor = Math.exp(delta * zoomIntensity);

			if (this.enableAutoZoom) {
				this.userZoomFactor *= factor;
			} else {
				const mouseWorldX = (e.clientX - this.width/2 - this.camX) / this.zoom;
				const mouseWorldY = (e.clientY - this.height/2 - this.camY) / this.zoom;

				this.zoom *= factor;

				if (!this.enableTracking) {
					this.camX = e.clientX - this.width/2 - mouseWorldX * this.zoom;
					this.camY = e.clientY - this.height/2 - mouseWorldY * this.zoom;
				}
			}
		});

		this.canvas.addEventListener('mousedown', (e) => {
			if (this.enableTracking) return; 
			this.isDragging = true;
			this.lastMouseX = e.clientX;
			this.lastMouseY = e.clientY;
			this.canvas.style.cursor = 'grabbing';
		});

		window.addEventListener('mousemove', (e) => {
			if (this.isDragging && !this.enableTracking) {
				const dx = e.clientX - this.lastMouseX;
				const dy = e.clientY - this.lastMouseY;
				this.camX += dx;
				this.camY += dy;
				this.lastMouseX = e.clientX;
				this.lastMouseY = e.clientY;
			}
		});

		window.addEventListener('mouseup', () => {
			this.isDragging = false;
			this.canvas.style.cursor = 'default';
		});
	},

	updateAutoCam: function(bodies) {
		if (!bodies.length) return;

		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		let totalMass = 0;
		let comX = 0; 
		let comY = 0;

		bodies.forEach(b => {
			if (b.x < minX) minX = b.x;
			if (b.x > maxX) maxX = b.x;
			if (b.y < minY) minY = b.y;
			if (b.y > maxY) maxY = b.y;
			
			if (this.enableTracking) {
				comX += b.x * b.mass;
				comY += b.y * b.mass;
				totalMass += b.mass;
			}
		});

		if (this.enableTracking && totalMass > 0) {
			const targetX = -(comX / totalMass) * this.zoom;
			const targetY = -(comY / totalMass) * this.zoom;
			
			const posSmooth = 0.1;
			this.camX += (targetX - this.camX) * posSmooth;
			this.camY += (targetY - this.camY) * posSmooth;
		}

		if (this.enableAutoZoom) {
			const sceneW = Math.max(maxX - minX, 100);
			const sceneH = Math.max(maxY - minY, 100);
			const margin = 0.6;
			
			const scaleX = (this.width * margin) / sceneW;
			const scaleY = (this.height * margin) / sceneH;
			
			let fitZoom = Math.min(scaleX, scaleY);
			
			const targetZoom = fitZoom * this.userZoomFactor;

			let zoomSmooth = 0.02; 
			if (targetZoom < this.zoom) {
				zoomSmooth = 0.1;
			}

			this.zoom += (targetZoom - this.zoom) * zoomSmooth;
			
			if (Math.abs(targetZoom - this.zoom) < 0.0001) {
				this.zoom = targetZoom;
			}
		}
	},
	
	drawBarycenter: function(bodies) {
		if (!bodies.length) return;
		
		let totalMass = 0;
		let comX = 0; 
		let comY = 0;

		for (let b of bodies) {
			comX += b.x * b.mass;
			comY += b.y * b.mass;
			totalMass += b.mass;
		}

		if (totalMass === 0) return;

		const x = comX / totalMass;
		const y = comY / totalMass;
		
		const size = 6 / this.zoom;

		this.ctx.fillStyle = 'rgba(120, 120, 120, 0.8)';
		
		this.ctx.beginPath();
		this.ctx.moveTo(x, y - size);
		this.ctx.lineTo(x + size, y);
		this.ctx.lineTo(x, y + size);
		this.ctx.lineTo(x - size, y);
		this.ctx.closePath();
		this.ctx.fill();
	},
	
	drawTrails: function(bodies) {
		if (!window.App.sim.showTrails) return;

		this.ctx.lineWidth = 1 / this.zoom;
		this.ctx.lineCap = 'round';
		this.ctx.lineJoin = 'round';

		for (let b of bodies) {
			if (b.path.length < 2) continue;

			this.ctx.strokeStyle = b.color;
			
			for (let i = 0; i < b.path.length - 1; i++) {
				const p1 = b.path[i];
				const p2 = b.path[i+1];
				
				this.ctx.beginPath();
				this.ctx.globalAlpha = (i / b.path.length); 
				this.ctx.moveTo(p1.x, p1.y);
				this.ctx.lineTo(p2.x, p2.y);
				this.ctx.stroke();
			}
		}
		this.ctx.globalAlpha = 1.0;
	},
	
	draw: function() {
		window.App.sim.update();

		if (this.enableTracking || this.enableAutoZoom) {
			this.updateAutoCam(window.App.sim.bodies);
		}

		if (window.App.ui && window.App.ui.syncInputs) {
			window.App.ui.syncInputs();
		}
		
		this.ctx.fillStyle = 'black';
		this.ctx.fillRect(0, 0, this.width, this.height);

		this.ctx.save();

		this.ctx.translate(this.width / 2 + this.camX, this.height / 2 + this.camY);
		this.ctx.scale(this.zoom, this.zoom);

		this.drawGrid();
		this.drawBarycenter(window.App.sim.bodies);
		this.drawTrails(window.App.sim.bodies);

		const bodies = window.App.sim.bodies;
		for (let b of bodies) {
			this.ctx.beginPath();
			this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
			this.ctx.fillStyle = b.color;
			this.ctx.fill();
			
			this.ctx.shadowBlur = 10;
			this.ctx.shadowColor = b.color;
			this.ctx.fill();
			this.ctx.shadowBlur = 0;
		}

		this.ctx.restore();
	},

	applyDistortion: function(x, y) {
		if (this.gridDistortion <= 0.01) return {x, y};

		let dx = 0;
		let dy = 0;
		const bodies = window.App.sim.bodies;
		const scaleFactor = 1.0; 
		const smoothSq = this.gridMinDist * this.gridMinDist;

		for (let b of bodies) {
			const vx = b.x - x;
			const vy = b.y - y;
			const distSq = vx*vx + vy*vy;
			
			const weight = (b.mass * this.gridDistortion * scaleFactor) / (distSq + smoothSq);
			
			dx += vx * weight;
			dy += vy * weight;
		}

		return { x: x + dx, y: y + dy };
	},

	drawGrid: function() {
		const vpW = this.width / this.zoom;
		const vpH = this.height / this.zoom;
		
		const left = -this.camX - vpW / 2;
		const right = -this.camX + vpW / 2;
		const top = -this.camY - vpH / 2;
		const bottom = -this.camY + vpH / 2;

		const logStep = Math.log10(200 / this.zoom);
		const step = Math.pow(10, Math.floor(logStep));
		
		const curveQuality = Math.max(4, 60 - (this.gridDetail * 0.5));
		const subStep = curveQuality / this.zoom; 
		
		const margin = step * 5;

		this.ctx.strokeStyle = '#212221';
		this.ctx.lineWidth = 0.5 / this.zoom;
		this.ctx.beginPath();

		const startX = Math.floor((left - margin) / step) * step;
		const endX = Math.ceil((right + margin) / step) * step;
		const startY = Math.floor((top - margin) / step) * step;
		const endY = Math.ceil((bottom + margin) / step) * step;

		for (let x = startX; x <= endX; x += step) {
			let first = true;
			for (let y = top - margin; y <= bottom + margin; y += subStep) {
				const p = this.applyDistortion(x, y);
				if (first) { this.ctx.moveTo(p.x, p.y); first = false; }
				else { this.ctx.lineTo(p.x, p.y); }
			}
			const pEnd = this.applyDistortion(x, bottom + margin);
			this.ctx.lineTo(pEnd.x, pEnd.y);
		}

		for (let y = startY; y <= endY; y += step) {
			let first = true;
			for (let x = left - margin; x <= right + margin; x += subStep) {
				const p = this.applyDistortion(x, y);
				if (first) { this.ctx.moveTo(p.x, p.y); first = false; }
				else { this.ctx.lineTo(p.x, p.y); }
			}
			const pEnd = this.applyDistortion(right + margin, y);
			this.ctx.lineTo(pEnd.x, pEnd.y);
		}

		this.ctx.stroke();
	},
	
	loop: function() {
		this.draw();
		requestAnimationFrame(() => this.loop());
	}
};

window.App.render = Rendering;