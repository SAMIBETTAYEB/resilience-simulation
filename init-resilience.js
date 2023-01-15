const {log, initilizeNetwork, divideByGroup, calculateCompromisedLinks} = require("./utilis");

const simulateInitResilience = (numberOfCapturedNode = 20) => {
  // Simultate resilience against node capture where each 1000 nodes, and each node has 14 neighbors
  // Number of gateways is 10% of the total number of nodes
  const numberOfNodes = 1000;
  const numberOfGateways = numberOfNodes / 10;
  const numberOfNeighbors = 14;

  // nodes is an array of objects, each object is a node with its neighbors and its type (gateway or constrained)
  const nodes = initilizeNetwork(numberOfNodes, numberOfGateways, numberOfNeighbors);

  // Assign each node to a group id
  divideByGroup(nodes, 100);

  // Get all the bidirectional links
  let numBidirectionalLinks = 0;
  for (let i = 0; i < nodes.length; i++) {
    numBidirectionalLinks += nodes[i].neighbors.length
    // for (const neighbor of nodes[i].neighbors) {
    //   // If the current node is a neighbor of its neighbor, increment the counter
    //   // if (nodes[neighbor].neighbors.includes(i)) {
    //     // numBidirectionalLinks++;
    //   // }
    // }
  }

  // Choose 'numberOfCapturedNode' random nodes to capture
  const capturedNodes = new Set();
  while (capturedNodes.size < numberOfCapturedNode) {
    capturedNodes.add(Math.floor(Math.random() * nodes.length));
  }

  // If the captured node is a gateway, then the compromised link is 0
  // If the captured node is a constrained node, then the number of compromised links is twice the number of the nodes in the same group and the next group if the group is not the last group, and the number of the nodes in the previous group if the group is not the first group
  const compromisedNodes = new Set();
  for (const node of capturedNodes) {
    if (nodes[node].type === 'gateway') {
    } else {
      compromisedNodes.add(node);
      const group = nodes[node].group;
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].group === group || nodes[i].group === group + 1 || nodes[i].group === group - 1) {
          compromisedNodes.add(i);
        }
      }
    }
  }

  // Copy compromisedNodes set to compromisedLinks set
  const compromisedLinks = new Set(compromisedNodes);

  // Add the neighbors of compromised nodes to compromisedLinks set
  for (const node of compromisedNodes) {
    for (const neighbor of nodes[node].neighbors) {
      compromisedLinks.add(neighbor);
    }
  }

  const numCompromisedLinks = calculateCompromisedLinks(capturedNodes, nodes, true, false);

  let matrixBasedCompromisedLinksFraction = 0;
  let withoutTPMCompromisedLinksFraction = 0;
  // If there is at least one captured constrained node, then the fraction of compromised links is 1
  // If all the captured nodes are gateways, then the fraction of compromised links is 0
  if ([...capturedNodes].some(node => nodes[node].type === 'constrained')) {
    matrixBasedCompromisedLinksFraction = 1;
  } else {
    matrixBasedCompromisedLinksFraction = 0;
  }

  if (capturedNodes.size > 0) {
    withoutTPMCompromisedLinksFraction = 1;
  } else {
    withoutTPMCompromisedLinksFraction = 0;
  }


  // Return the number of compromised links, the number of total links, and the fraction of compromised links
  return {
    compromisedLinksCount: compromisedLinks.size,
    numCompromisedLinks,
    numTotalLinks: numBidirectionalLinks,
    fractionCompromisedLinks: numCompromisedLinks / (numBidirectionalLinks),
    matrixBasedCompromisedLinksFraction,
    withoutTPMCompromisedLinksFraction
  };

}


process.env.debug = true;

// Print the results of the simulation
// console.log(simulateResilience());

// Print the average of fractions of compromised links to total number of links over 1000 simulations
let sum = 0;
let results = {};
let matrixBasedResults = {};
let withoutTPMResults = {};
// The number of compromised nodes varies from 0 to 20
for (let i = 0; i <= 20; i++) {
  sum = 0;
  sumMatrixBased = 0;
  sumWithoutTPM = 0;
  for (let j = 0; j < 1000; j++) {
    log(`Simulation ${i}-${j + 1}:`)
    simulation = simulateInitResilience(i);
    sum += simulation.fractionCompromisedLinks;
    sumMatrixBased += simulation.matrixBasedCompromisedLinksFraction;
    sumWithoutTPM += simulation.withoutTPMCompromisedLinksFraction;
    log(`Number of compromised links: ${simulation.numCompromisedLinks}`);
    log(`Number of Total links: ${simulation.numTotalLinks}`);
    log(`Fraction of compromised links: ${simulation.fractionCompromisedLinks}`);
    log(`Matrix based fraction of compromised links: ${simulation.matrixBasedCompromisedLinksFraction}`);
    log(`Without TPM fraction of compromised links: ${simulation.withoutTPMCompromisedLinksFraction}`);
    log("-----------------------");
  }
  // Append the average of fraction of compromised links to the results object
  results[i] = sum / 1000;
  matrixBasedResults[i] = sumMatrixBased / 1000;
  withoutTPMResults[i] = sumWithoutTPM / 1000;
}
// log(`Average fraction of compromised links: ${sum / 1000}`);
log(results);
log(matrixBasedResults);
log(withoutTPMResults);