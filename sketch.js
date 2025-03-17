let population;
let pipes = [];
let counter = 0;
let generation = 0;
let isPaused = false;
let currentBestScore = 0;
let prevGenBestScore = 0;
let prevGenAvgScore = 0;
let bestScoreHistory = [];
let globalBestScore = 0;

// Global UI elements
let mutationInput, popSizeInput, togglePauseButton, startButton, resetButton;
let generationDisplay,
  birdsAliveDisplay,
  bestScoreDisplay,
  prevBestScoreDisplay,
  prevAvgScoreDisplay,
  graphContainer;

// Global variable to hold the bird image
let birdImage;

function preload() {
  // Load the bird image (ensure bird.png is in the same folder)
  birdImage = loadImage("bird.png");
}

function setup() {
  const canvas = createCanvas(640, 480);
  canvas.parent("canvas-container");
  background(51);

  // Initialize UI elements
  mutationInput = select("#mutationRate");
  popSizeInput = select("#popSize");
  togglePauseButton = select("#togglePause");
  startButton = select("#startButton");
  resetButton = select("#resetSimulation");
  generationDisplay = select("#generation");
  birdsAliveDisplay = select("#birdsAlive");
  bestScoreDisplay = select("#bestScore");
  prevBestScoreDisplay = select("#prevBestScore");
  prevAvgScoreDisplay = select("#prevAvgScore");
  graphContainer = select("#graph");

  // Start button event
  startButton.mousePressed(() => {
    startButton.attribute("disabled", "");
    togglePauseButton.removeAttribute("disabled");
    population = new Population(parseInt(popSizeInput.value()));
    pipes = [];
    pipes.push(new Pipe());
  });

  // Pause/Resume button event
  togglePauseButton.mousePressed(() => {
    isPaused = !isPaused;
    togglePauseButton.html(isPaused ? "Resume" : "Pause");
    togglePauseButton.removeClass(isPaused ? "pause-button" : "resume-button");
    togglePauseButton.addClass(isPaused ? "resume-button" : "pause-button");
  });

  // Reset button event
  resetButton.mousePressed(() => {
    generation = 0;
    counter = 0;
    currentBestScore = 0;
    prevGenBestScore = 0;
    prevGenAvgScore = 0;
    bestScoreHistory = [];
    isPaused = false;
    population = null;
    pipes = [];
    togglePauseButton.html("Pause");
    togglePauseButton.addClass("pause-button");
    togglePauseButton.removeClass("resume-button");
    togglePauseButton.attribute("disabled", "");
    startButton.removeAttribute("disabled");
    updateDisplays();
    updateGraph();
    background(51);
  });

  updateDisplays();
}

function draw() {
  if (!population) return;
  background(51);

  if (!isPaused) {
    if (counter % 120 === 0) {
      pipes.push(new Pipe());
    }
    counter++;

    // Update and remove offscreen pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
      pipes[i].update();
      if (pipes[i].offscreen()) {
        pipes.splice(i, 1);
      }
    }

    // Update birds with collision checking
    population.update(pipes);

    // If all birds are dead, evolve to the next generation
    if (population.allDead()) {
      recordGenerationStats();
      population.calculateFitness();
      population.naturalSelection(parseFloat(mutationInput.value()));
      generation++;
      pipes = [];
      pipes.push(new Pipe());
      counter = 0;
    }
  }

  // Draw pipes
  for (let pipe of pipes) {
    pipe.show();
  }

  // Draw birds
  if (population) {
    population.show();
  }

  // Highlight only the best bird with a pulsating red circle
  if (population && population.birds.length > 0) {
    let bestBird = population.birds.reduce(
      (best, bird) => (bird.score > best.score ? bird : best),
      population.birds[0]
    );
    let pulse = map(sin(frameCount * 0.1), -1, 1, 2, 6);
    stroke(255, 0, 0, 200);
    strokeWeight(pulse);
    noFill();
    ellipse(bestBird.x, bestBird.y, 40, 40);
  }

  updateDisplays();
}

function updateDisplays() {
  currentBestScore = 0;
  if (population && population.birds.length > 0) {
    for (let bird of population.birds) {
      if (bird.score > currentBestScore) {
        currentBestScore = bird.score;
      }
    }
  }
  generationDisplay.html(generation);
  birdsAliveDisplay.html(population ? population.birds.length : 0);
  bestScoreDisplay.html(currentBestScore);
  prevBestScoreDisplay.html(prevGenBestScore);
  prevAvgScoreDisplay.html(prevGenAvgScore.toFixed(1));
}

function recordGenerationStats() {
  let sumScore = 0;
  let bestScore = 0;
  for (let bird of population.savedBirds) {
    sumScore += bird.score;
    if (bird.score > bestScore) {
      bestScore = bird.score;
    }
  }
  prevGenBestScore = bestScore;
  prevGenAvgScore = sumScore / population.savedBirds.length;
  bestScoreHistory.push(bestScore);
  if (bestScoreHistory.length > 100) {
    bestScoreHistory.shift();
  }
  updateGraph();
}

function updateGraph() {
  graphContainer.html("");
  if (bestScoreHistory.length === 0) return;
  const maxScore = Math.max(...bestScoreHistory);
  const containerWidth = graphContainer.width;
  const containerHeight = graphContainer.height;
  const barWidth = containerWidth / Math.max(100, bestScoreHistory.length);
  bestScoreHistory.forEach((score, i) => {
    const barHeight = (score / maxScore) * containerHeight;
    const bar = createDiv();
    bar.class("bar");
    bar.style("height", barHeight + "px");
    bar.style("left", i * barWidth + "px");
    bar.style("width", barWidth + "px");
    graphContainer.child(bar);
  });
}
