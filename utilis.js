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

/**
 * 
 * @param {Set<String>} capturedNodes The captured nodes
 * @param {Array} nodes The nodes array
 * @param {Boolean} tpm Is the memory protected by TPM (Trusted Platform Module)
 * @param {Boolean} keepNeighborsSecrets Does the captured nodes contain all the secrets of their neighbors
 * @returns {Set<String>} The compromised links of other schemes
 */
function calculateCompromisedLinks(capturedNodes, nodes, tpm = true, keepNeighborsSecrets = false) {
  const compromisedLinksOfOtherSchemes = new Set();
  const nonCapturedNeighborsWithCompromisedLinks = new Set();
  // For each compromised node, add its neighbors to the compromised links of other schemes
  for (const node of capturedNodes) {
    if (tpm && nodes[node].type === 'gateway')
      continue;
    for (const neighbor of nodes[node].neighbors) {
      compromisedLinksOfOtherSchemes.add(`${node}-${neighbor}`);
      compromisedLinksOfOtherSchemes.add(`${neighbor}-${node}`);
      // If the neighbor is not captured, then add it to the non-captured neighbors with compromised links
      if (!capturedNodes.has(neighbor)) {
        nonCapturedNeighborsWithCompromisedLinks.add(neighbor);
      }
      // Add the neighbor of neighbor to the compromised links of other schemes
      // If the secrets are ciphered, then the compromised node can't see the neighbor of neighbor
      // if (secretsCiphered) continue;
      // for (const neighborOfNeighbor of nodes[neighbor].neighbors) {
      //   compromisedLinksOfOtherSchemes.add(`${neighbor}-${neighborOfNeighbor}`);
      //   compromisedLinksOfOtherSchemes.add(`${neighborOfNeighbor}-${neighbor}`);
      // }
    }
  }

  // If captured nodes contains contain all the secrets of their neighbors
  if (keepNeighborsSecrets) {
    // For each non-captured neighbor with compromised links, add the rest of non-captured neighbors to the compromised links in condition that they are neighbors
    for (const nonCapturedNeighbor of nonCapturedNeighborsWithCompromisedLinks) {
      for (const nonCapturedNeighbor2 of nonCapturedNeighborsWithCompromisedLinks) {
        if (nodes[nonCapturedNeighbor].neighbors.includes(nonCapturedNeighbor2)) {
          compromisedLinksOfOtherSchemes.add(`${nonCapturedNeighbor}-${nonCapturedNeighbor2}`);
          compromisedLinksOfOtherSchemes.add(`${nonCapturedNeighbor2}-${nonCapturedNeighbor}`);
        }
      }
    }
  }
  return compromisedLinksOfOtherSchemes.size;
}
exports.calculateCompromisedLinks = calculateCompromisedLinks;