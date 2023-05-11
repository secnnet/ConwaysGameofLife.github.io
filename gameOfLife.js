const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const resolution = 20;
canvas.width = 800;
canvas.height = 800;

// GameOfLife class
class GameOfLife {
	constructor() {
		this.rows = canvas.height / resolution;
		this.cols = canvas.width / resolution;
		this.grid = this.createGrid();
		this.isRunning = false;
		this.speed = 5; // default game speed
		this.generation = 0;
		this.gridSize = 40; // default grid size
		this.audioContext = new AudioContext();
		this.gainNode = this.audioContext.createGain();
		this.gainNode.connect(this.audioContext.destination);
		this.oscillator = this.audioContext.createOscillator();
		this.oscillator.type = 'square';
		this.oscillator.frequency.value = 440;
		this.oscillator.connect(this.gainNode);
	}

	// Create grid
	createGrid() {
		let grid = new Array(this.rows);
		for (let row = 0; row < this.rows; row++) {
			grid[row] = new Array(this.cols);
			for (let col = 0; col < this.cols; col++) {
				grid[row][col] = Math.floor(Math.random() * 2);
			}
		}
		return grid;
	}

	// Draw grid
	draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
		gradient.addColorStop(0, '#40E0D0');
		gradient.addColorStop(1, '#FF8C00');

		for (let row = 0; row < this.rows; row++) {
			for (let col = 0; col < this.cols; col++) {
				const cell = this.grid[row][col];
				ctx.beginPath();
				ctx.rect(col * resolution, row * resolution, resolution, resolution);
				ctx.fillStyle = cell ? gradient : 'white';
				ctx.fill();
				ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
				ctx.stroke();
			}
		}
	}

	// Get count of live neighbors
	countNeighbors(row, col) {
		let count = 0;
		for (let i = -1; i < 2; i++) {
			for (let j = -1; j < 2; j++) {
				if (i === 0 && j === 0) continue;
				const newRow = row + i;
				const newCol = col + j;
				if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
					count += this.grid[newRow][newCol];
				}
			}
		}
		return count;
	}

	// Get next generation of cells
	getNextGeneration() {
		let newGrid = this.createGrid();
		for (let row = 0; row < this.rows; row++) {
			for (let col = 0; col < this.cols; col++) {
				const neighbors = this.countNeighbors(row, col);
				if (this.grid[row][col]) {
					if (neighbors === 2 || neighbors === 3) {
						newGrid[row][col] = 1;
					} else {
						newGrid[row][col] = 0;
					}
				} else {
					if (neighbors === 3) {
						newGrid[row][col] = 1;
					} else {
						newGrid[row][col] = 0;
					}
				}
			}
		}
		return newGrid;
	}

	// Update grid
	update() {
		this.grid = this.getNextGeneration();
		this.draw();
		this.generation++;

		// Play sound
		this.oscillator.start();

		// Stop sound
		setTimeout(() => {
			this.oscillator.stop();
		}, 100);
	}

	// Start game
	start() {
		this.isRunning = true;
		this.timer = setInterval(() => {
			this.update();
		}, 1000 / this.speed);
	}

	// Stop game
	stop() {
		this.isRunning = false;
		clearInterval(this.timer);
	}

	// Clear grid
	clear() {
		this.grid = this.createGrid();
		this.generation = 0;
	}

	// Change game speed
	changeSpeed(speed) {
		this.speed = speed;
		if (this.isRunning) {
			this.stop();
			this.start();
		}
	}

	// Change grid size
	changeGridSize(size) {
		this.rows = size;
		this.cols = size;
		this.grid = this.createGrid();
		this.generation = 0;
	}
}

// Game instance
const game = new GameOfLife();

// Add event listeners
canvas.addEventListener('click', handleCanvasClick);
document.getElementById('start').addEventListener('click', handleStartClick);
document.getElementById('pause').addEventListener('click', handlePauseClick);
document.getElementById('reset').addEventListener('click', handleResetClick);
document.getElementById('step').addEventListener('click', handleStepClick);
document.getElementById('speed').addEventListener('change', handleSpeedChange);
document.getElementById('grid-size').addEventListener('change', handleGridSizeChange);

// Handle canvas click
function handleCanvasClick(event) {
	const x = event.offsetX;
	const y = event.offsetY;
	const col = Math.floor(x / resolution);
	const row = Math.floor(y / resolution);
	game.grid[row][col] = 1 - game.grid[row][col];
	game.draw();
}

// Handle start click
function handleStartClick() {
	if (!game.isRunning) {
		game.start();
	}
}

// Handle pause click
function handlePauseClick() {
	game.stop();
}

// Handle reset click
function handleResetClick() {
	game.stop();
	game.clear();
	game.draw();
}

// Handle step click
function handleStepClick() {
	game.stop();
	game.update();
}

// Handle speed change
function handleSpeedChange(event) {
	game.changeSpeed(event.target.value);
}

// Handle grid size change
function handleGridSizeChange(event) {
	const newSize = event.target.value;
	canvas.width = newSize * resolution;
	canvas.height = newSize * resolution;
	game.changeGridSize(newSize);
	game.draw();
}