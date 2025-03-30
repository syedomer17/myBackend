import { parentPort } from "worker_threads";

// Function to simulate a CPU-heavy computation
const heavyComputation = () => {
  let sum = 0;
  for (let i = 0; i < 1e9; i++) {
    sum += i;
  }
  return sum;
};

// Run the computation and send the result back
if (parentPort) {
  parentPort.postMessage(heavyComputation());
}
