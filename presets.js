window.App.presets = [
	{
		name: "Solar System",
		init: function(sim) {
			sim.bodies = [];
			sim.elasticBonds = [];
			sim.periodicZones = [];
			sim.enableGravity = true;
			sim.enableElectricity = false;
			sim.enableCollision = true;

			const starMass = 25000;
			const starRadius = Math.log(starMass) * 2;
			sim.addBody(starMass, 0, 0, 0, 0, starRadius, '#ffeeb0', 'Sun', 0, 0, 0, 0, 1, -1, 6000, 0.02);

			const count = 8;
			let dist = 300;

			for(let i=0; i<count; i++) {
				const angle = Math.random() * Math.PI * 2;
				const isGasGiant = i > 3;
				const mass = isGasGiant ? Math.random() * 150 + 80 : Math.random() * 20 + 5;
				const radius = Math.max(2, Math.log(mass) * 2);
				const radiusGap = isGasGiant ? 220 : 100;
				
				dist += radiusGap + Math.random() * 40;
				
				const speed = Math.sqrt((sim.G * starMass) / dist);
				const x = Math.cos(angle) * dist;
				const y = Math.sin(angle) * dist;
				const vx = -Math.sin(angle) * speed;
				const vy = Math.cos(angle) * speed;
				
				let color;
				if (i === 2) color = '#4da6ff'; 
				else if (i === 3) color = '#c95b42';
				else if (isGasGiant) color = `hsl(${Math.random() * 50 + 20}, 70%, 60%)`;
				else color = `hsl(${Math.random() * 40}, 30%, 60%)`;

				const name = `Planet ${i+1}`;
				sim.addBody(mass, x, y, vx, vy, radius, color, name);

				if (mass > 60) {
					const moons = Math.floor(Math.random() * 2) + 1;
					for (let m = 0; m < moons; m++) {
						const mDist = 25 + m * 12 + Math.random() * 5 + Math.sqrt(mass);
						const mSpeed = Math.sqrt((sim.G * mass) / mDist);
						const mAngle = Math.random() * Math.PI * 2;
						const clockwise = Math.random() > 0.5 ? 1 : -1;
						
						const mx = x + Math.cos(mAngle) * mDist;
						const my = y + Math.sin(mAngle) * mDist;
						
						const mvx = vx - Math.sin(mAngle) * mSpeed * clockwise;
						const mvy = vy + Math.cos(mAngle) * mSpeed * clockwise;
						
						const moonMass = Math.random() * 1.5 + 0.5;
						const moonRad = Math.max(2, Math.log(moonMass) * 2);
						sim.addBody(moonMass, mx, my, mvx, mvy, moonRad, '#d1d1d1', `${name}-m${m+1}`);
					}
				}
			}
		}
	},
	{
		name: "Binary Star System",
		init: function(sim) {
			sim.bodies = [];
			sim.elasticBonds = [];
			sim.periodicZones = [];
			sim.enableGravity = true;
			sim.enableCollision = true;
			
			const mass = 15000;
			const radius = Math.log(mass) * 2;
			const dist = 400;
			const v = Math.sqrt((sim.G * mass) / (4 * dist)); 

			sim.addBody(mass, -dist, 0, 0, v, radius, '#ffcc00', 'Star A', 0, 0, 0, 0, 1, -1, 5000, 0.01);
			sim.addBody(mass, dist, 0, 0, -v, radius, '#ffaa00', 'Star B', 0, 0, 0, 0, 1, -1, 5000, 0.01);
			
			for (let i = 0; i < 40; i++) {
				const d = dist * 2 + Math.random() * 500;
				const angle = Math.random() * Math.PI * 2;
				const asteroidMass = Math.random() * 5 + 1;
				const astRad = Math.max(2, Math.log(asteroidMass) * 2);
				
				const speed = Math.sqrt((sim.G * 2 * mass) / d);
				
				const x = Math.cos(angle) * d;
				const y = Math.sin(angle) * d;
				const vx = -Math.sin(angle) * speed;
				const vy = Math.cos(angle) * speed;
				
				sim.addBody(asteroidMass, x, y, vx, vy, astRad, '#888', `Asteroid ${i}`);
			}
		}
	},
	{
		name: "Random Cloud",
		init: function(sim) {
			sim.bodies = [];
			sim.elasticBonds = [];
			sim.enableGravity = true;
			sim.enableCollision = true;
			
			for (let i = 0; i < 40; i++) {
				const x = (Math.random() - 0.5) * 1200;
				const y = (Math.random() - 0.5) * 800;
				const vx = (Math.random() - 0.5) * 1.5;
				const vy = (Math.random() - 0.5) * 1.5;
				const mass = Math.random() * 40 + 5;
				const radius = Math.max(2, Math.log(mass) * 2);
				const color = `hsl(${Math.random() * 360}, 60%, 60%)`;
				sim.addBody(mass, x, y, vx, vy, radius, color, `Body ${i}`);
			}
		}
	},
	{
		name: "Galaxy Collision",
		init: function(sim) {
			sim.bodies = [];
			sim.elasticBonds = [];
			sim.enableGravity = true;
			
			const createGalaxy = (cx, cy, cvx, cvy, numStars, radius, colorBase) => {
				const coreMass = 15000;
				const coreRad = Math.log(coreMass) * 2;
				sim.addBody(coreMass, cx, cy, cvx, cvy, coreRad, '#fff', 'Core', 0, 0, 0, 0, 0.5);
				
				for(let i=0; i<numStars; i++) {
					const angle = Math.random() * Math.PI * 2;
					const dist = 60 + Math.random() * radius;
					const velocity = Math.sqrt((sim.G * coreMass) / dist);
					
					const x = cx + Math.cos(angle) * dist;
					const y = cy + Math.sin(angle) * dist;
					
					const vx = cvx - Math.sin(angle) * velocity;
					const vy = cvy + Math.cos(angle) * velocity;
					
					const starMass = Math.random() * 2 + 1;
					const starRad = Math.max(2, Math.log(starMass) * 2);
					sim.addBody(starMass, x, y, vx, vy, starRad, `hsl(${colorBase + Math.random()*40}, 70%, 70%)`, 'Star');
				}
			};
			
			createGalaxy(-400, 0, 1.0, 0.5, 50, 350, 200);
			createGalaxy(400, 0, -1.0, -0.5, 50, 350, 0);
		}
	},
    {
        name: "Artificial Gravity Box",
        init: function(sim) {
            sim.bodies = [];
            sim.enableGravity = false;
            sim.enableCollision = true;
            sim.enableElectricity = false;
            
            sim.addFieldZone(-350, -500, 700, 800, 0, 0.3, 'rgba(46, 204, 113, 0.8)', 'Gravity Field');
            
            sim.addSolidBarrier(-350, 300, 350, 300, 0.8, '#e74c3c', 'Floor');
            sim.addSolidBarrier(-350, -300, -350, 300, 0.8, '#c0392b', 'Wall L');
            sim.addSolidBarrier(350, -300, 350, 300, 0.8, '#c0392b', 'Wall R');
            sim.addSolidBarrier(-200, 100, 200, 200, 0.7, '#8e44ad', 'Bouncer');

            for (let i = 0; i < 4; i++) {
                const m = 20 + Math.random() * 30;
                const r = Math.max(2, Math.log(m) * 2);
                sim.addBody(
                    m, 
                    -250 + Math.random() * 500, 
                    -250 + Math.random() * 100, 
                    (Math.random() - 0.5) * 0.1, 
                    (Math.random() - 0.5) * 0.1, 
                    r,
                    `hsl(${Math.random() * 360}, 70%, 60%)`, 
                    `Ball ${i}`, 
                    0, 0, 0, 0, 
                    0.9
                );
            }
        }
    },
	{
		name: "Lattice Structure",
		init: function(sim) {
			sim.bodies = [];
			sim.elasticBonds = [];
			sim.enableGravity = false;
			
			const rows = 7;
			const cols = 7;
			const spacing = 80;
			const startX = -(cols * spacing) / 2;
			const startY = -(rows * spacing) / 2;
			
			for(let r=0; r<rows; r++) {
				for(let c=0; c<cols; c++) {
					const x = startX + c * spacing;
					const y = startY + r * spacing;
					
					let fixed = (r === 0);
					const color = fixed ? '#555' : '#3498db';
					const mass = fixed ? -1 : 30;
					
					sim.addBody(mass, x, y, 0, 0, 5, color, `Node ${r}-${c}`);
				}
			}
			
			const getIdx = (r, c) => r * cols + c;
			
			for(let r=0; r<rows; r++) {
				for(let c=0; c<cols; c++) {
					const idx = getIdx(r, c);
					
					if (c < cols - 1) sim.addElasticBond(idx, getIdx(r, c+1), 40, spacing, 1.0);
					if (r < rows - 1) sim.addElasticBond(idx, getIdx(r+1, c), 40, spacing, 1.0);
					if (c < cols - 1 && r < rows - 1) {
						 sim.addElasticBond(idx, getIdx(r+1, c+1), 40, spacing * Math.sqrt(2), 1.0);
						 sim.addElasticBond(getIdx(r, c+1), getIdx(r+1, c), 40, spacing * Math.sqrt(2), 1.0);
					}
				}
			}
		}
	},
	{
		name: "Hydrogen (Bohr)",
		init: function(sim) {
			sim.bodies = [];
			sim.enableGravity = false;
			sim.enableElectricity = true;
			sim.enableCollision = false;
			
			sim.addBody(20000, 0, 0, 0, 0, 15, '#e74c3c', 'Proton', 0, 0, 50);

			const orbitR = 200;
			const electronMass = 10;
			const electronCharge = -10;
			
			const force = (sim.Ke * Math.abs(50 * electronCharge)) / (orbitR * orbitR);
			const velocity = Math.sqrt((force * orbitR) / electronMass);

			sim.addBody(electronMass, orbitR, 0, 0, velocity, 5, '#3498db', 'Electron', 0, 0, electronCharge);
		}
	},
    {
        name: "Viscosity Stream",
        init: function(sim) {
            sim.bodies = [];
            sim.enableGravity = false;
            sim.enableCollision = true;
            
            sim.addViscosityZone(-100, -300, 200, 600, 0.8, 'rgba(52, 152, 219, 0.3)');
            sim.addSolidBarrier(-100, -100, 100, 100, 1.0, '#fff', 'Obstacle');
            
            for(let i=0; i<50; i++) {
                sim.addBody(
                    5, 
                    -500 - Math.random() * 200, 
                    (Math.random() - 0.5) * 400, 
                    15 + Math.random() * 5, 
                    0, 
                    3,
                    '#2ecc71', 
                    `Particle ${i}`
                );
            }
        }
    },
    {
        name: "Gas Chamber (Periodic)",
        init: function(sim) {
            sim.bodies = [];
            sim.enableGravity = false;
            sim.enableCollision = true;
            
            const w = 600;
            const h = 400;
            sim.addPeriodicZone(-w/2, -h/2, w, h, '#e67e22', 'center');
            
            for(let i=0; i<80; i++) {
                sim.addBody(
                    5, 
                    (Math.random() - 0.5) * (w - 20), 
                    (Math.random() - 0.5) * (h - 20), 
                    (Math.random() - 0.5) * 8, 
                    (Math.random() - 0.5) * 8, 
                    5,
                    `hsl(${Math.random() * 60 + 200}, 80%, 60%)`, 
                    `Mol ${i}`,
                    0, 0, 0, 0, 0.2
                );
            }
        }
    },
    {
        name: "Electromagnetic Trap",
        init: function(sim) {
            sim.bodies = [];
            sim.enableGravity = false;
            sim.enableElectricity = true;
            sim.enableMagnetism = true;
            
            sim.addBody(5000, 0, 0, 0, 0, 20, '#f1c40f', 'Core +', 0, 0, 200, 0, 1, -1);
            
            const count = 12;
            const r = 250;
            const v = -5;
            for(let i=0; i<count; i++) {
                const angle = (i / count) * Math.PI * 2;
                sim.addBody(
                    1000, 
                    Math.cos(angle) * r, 
                    Math.sin(angle) * r, 
                    Math.cos(angle) * v, 
                    Math.sin(angle) * v, 
                    10,
                    '#e74c3c', 
                    `Magnet ${i}`, 
                    0, 0, -200, 200, 1, -1
                );
            }
            
            for(let i=0; i<20; i++) {
                sim.addBody(
                    10, 
                    (Math.random() - 0.5) * 100, 
                    (Math.random() - 0.5) * 100, 
                    (Math.random() - 0.5) * 15, 
                    (Math.random() - 0.5) * 15, 
                    3,
                    '#3498db', 
                    `Electron ${i}`, 
                    0, 0, -5, 0
                );
            }
        }
    },
	{
		name: "Newton's Cradle",
		init: function(sim) {
			sim.bodies = [];
			sim.elasticBonds = [];
			sim.enableGravity = false;
			sim.enableCollision = true;

			const balls = 5;
			const radius = 20;
			const spacing = radius * 2 + 0.1;
			const stringLen = 200;
			const startX = -((balls - 1) * spacing) / 2;
			const y = 100;

			for (let i = 0; i < balls; i++) {
				const x = startX + i * spacing;
				
				sim.addBody(-1, x, y - stringLen, 0, 0, 1, '#555', 'Anchor');
				
				let bx = x;
				let by = y;
				let vx = 0;
				
				if (i === 0) {
					bx = x - Math.sqrt(2)*100;
					by = y - Math.sqrt(2)*100;
				}
				
				sim.addBody(5, bx, by, vx, 0, radius, '#ccc', `Ball ${i}`, 0.5, 0, 0, 0, 1500);
				
				sim.addElasticBond(i*2, i*2+1, {
					type: 'chain',
					stiffness: 100,
					damping: 5000,
					length: stringLen,
					color: '#fff'
				});
			}
			sim.addFieldZone(-600, -300, 1200, 700, 0, 1, 'rgba(10, 200, 20, 0.8)', 'Gravity Field');
		}
	},
	{
		name: "Soft Body Jelly",
		init: function(sim) {
			sim.bodies = [];
			sim.elasticBonds = [];
			sim.enableGravity = false;
			sim.enableCollision = true;

			const rows = 6;
			const cols = 6;
			const spacing = 120;
			const startX = -(cols * spacing) / 2;
			const startY = -500;

			const getIdx = (r, c) => r * cols + c;

			for(let r=0; r<rows; r++) {
				for(let c=0; c<cols; c++) {
					sim.addBody(20, startX + c*spacing, startY + r*spacing, 0, 0, 8, '#e74c3c', 'Node', 0, 0, 0, 0, 0.5);
				}
			}

			const k = 2000;
			const d = 5000;

			for(let r=0; r<rows; r++) {
				for(let c=0; c<cols; c++) {
					const idx = getIdx(r, c);
					if (c < cols - 1) sim.addElasticBond(idx, getIdx(r, c+1), k, spacing, d);
					if (r < rows - 1) sim.addElasticBond(idx, getIdx(r+1, c), k, spacing, d);
					if (c < cols - 1 && r < rows - 1) {
						sim.addElasticBond(idx, getIdx(r+1, c+1), k, spacing * 1.414, d);
						sim.addElasticBond(getIdx(r, c+1), getIdx(r+1, c), k, spacing * 1.414, d);
					}
				}
			}
		}
	},
	{
		name: "Muscle Crawler",
		init: function(sim) {
			sim.bodies = [];
			sim.elasticBonds = [];
			sim.enableGravity = false;
			sim.enableCollision = true;

			const groundY = 200;
			sim.addSolidBarrier(-600, groundY, 600, groundY, 0.5, '#fff', 'Floor');
			sim.addSolidBarrier(-600, groundY+1, 600, groundY, 0.5, '#fff', 'Floor 2');

			const segments = 6;
			const spacing = 40;
			const startX = -100;
			const y = groundY - 30;

			for(let i=0; i<segments; i++) {
				sim.addBody(10, startX + i*spacing, y, 0, 0, 10, '#f1c40f', `Node ${i}`);
				
				if (i > 0) {
					sim.addElasticBond(i-1, i, {
						stiffness: 500,
						damping: 200,
						length: spacing,
						type: 'spring'
					});
					
					if (i > 1) {
						sim.addElasticBond(i-2, i, {
							stiffness: 50,
							damping: 10,
							length: spacing * 1.8,
							type: 'spring',
							activeAmp: 0.2,
							activeFreq: 10*15.0 + i * 2, 
							color: '#e74c3c',
							name: 'Muscle'
						});
					}
				}
				
				sim.addBody(5, startX + i*spacing, y + 25, 0, 0, 5, '#888', `Foot ${i}`);
				sim.addElasticBond(i*2, i*2+1, { stiffness: 80, damping: 2, length: 25 });
				if (i > 0) {
					sim.addElasticBond((i-1)*2+1, i*2+1, { stiffness: 5, damping: 5, length: spacing });
				}
			}
			
			sim.addFieldZone(-600, -300, 1200, 700, 0, 1, 'rgba(10, 200, 20, 0.8)', 'Gravity Field');
		}
	},
	{
		name: "Breakable Tower",
		init: function(sim) {
			sim.bodies = [];
			sim.elasticBonds = [];
			sim.enableGravity = false;
			sim.enableCollision = true;

			sim.addSolidBarrier(-600, 300, 600, 300, 0.5, '#fff', 'Floor');

			const rows = 10;
			const cols = 4;
			const w = 40;
			const h = 40;
			const startX = 100;
			const startY = 280;

			const getIdx = (r, c) => r * cols + c;

			for(let r=0; r<rows; r++) {
				for(let c=0; c<cols; c++) {
					const fixed = (r === 0);
					sim.addBody(fixed ? -1 : 10, startX + c*w, startY - r*h, 0, 0, 5, '#ecf0f1', 'Brick');
				}
			}

			for(let r=0; r<rows; r++) {
				for(let c=0; c<cols; c++) {
					const idx = getIdx(r, c);
					const config = { stiffness: 200, damping: 2, breakTension: 150, color: '#95a5a6' };
					
					if (c < cols - 1) sim.addElasticBond(idx, getIdx(r, c+1), { ...config, length: w });
					if (r < rows - 1) sim.addElasticBond(idx, getIdx(r+1, c), { ...config, length: h });
					if (c < cols - 1 && r < rows - 1) {
						sim.addElasticBond(idx, getIdx(r+1, c+1), { ...config, length: Math.sqrt(w*w+h*h), stiffness: 100 });
						sim.addElasticBond(getIdx(r, c+1), getIdx(r+1, c), { ...config, length: Math.sqrt(w*w+h*h), stiffness: 100 });
					}
				}
			}

			sim.addBody(300, -300, 0, 30, 0, 25, '#2c3e50', 'Wrecking Ball');
			
			sim.addFieldZone(-600, -300, 1200, 700, 0, 0.1, 'rgba(10, 200, 20, 0.8)', 'Gravity Field');
		}
	},
	{
		name: "Cloth Simulation",
		init: function(sim) {
			sim.bodies = [];
			sim.elasticBonds = [];
            sim.enableGravity = false;
            sim.enableCollision = false;

			const rows = 8;
			const cols = 7;
			const spacing = 30;
			const startX = -(cols * spacing) / 2;
			const startY = -200;

			const getIdx = (r, c) => r * cols + c;

			for(let r=0; r<rows; r++) {
				for(let c=0; c<cols; c++) {
					const fixed = (r === 0); 
					sim.addBody(fixed ? -1 : 2, startX + c*spacing, startY + r*spacing, 0, 0, 3, '#fff', 'Node');
				}
			}

			const config = { stiffness: 400, damping: 5, type: 'rope', color: 'rgba(255,255,255,0.3)' };

			for(let r=0; r<rows; r++) {
				for(let c=0; c<cols; c++) {
					const idx = getIdx(r, c);
					if (c < cols - 1) sim.addElasticBond(idx, getIdx(r, c+1), { ...config, length: spacing });
					if (r < rows - 1) sim.addElasticBond(idx, getIdx(r+1, c), { ...config, length: spacing });
				}
			}
			
			sim.addFieldZone(-150, -270, 320, 350, 0, 0.1, 'rgba(10, 200, 20, 0.8)', 'Gravity Field');
		}
	},
    {
        name: "Chain Link",
        init: function(sim) {
            sim.bodies = [];
            sim.elasticBonds = [];
            sim.enableGravity = false;
            sim.enableCollision = false;
            
            const segments = 15;
            const len = 30;
            
            sim.addBody(-1, 0, -250, 0, 0, 10, '#fff', 'Anchor');
            
            for(let i=1; i<=segments; i++) {
                sim.addBody(5, i * 5, -250 + i * len, 0, 0, 5, '#bdc3c7', `Link ${i}`);
                sim.addElasticBond(i-1, i, {
                    type: 'chain',
                    length: len,
                    stiffness: 800,
                    damping: 2,
                    nonLinearity: 1.5,
                    color: '#7f8c8d'
                });
            }
            
            sim.addBody(50, segments * 5, -250 + (segments + 1) * len, 0, 0, 20, '#e67e22', 'Weight');
            sim.addElasticBond(segments, segments + 1, {
                type: 'chain',
                length: len,
                stiffness: 800,
                damping: 200
            });
			
			sim.addFieldZone(-1000, -1000, 2000, 2000, 0, 0.1, 'rgba(10, 200, 20, 0.8)', 'Gravity Field');
        }
    }
];