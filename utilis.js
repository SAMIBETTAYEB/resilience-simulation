module.exports.log = (message) => process.env.debug && console.log(message);
module.exports.initilizeNetwork = (numberOfNodes, numberOfGateways, numberOfNeighbors) => {
  const nodes = [];
  // Push gateway nodes
  for (let i = 0; i < numberOfGateways; i++) {
    nodes.push({type: 'gateway', neighbors: []});
  }
  // Push constrained nodes
  for (let i = 0; i < numberOfNodes - numberOfGateways; i++) {
    nodes.push({type: 'constrained', neighbors: []});
  }

  // Sort nodes randomly
  nodes.sort(() => Math.random() - 0.5);

  // Add index to each node to represent the node's id
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].id = i;
  }

  // Add 14 neighbors to each node, where a neighbor is represented by an index in the nodes array
  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < numberOfNeighbors; j++) {
      let underNumberOfNeighborsNodes = nodes.filter(node => node.id !== i && node.neighbors.length < numberOfNeighbors);
      if (nodes[i].neighbors.length >= numberOfNeighbors || underNumberOfNeighborsNodes.length <= 1) {
        break;
      }
      let neighborInFiltered = Math.floor(Math.random() * underNumberOfNeighborsNodes.length);
      // console.log(`Under number of neighbors nodes: ${underNumberOfNeighborsNodes.length}, neighbor in filtered: ${neighborInFiltered}`)
      let neighbor = underNumberOfNeighborsNodes[neighborInFiltered].id;
      // If there is no nodes in underNumberOfNeighborsNodes that does not contain i as a neighbor, then break
      const noPossibleNeighbors = underNumberOfNeighborsNodes.every(node => node.neighbors.includes(i));
      while (neighbor === i || nodes[i].neighbors.includes(neighbor) || nodes[neighbor].neighbors.length >= numberOfNeighbors) {
        if (underNumberOfNeighborsNodes.length <= 1 || noPossibleNeighbors) {
          break;
        }
        underNumberOfNeighborsNodes = nodes.filter(node => node.id !== i && node.neighbors.length < numberOfNeighbors);
        neighborInFiltered = Math.floor(Math.random() * underNumberOfNeighborsNodes.length);
        neighbor = underNumberOfNeighborsNodes[neighborInFiltered].id;
        // console.log(`Trying to find neighbor for node ${i}: ${neighbor}`);
      }
      if (underNumberOfNeighborsNodes.length <= 1) {
        break;
      }
      nodes[i].neighbors.push(neighbor);
      nodes[neighbor].neighbors.push(i);
      // console.log(`Node ${i} is neighbor of ${neighbor}`);
    }
  }
  return nodes;
}

module.exports.divideByGroup = (nodes, numberOfGroups) => {
  const nodesPerGroup = Math.floor(nodes.length / numberOfGroups);
  for (let i = 0; i < nodes.length; i++) {
    nodes[i].group = Math.floor(i / nodesPerGroup);
  }
  return nodes;
}

function calculateCompromisedLinks(capturedNodes, nodes, tpm = true, secretsCiphered = false) {
  const compromisedLinksOfOtherSchemes = new Set();
  // For each compromised node, add its neighbors to the compromised links of other schemes
  for (const node of capturedNodes) {
    if (tpm && nodes[node].type === 'gateway')
      continue;
    for (const neighbor of nodes[node].neighbors) {
      compromisedLinksOfOtherSchemes.add(`${node}-${neighbor}`);
      // Add the neighbor of neighbor to the compromised links of other schemes
      // If the secrets are ciphered, then the compromised node can't see the neighbor of neighbor
      if (secretsCiphered) continue;
      for (const neighborOfNeighbor of nodes[neighbor].neighbors) {
        compromisedLinksOfOtherSchemes.add(`${neighbor}-${neighborOfNeighbor}`);
        compromisedLinksOfOtherSchemes.add(`${neighborOfNeighbor}-${neighbor}`);
      }
    }
  }
  return compromisedLinksOfOtherSchemes.size;
}
exports.calculateCompromisedLinks = calculateCompromisedLinks;