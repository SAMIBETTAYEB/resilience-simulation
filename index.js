const {log, initilizeNetwork, calculateCompromisedLinks} = require("./utilis");

const simulateResilience = (numberOfCapturedNode = 20) => {
// Simultate resilience against node capture where each 1000 nodes, and each node has 14 neighbors
// Number of gateways is 10% of the total number of nodes
const numberOfNodes = 1000;
const numberOfGateways = numberOfNodes / 10;
const numberOfNeighbors = 14;

// nodes is an array of objects, each object is a node with its neighbors and its type (gateway or constrained)
const nodes = initilizeNetwork(numberOfNodes, numberOfGateways, numberOfNeighbors);

// Print the nodes array
// console.log(JSON.stringify(nodes, null, 2));


// Assume that nodes is an array of objects representing the nodes in the network, where each object has a "neighbors" property that is an array of the indices of the node's neighbors in the nodes array

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

console.log({"Compromised Nodes": capturedNodes.size});

// Print of fraction of compromised links to total number of links
// let numCompromisedLinks = 0;
// If the compromised node is a gateway, then the compromised link is 0
// If the compromised node is a constrained node, then the compromised link is the twice the number of its neighbors that are not compromised
// for (const node of capturedNodes) {
//   if (nodes[node].type === 'gateway') {
//     numCompromisedLinks += 0;
//   } else {
//     numCompromisedLinks += nodes[node].neighbors.filter(neighbor => !capturedNodes.has(neighbor)).length * 2 + nodes[node].neighbors.filter(neighbor => capturedNodes.has(neighbor)).length;
//   }
// }

const compromisedLinksOfOurScheme = calculateCompromisedLinks(capturedNodes, nodes, true, false);
// Declare a set to store the compromised links of other schemes
const compromisedLinksOfOtherSchemesWithTPM = calculateCompromisedLinks(capturedNodes, nodes, true, true);
const compromisedLinksOfOtherSchemesWithoutTPM = calculateCompromisedLinks(capturedNodes, nodes, false, false);

// Return an object that contains the number of compromised nodes and the number of compromised links and the number of total links in the network (including bidirectional links) and the number of total nodes in the network (including gateways) and the fraction of compromised links to total number of links
return {
  numCompromisedNodes: capturedNodes.size,
  numCompromisedLinks: compromisedLinksOfOurScheme,
  numTotalLinks: numBidirectionalLinks,
  numTotalNodes: nodes.length,
  // Filter out the gateways from the compromised nodes to get the length of the compromised gateways
  numCompromisedGateways: [...capturedNodes].filter(node => nodes[node].type === 'gateway').length,
  fractionCompromisedLinks: compromisedLinksOfOurScheme / numBidirectionalLinks,
  numCompromisedLinksOfOtherSchemesWithTPM: compromisedLinksOfOtherSchemesWithTPM,
  numCompromisedLinksOfOtherSchemesWithoutTPM: compromisedLinksOfOtherSchemesWithoutTPM,
  fractionCompromisedLinksOfTPM: compromisedLinksOfOtherSchemesWithTPM / numBidirectionalLinks,
  fractionCompromisedLinksOfWithoutTPM: compromisedLinksOfOtherSchemesWithoutTPM / numBidirectionalLinks,
};
}


process.env.debug = true;

// Print the results of the simulation
// console.log(simulateResilience());

// Print the average of fractions of compromised links to total number of links over 1000 simulations
let ourSum = 0;
let tpmSum = 0;
let withoutTPMSum = 0;
let results = {};
// The number of compromised nodes varies from 0 to 20
for (let i = 0; i <= 20; i++) {
  ourSum = 0;
  tpmSum = 0;
  withoutTPMSum = 0;
for (let j = 0; j < 1000; j++) {
  log(`Simulation ${i}-${j + 1}:`)
  simulation = simulateResilience(i);
  ourSum += simulation.fractionCompromisedLinks;
  tpmSum += simulation.fractionCompromisedLinksOfTPM;
  withoutTPMSum += simulation.fractionCompromisedLinksOfWithoutTPM;
  log(`Number of compromised links: ${simulation.numCompromisedLinks}`);
  log(`Number of total links: ${simulation.numTotalLinks}`);
  log(`Fraction of compromised links: ${simulation.fractionCompromisedLinks}`);
  log(`Fraction of compromised links of TPM: ${simulation.fractionCompromisedLinksOfTPM}`);
  log(`Fraction of compromised links of without TPM: ${simulation.fractionCompromisedLinksOfWithoutTPM}`);
  log(`Number of compromised gateways: ${simulation.numCompromisedGateways}`);
  log("-----------------------");
}
// Append the average of fraction of compromised links to the results object
if (!results['ours']) results['ours'] = {};
if (!results['TPM']) results['TPM'] = {};
if (!results['withoutTPM']) results['withoutTPM'] = {};
results['ours'][i] = ourSum / 1000;
results['TPM'][i] = tpmSum / 1000;
results['withoutTPM'][i] = withoutTPMSum / 1000;
}
// log(`Average fraction of compromised links: ${sum / 1000}`);
log(results);