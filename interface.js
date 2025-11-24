document.addEventListener('DOMContentLoaded', () => {
	const Sim = window.App.sim;
	const Render = window.App.render;

	const panel = document.getElementById('controlPanel');
	const header = document.getElementById('panelHeader');
	const toggleBtn = document.getElementById('togglePanelBtn');
	let isDraggingPanel = false;
	let panelOffsetX = 0, panelOffsetY = 0;

	header.addEventListener('mousedown', (e) => {
		if(e.target.closest('button')) return; 
		isDraggingPanel = true;
		const rect = panel.getBoundingClientRect();
		panelOffsetX = e.clientX - rect.left;
		panelOffsetY = e.clientY - rect.top;
		header.style.cursor = 'grabbing';
	});

	window.addEventListener('mousemove', (e) => {
		if (isDraggingPanel) {
			let newX = e.clientX - panelOffsetX;
			let newY = e.clientY - panelOffsetY;
			newX = Math.max(0, Math.min(window.innerWidth - panel.offsetWidth, newX));
			newY = Math.max(0, Math.min(window.innerHeight - header.offsetHeight, newY));
			panel.style.left = newX + 'px';
			panel.style.top = newY + 'px';
		}
	});

	window.addEventListener('mouseup', () => { isDraggingPanel = false; header.style.cursor = 'grab'; });

	toggleBtn.addEventListener('click', () => {
		panel.classList.toggle('collapsed');
		toggleBtn.innerHTML = panel.classList.contains('collapsed') ? '<i class="fa-solid fa-plus"></i>' : '<i class="fa-solid fa-minus"></i>';
	});

	const toggleInjBtn = document.getElementById('toggleInjectionBtn');
	const injContent = document.getElementById('injectionContent');
	toggleInjBtn.addEventListener('click', () => {
		injContent.classList.toggle('hidden-content');
		toggleInjBtn.innerHTML = injContent.classList.contains('hidden-content') ? '<i class="fa-solid fa-chevron-left"></i>' : '<i class="fa-solid fa-chevron-down"></i>';
	});
	
	const toggleDisplayBtn = document.getElementById('toggleDisplayBtn');
	const displayContent = document.getElementById('displayContent');
	if (toggleDisplayBtn) {
		toggleDisplayBtn.addEventListener('click', () => {
			displayContent.classList.toggle('hidden-content');
			toggleDisplayBtn.innerHTML = displayContent.classList.contains('hidden-content') ? '<i class="fa-solid fa-chevron-left"></i>' : '<i class="fa-solid fa-chevron-down"></i>';
		});
	}
	
	const bodiesContainer = document.getElementById('bodiesListContainer');
	const bodyCountLabel = document.getElementById('bodyCount');

	const toggleBodiesBtn = document.getElementById('toggleBodiesBtn');
	const bodiesHeader = document.getElementById('bodiesHeader');

	const toggleBodiesList = () => {
		bodiesContainer.classList.toggle('hidden-content');
		if (toggleBodiesBtn) {
			toggleBodiesBtn.innerHTML = bodiesContainer.classList.contains('hidden-content') ? '<i class="fa-solid fa-chevron-left"></i>' : '<i class="fa-solid fa-chevron-down"></i>';
		}
	};

	if (toggleBodiesBtn) {
		toggleBodiesBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			toggleBodiesList();
		});
	}
	
	if (bodiesHeader) {
		bodiesHeader.addEventListener('click', toggleBodiesList);
	}

	function createBodyCard(body, index) {
		const div = document.createElement('div');
		div.className = 'body-card';
		div.style.borderLeftColor = body.color;
		div.dataset.index = index;

		div.innerHTML = `
			<div class="card-header">
				<span class="body-id">
					<span class="body-color-dot" style="background-color: ${body.color}; box-shadow: 0 0 5px ${body.color}"></span>
					BODY ${index + 1}
				</span>
				<button class="btn-delete" title="Supprimer"><i class="fa-solid fa-trash"></i></button>
			</div>
			<div class="card-grid">
				<div class="mini-input-group">
					<label>Mass</label>
					<input type="number" class="inp-mass" value="${Math.round(body.mass)}" step="10">
				</div>
				<div class="mini-input-group">
					<label>Radius</label>
					<input type="number" class="inp-radius" value="${body.radius.toFixed(1)}" step="0.5">
				</div>
				<div class="mini-input-group">
					<label>Position X</label>
					<input type="number" class="inp-x" value="${body.x.toFixed(1)}">
				</div>
				<div class="mini-input-group">
					<label>Position Y</label>
					<input type="number" class="inp-y" value="${body.y.toFixed(1)}">
				</div>
				<div class="mini-input-group">
					<label>Velocity X</label>
					<input type="number" class="inp-vx" value="${body.vx.toFixed(2)}" step="0.1">
				</div>
				<div class="mini-input-group">
					<label>Velocity Y</label>
					<input type="number" class="inp-vy" value="${body.vy.toFixed(2)}" step="0.1">
				</div>
			</div>
		`;

		div.querySelector('.btn-delete').addEventListener('click', () => {
			Sim.bodies.splice(index, 1);
			refreshBodyList();
		});

		const inpMass = div.querySelector('.inp-mass');
		const inpRadius = div.querySelector('.inp-radius');
		const inpX = div.querySelector('.inp-x');
		const inpY = div.querySelector('.inp-y');
		const inpVX = div.querySelector('.inp-vx');
		const inpVY = div.querySelector('.inp-vy');

		const updatePhysics = () => {
			body.mass = parseFloat(inpMass.value) || 1;
			body.radius = parseFloat(inpRadius.value) || 2;
			
			body.x = parseFloat(inpX.value) || 0;
			body.y = parseFloat(inpY.value) || 0;
			body.vx = parseFloat(inpVX.value) || 0;
			body.vy = parseFloat(inpVY.value) || 0;
		};

		[inpMass, inpRadius, inpX, inpY, inpVX, inpVY].forEach(inp => {
			inp.addEventListener('change', updatePhysics);
			inp.addEventListener('input', updatePhysics);
		});

		return div;
	}

	function refreshBodyList() {
		bodiesContainer.innerHTML = '';
		bodyCountLabel.textContent = Sim.bodies.length;
		
		Sim.bodies.forEach((body, index) => {
			bodiesContainer.appendChild(createBodyCard(body, index));
		});
	}

	const originalAddBody = Sim.addBody.bind(Sim);
	Sim.addBody = function(...args) {
		originalAddBody(...args);
		refreshBodyList();
	};

	const originalReset = Sim.reset.bind(Sim);
	Sim.reset = function() {
		originalReset();
		refreshBodyList();
	};
	
	window.App.ui = {
		syncInputs: function() {
			const cards = bodiesContainer.children;
			for (let i = 0; i < cards.length; i++) {
				const index = parseInt(cards[i].dataset.index);
				const body = Sim.bodies[index];
				if (!body) continue;

				const inpX = cards[i].querySelector('.inp-x');
				const inpY = cards[i].querySelector('.inp-y');
				const inpVX = cards[i].querySelector('.inp-vx');
				const inpVY = cards[i].querySelector('.inp-vy');
				const inpRadius = cards[i].querySelector('.inp-radius');

				if (document.activeElement !== inpX) inpX.value = body.x.toFixed(1);
				if (document.activeElement !== inpY) inpY.value = body.y.toFixed(1);
				if (document.activeElement !== inpVX) inpVX.value = body.vx.toFixed(2);
				if (document.activeElement !== inpVY) inpVY.value = body.vy.toFixed(2);
				if (document.activeElement !== inpRadius) inpRadius.value = body.radius.toFixed(1);
			}
		}
	};

	const generateRandomParameters = () => {
		const mass = Math.floor(Math.random() * 450) + 50;
		let x = (Math.random() - 0.5) * 600;
		let y = (Math.random() - 0.5) * 600;
		const vx = (Math.random() - 0.5) * 6;
		const vy = (Math.random() - 0.5) * 6;

		document.getElementById('newMass').value = mass;
		document.getElementById('newX').value = x.toFixed(1);
		document.getElementById('newY').value = y.toFixed(1);
		document.getElementById('newVX').value = vx.toFixed(2);
		document.getElementById('newVY').value = vy.toFixed(2);
	};
	generateRandomParameters();
	document.getElementById('randomizeBtn').addEventListener('click', generateRandomParameters);

	const playBtn = document.getElementById('playPauseBtn');
	playBtn.addEventListener('click', () => {
		Sim.paused = !Sim.paused;
		if(Sim.paused) {
			playBtn.innerHTML = '<i class="fa-solid fa-play"></i> RESUME';
			playBtn.classList.remove('primary');
			playBtn.style.color = "#aaa";
		} else {
			playBtn.innerHTML = '<i class="fa-solid fa-pause"></i> PAUSE';
			playBtn.classList.add('primary');
			playBtn.style.color = "";
		}
	});

	document.getElementById('resetBtn').addEventListener('click', () => {
		Sim.reset();
		if(Sim.paused) Render.draw(); 
	});

	const bindRange = (idInput, idDisplay, obj, prop, isFloat = false, prec = 1) => {
		const el = document.getElementById(idInput);
		const disp = document.getElementById(idDisplay);
		if (!el) return;

		el.value = obj[prop];
		if (disp) disp.textContent = isFloat ? obj[prop].toFixed(prec) : obj[prop];

		el.addEventListener('input', () => {
			const val = parseFloat(el.value);
			obj[prop] = val;
			if (disp) disp.textContent = isFloat ? val.toFixed(prec) : val;
		});
	};

	const bindToggle = (idInput, obj, prop, callback) => {
		const el = document.getElementById(idInput);
		if (!el) return;

		el.checked = obj[prop];

		el.addEventListener('change', (e) => {
			obj[prop] = e.target.checked;
			if (callback) callback(e.target.checked);
		});
	};

	bindRange('dtSlider', 'dtVal', Sim, 'dt', true, 1);
	bindRange('trailLenSlider', 'trailLenVal', Sim, 'trailLength');
	bindRange('trailPrecSlider', 'trailPrecVal', Sim, 'trailStep');
	
	bindRange('gridPrecSlider', 'gridPrecVal', Render, 'gridDetail');
	bindRange('gridDistSlider', 'gridDistVal', Render, 'gridDistortion', true, 2);
	bindRange('gridMinDistSlider', 'gridMinDistVal', Render, 'gridMinDist');

	bindToggle('showTrailsBox', Sim, 'showTrails');
	bindToggle('camTrackingBox', Render, 'enableTracking');
	bindToggle('camAutoZoomBox', Render, 'enableAutoZoom', (checked) => {
		if (checked) Render.userZoomFactor = 1.0;
	});

	Render.init();
	refreshBodyList();
});