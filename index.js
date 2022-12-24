const log = (message) => process.env.debug && console.log(message);

const simulateResilience = (numberOfCapturedNode = 20) => {
// Simultate resilience against node capture where each 1000 nodes, and each node has 14 neighbors
// Number of gateways is 10% of the total number of nodes
const numberOfNodes = 1000;
const numberOfGateways = numberOfNodes / 10;
const numberOfNeighbors = 14;

// nodes is an array of objects, each object is a node with its neighbors and its type (gateway or constrained)
const nodes = [];
// Push gateway nodes
for (let i = 0; i < numberOfGateways; i++) {
  nodes.push({ type: 'gateway', neighbors: [] });
}
// Push constrained nodes
for (let i = 0; i < numberOfNodes - numberOfGateways; i++) {
  nodes.push({ type: 'constrained', neighbors: [] });
}

// Sort nodes randomly
nodes.sort(() => Math.random() - 0.5);

// Add 14 neighbors to each node, where a neighbor is represented by an index in the nodes array
for (let i = 0; i < nodes.length; i++) {
  for (let j = 0; j < numberOfNeighbors; j++) {
    let neighbor = Math.floor(Math.random() * nodes.length);
    while (neighbor === i || nodes[i].neighbors.includes(neighbor) || nodes[i].neighbors.length >= numberOfNeighbors) {
      neighbor = Math.floor(Math.random() * nodes.length);
    }
    nodes[i].neighbors.push(neighbor);
  }
}

// Print the nodes array
// console.log(JSON.stringify(nodes, null, 2));


// Assume that nodes is an array of objects representing the nodes in the network, where each object has a "neighbors" property that is an array of the indices of the node's neighbors in the nodes array

let numBidirectionalLinks = 0;

for (let i = 0; i < nodes.length; i++) {
  for (const neighbor of nodes[i].neighbors) {
    // If the current node is a neighbor of its neighbor, increment the counter
    if (nodes[neighbor].neighbors.includes(i)) {
      numBidirectionalLinks++;
    }
  }
}

log(`Number of bidirectional links: ${numBidirectionalLinks}`);

// Assume that nodes is an array of objects representing the nodes in the network, where each object has a "neighbors" property that is an array of the indices of the node's neighbors in the nodes array

// Choose 20 random nodes to capture
const capturedNodes = new Set();
while (capturedNodes.size < numberOfCapturedNode) {
  capturedNodes.add(Math.floor(Math.random() * nodes.length));
}

// Print the compromised links
// console.log('Compromised links:');
// for (const node of capturedNodes) {
//   for (const neighbor of nodes[node].neighbors) {
//     if (capturedNodes.has(neighbor)) {
//       // console.log(`${node} -> ${neighbor}`);
//     }
//   }
// }

log("Compromised Nodes", capturedNodes);

// Print of fraction of compromised links to total number of links
let numCompromisedLinks = 0;
// If the compromised node is a gateway, then the compromised link is 0
// If the compromised node is a constrained node, then the compromised link is the twice the number of its neighbors that are not compromised
for (const node of capturedNodes) {
  if (nodes[node].type === 'gateway') {
    numCompromisedLinks += 0;
  } else {
    numCompromisedLinks += nodes[node].neighbors.filter(neighbor => capturedNodes.has(neighbor)).length * 2;
  }
}

// Return an object that contains the number of compromised nodes and the number of compromised links and the number of total links in the network (including bidirectional links) and the number of total nodes in the network (including gateways) and the fraction of compromised links to total number of links
return {
  numCompromisedNodes: capturedNodes.size,
  numCompromisedLinks: numCompromisedLinks,
  numTotalLinks: numBidirectionalLinks,
  numTotalNodes: nodes.length,
  // Filter out the gateways from the compromised nodes to get the length of the compromised gateways
  numCompromisedGateways: [...capturedNodes].filter(node => nodes[node].type === 'gateway').length,
  fractionCompromisedLinks: numCompromisedLinks / numBidirectionalLinks,
};
}


process.env.debug = true;

// Print the results of the simulation
// console.log(simulateResilience());

// Print the average of fractions of compromised links to total number of links over 1000 simulations
let sum = 0;
let results = {};
// The number of compromised nodes varies from 0 to 20
for (let i = 0; i <= 20; i++) {
  sum = 0;
for (let j = 0; j < 1000; j++) {
  simulation = simulateResilience(i);
  sum += simulation.fractionCompromisedLinks;
  log(`Number of compromised links: ${simulation.numCompromisedLinks}`);
  log(`Number of total links: ${simulation.numTotalLinks}`);
  log(`Fraction of compromised links: ${simulation.fractionCompromisedLinks}`);
  log("-----------------------");
}
// Append the average of fraction of compromised links to the results object
results[i] = sum / 1000;
}
// log(`Average fraction of compromised links: ${sum / 1000}`);
log(results);