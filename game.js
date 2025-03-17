class NeuralNetwork {
  constructor(inputNodes, hiddenNodes, outputNodes) {
    this.inputNodes = inputNodes;
    this.hiddenNodes = hiddenNodes;
    this.outputNodes = outputNodes;

    // Initialize matrices for weights and biases
    this.weights_ih = new Matrix(this.hiddenNodes, this.inputNodes);
    this.weights_ho = new Matrix(this.outputNodes, this.hiddenNodes);
    this.bias_h = new Matrix(this.hiddenNodes, 1);
    this.bias_o = new Matrix(this.outputNodes, 1);

    // Randomize the values of the weights and biases
    this.weights_ih.randomize();
    this.weights_ho.randomize();
    this.bias_h.randomize();
    this.bias_o.randomize();
  }

  // Make a prediction based on the input
  predict(inputs) {
    // Convert input array to matrix
    let input_matrix = Matrix.fromArray(inputs);

    // Calculate hidden layer
    let hidden = Matrix.multiply(this.weights_ih, input_matrix);

    // Add bias to hidden layer (using static method)
    hidden = Matrix.add(hidden, this.bias_h);
    hidden.map(sigmoid);

    // Calculate output layer
    let output = Matrix.multiply(this.weights_ho, hidden);
    output = Matrix.add(output, this.bias_o); // Add bias to output layer
    output.map(sigmoid);

    return output.toArray();
  }

  // Rest of the NeuralNetwork class remains the same...
}

// Update Matrix class to include static add method
class Matrix {
  // ... (previous Matrix methods remain the same)

  // Static method for matrix addition
  static add(a, b) {
    if (a.rows !== b.rows || a.cols !== b.cols) {
      console.error("Matrix dimensions must match for addition.");
      return undefined;
    }

    let result = new Matrix(a.rows, a.cols);
    for (let i = 0; i < a.rows; i++) {
      for (let j = 0; j < a.cols; j++) {
        result.data[i][j] = a.data[i][j] + b.data[i][j];
      }
    }
    return result;
  }

  // Instance method for adding another matrix
  add(m) {
    if (m.rows !== this.rows || m.cols !== this.cols) {
      console.error("Matrix dimensions must match for addition.");
      return;
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.data[i][j] += m.data[i][j];
      }
    }
  }
}
