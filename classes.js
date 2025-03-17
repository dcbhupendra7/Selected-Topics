// A simple Neural Network class with one hidden layer
class NeuralNetwork {
  constructor(input_nodes, hidden_nodes, output_nodes) {
    this.input_nodes = input_nodes;
    this.hidden_nodes = hidden_nodes;
    this.output_nodes = output_nodes;
    // Initialize weights and biases with random values
    this.weights_ih = new Array(this.hidden_nodes)
      .fill(0)
      .map(() =>
        new Array(this.input_nodes).fill(0).map(() => randomGaussian())
      );
    this.weights_ho = new Array(this.output_nodes)
      .fill(0)
      .map(() =>
        new Array(this.hidden_nodes).fill(0).map(() => randomGaussian())
      );
    this.bias_h = new Array(this.hidden_nodes)
      .fill(0)
      .map(() => randomGaussian());
    this.bias_o = new Array(this.output_nodes)
      .fill(0)
      .map(() => randomGaussian());
  }

  copy() {
    let nn = new NeuralNetwork(
      this.input_nodes,
      this.hidden_nodes,
      this.output_nodes
    );
    nn.weights_ih = this.weights_ih.map((row) => row.slice());
    nn.weights_ho = this.weights_ho.map((row) => row.slice());
    nn.bias_h = this.bias_h.slice();
    nn.bias_o = this.bias_o.slice();
    return nn;
  }

  mutate(rate) {
    const mutateVal = (val) =>
      random(1) < rate ? val + randomGaussian() * 0.5 : val;
    this.weights_ih = this.weights_ih.map((row) => row.map(mutateVal));
    this.weights_ho = this.weights_ho.map((row) => row.map(mutateVal));
    this.bias_h = this.bias_h.map(mutateVal);
    this.bias_o = this.bias_o.map(mutateVal);
  }

  predict(input_array) {
    // Compute hidden layer outputs
    let hidden = [];
    for (let i = 0; i < this.hidden_nodes; i++) {
      let sum = 0;
      for (let j = 0; j < this.input_nodes; j++) {
        sum += this.weights_ih[i][j] * input_array[j];
      }
      sum += this.bias_h[i];
      hidden[i] = this.sigmoid(sum);
    }
    // Compute output layer values
    let output = [];
    for (let i = 0; i < this.output_nodes; i++) {
      let sum = 0;
      for (let j = 0; j < this.hidden_nodes; j++) {
        sum += this.weights_ho[i][j] * hidden[j];
      }
      sum += this.bias_o[i];
      output[i] = this.sigmoid(sum);
    }
    return output;
  }

  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }
}

// Bird class represents a single bird with its own neural network
class Bird {
  constructor(brain) {
    this.x = 64;
    this.y = height / 2;
    this.gravity = 0.8;
    this.lift = -12;
    this.velocity = 0;
    this.score = 0;
    this.fitness = 0;
    // If a brain is provided, copy it; otherwise, create a new one
    if (brain) {
      this.brain = brain.copy();
    } else {
      this.brain = new NeuralNetwork(5, 8, 2);
    }
  }

  show() {
    // If birdImage is loaded, display it; otherwise, fallback to drawing a circle.
    if (typeof birdImage !== "undefined") {
      imageMode(CENTER);
      image(birdImage, this.x, this.y, 32, 32);
    } else {
      fill(255, 100);
      stroke(255);
      ellipse(this.x, this.y, 32, 32);
    }
  }

  up() {
    this.velocity += this.lift;
  }

  mutate(rate) {
    this.brain.mutate(rate);
  }

  think(pipes) {
    // Find the closest pipe
    let closest = null;
    let record = Infinity;
    for (let i = 0; i < pipes.length; i++) {
      let diff = pipes[i].x + pipes[i].w - this.x;
      if (diff > 0 && diff < record) {
        record = diff;
        closest = pipes[i];
      }
    }
    if (closest != null) {
      // Prepare inputs: normalized values
      let inputs = [];
      inputs[0] = this.y / height;
      inputs[1] = this.velocity / 10;
      inputs[2] = closest.top / height;
      inputs[3] = (height - closest.bottom) / height;
      inputs[4] = closest.x / width;
      let output = this.brain.predict(inputs);
      // Jump if the first output is greater than the second
      if (output[0] > output[1]) {
        this.up();
      }
    }
  }

  update() {
    this.score++;
    this.velocity += this.gravity;
    this.y += this.velocity;
    // Prevent bird from going off-screen
    if (this.y > height) {
      this.y = height;
      this.velocity = 0;
    }
    if (this.y < 0) {
      this.y = 0;
      this.velocity = 0;
    }
  }
}

// Pipe class represents a pair of pipes
class Pipe {
  constructor() {
    this.spacing = 125;
    // Ensure top <= height - spacing
    this.top = random(height / 6, height - this.spacing - 20);
    this.bottom = height - (this.top + this.spacing);
    this.x = width;
    this.w = 80;
    this.speed = 2;
  }

  update() {
    this.x -= this.speed;
  }

  offscreen() {
    return this.x < -this.w;
  }

  hits(bird) {
    let birdRadius = 16;
    if (bird.x + birdRadius > this.x && bird.x - birdRadius < this.x + this.w) {
      if (
        bird.y - birdRadius < this.top ||
        bird.y + birdRadius > height - this.bottom
      ) {
        return true;
      }
    }
    return false;
  }

  show() {
    noStroke(); // Ensure no stroke is applied
    fill(255);
    rect(this.x, 0, this.w, this.top);
    rect(this.x, height - this.bottom, this.w, this.bottom);
  }
}

// Population class manages the birds and evolution
class Population {
  constructor(size) {
    this.birds = [];
    this.savedBirds = [];
    for (let i = 0; i < size; i++) {
      this.birds.push(new Bird());
    }
  }

  allDead() {
    return this.birds.length === 0;
  }

  update(pipes) {
    // Loop backwards to safely remove birds
    for (let i = this.birds.length - 1; i >= 0; i--) {
      let bird = this.birds[i];
      bird.think(pipes);
      bird.update();
      for (let j = 0; j < pipes.length; j++) {
        if (pipes[j].hits(bird)) {
          this.savedBirds.push(bird);
          this.birds.splice(i, 1);
          break;
        }
      }
      // Also remove birds that hit the top or bottom boundaries
      if (bird.y === height || bird.y === 0) {
        if (this.birds.includes(bird)) {
          this.savedBirds.push(bird);
          this.birds.splice(i, 1);
        }
      }
    }
  }

  show() {
    for (let bird of this.birds) {
      bird.show();
    }
  }

  calculateFitness() {
    let sum = 0;
    for (let bird of this.savedBirds) {
      sum += bird.score;
    }
    for (let bird of this.savedBirds) {
      bird.fitness = bird.score / sum;
    }
  }

  naturalSelection(mutationRate) {
    let newBirds = [];
    let populationSize = this.savedBirds.length;
    for (let i = 0; i < populationSize; i++) {
      let parent = this.pickOne();
      let child = new Bird(parent.brain);
      child.mutate(mutationRate);
      newBirds.push(child);
    }
    this.birds = newBirds;
    this.savedBirds = [];
  }

  pickOne() {
    let index = 0;
    let r = random(1);
    while (r > 0) {
      r -= this.savedBirds[index].fitness;
      index++;
    }
    index--;
    return this.savedBirds[index];
  }
}
