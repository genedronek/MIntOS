var structTable;

function loadStructs (fileName) {
  structTable = new Array ();
  try {
    var structFile = openFile (fileName);
    if (!structFile.exists()) createFile (structFile);
    var lis = getLineInputStream (structFile);
    var line = {}, hasMore;

    do {
      hasMore = lis.readLine (line);
      if (!hasMore && line.value.length == 0) break;
      var index = line.value.indexOf (" ");
      var id = line.value.substring (0, index) - 0;
      var value = line.value.substr (index + 1);
      structTable[id] = value;
    } while (true);	
		
  } catch (ex) {
    showStatus ("[structMan.loadStructs] " + ex.message);
  }
}

function saveStructs (fileName) {
  try {
    var structFile = openFile (fileName);
    if (!structFile.exists()) createFile (structFile);
    fos = getOutputStream (structFile, 'w');
    for (var i = 0; i < structTable.length; i++) {
      if (structTable[i] == null) continue;
      var tmp = "" + i + " " + structTable[i] + "\n";
      fos.write (tmp, tmp.length);
    }
    fos.close ();
  } catch (ex) {
    showStatus ("[structMan.saveStructs] " + ex.message);
  }
}

function registerStructure (s) {
  try {
    for (var i = 0; i < structTable.length; i++) {
      if (structTable[i] != null && structTable[i] == s) return i;
    }
    structTable[structTable.length] = s;
    return structTable.length - 1;
  } catch (ex) {
    showStatus ("[structMan.registerStructure] " + ex.message);
  }
}

function isAncestor (p, c) {
  //showStatus ("[isAncestor] p=" + p.localName + " childCount=" + p.childNodes.length);
  try {
    if (p == null || c == null) return false;
    if (p.childNodes == undefined) return false;
    var nodes = p.childNodes;
    for (var i = 0; i < nodes.length; i++) 
      if (nodes[i] == c || isAncestor (nodes[i], c)) return true;
    return false;
  } catch (ex) {
    showStatus ("[structMan.isAncestor] " + ex.message);
  }
}

function getElementStructure (elem) {
  if (elem.structureID != undefined) {
    //showStatus ("[getElementStructure] structureID found!");
    return elem.structureID;
  }
  var res = "<" + elem.localName;
  if (elem.childNodes == undefined || elem.childNodes.length == 0) {
    res += "/>";
  } else {
    res += ">";
    var nodes = elem.childNodes;
    var prevStruct = null;
    for (var i = 0; i < nodes.length; i++) {
      var structure = getElementStructure (nodes[i]);
      if (structure != prevStruct) {
        prevStruct = structure;
        res += structure;
      }
    }
    res += "</" + elem.localName + ">"; 
  }
  //showStatus ("[getElementStructure] elem=" + elem.localName + " struct=" + res);
  elem.structureID = res;
  return res;
}

function getAncestor (node, n) {
  var res = node;
  for (var i = 0; res != null && i < n; i++) {
    res = res.parentNode;
  }
  return res;
}

function getChildDepth (root, child) {
  try {
    var res = 0;
    while (root != child) {
      if (child.parentNode == null) return -1;
      res++;
      child = child.parentNode;
    }

    return res;
  } catch (ex) {
    showStatus ("[structman.getChildDepth] " + ex.message);
  }
  return -1;
}

function getNodeStructureID (root, node) {
  try { 
    //showStatus ("[getNodeStructureID] root=" + root.localName + " node=" + node.localName);
    //if (node.nodeValue != undefined) showStatus ("[getNodeStructureID] nodeText=" + node.nodeValue); 
    if (node == root) return 0;
    if (!isAncestor (root, node)) {
      //showStatus ("[getNodeStructureID] root is not ancestor of node!");
      //showStatus ("[getNodeStructureID] root=" + root.localName + " node=" + node.localName);
      //if (node.nodeValue != undefined) showStatus ("[getNodeStructureID] nodeText=" + node.nodeValue); 
			
      return -1;
    }
		
    var cnodes = root.childNodes;
    //showStatus ("[getNodeStructureID] cnodes.length=" + cnodes.length);
    if (cnodes == undefined || cnodes.length == 0) return -1;
		
    var count = 1;
    var res = -1;
		
    var pre_struct = null;
    for (var i = 0; i < cnodes.length; i++) {
      if (cnodes[i] == node) {
        res = count;
        break;
      }
      var cur_struct = getElementStructure (cnodes[i]);
      if (pre_struct == cur_struct) continue;
      pre_struct = cur_struct;
      if (isAncestor (cnodes[i], node)) {
        res = count + getNodeStructureID (cnodes[i], node);
        break;
      } else count += getUniqueStructNodeCount (cnodes[i]);
    }
		
    //showStatus ("[getNodeStructureID] nodeID=" + res);
    return res;
  } catch (ex) {
    showStatus ("[getNodeStructureID] " + ex.message);
  }
}

function getUniqueStructNodeCount (root) {
  try {
    if (root == null) return 0;
    var cnodes = root.childNodes;
		
    if (cnodes == undefined || cnodes.length == 0) return 1;
		
    var res = 1;
    var pre_struct = null;
    for (var i = 0; i < cnodes.length; i++) {
      var cur_struct = getElementStructure (cnodes[i]);
      if (pre_struct == cur_struct) continue;
      res += getUniqueStructNodeCount (cnodes[i])
    }
		
    return res;
  } catch (ex) {
    showStatus ("[getUniqueStructNodeCount] " + ex.message);
  }
}

function findNodeByStructureID (root, id) {
  var res = null;
  try {
    //debugMessage ("[findNodeByStructureID] nodeID=" + id);
		
    if (id == 0) res = root;
    else if (root.childNodes == undefined || root.childNodes.length == 0) res = null;
    else {
      var pre_str = null;
      id--;
      for (var i = 0; i < root.childNodes.length; i++) {
        var cur_str = getElementStructure (root.childNodes[i]);
        if (cur_str == pre_str) continue;
        pre_str = cur_str;
        res = findNodeByStructureID (root.childNodes[i], id);
        if (res != null) break; 
        id -= getUniqueStructNodeCount (root.childNodes[i]);
      }
    }
		
    //debugMessage ("[findNodeByStructureID] node=" + res);
  } catch (ex) {
    debugMessage ("[findNodeByStructureID] " + ex.message);
  }
	
  return res;
}

/*
function getChildRank (root_id, sub_id) {
	try {
		var roots = structTable[root_struct];
		var subs = structTable[sub_struct];
		var substart = roots.indexOf (subs);
		if (substart < 0) return -1;

		var res = 0;
		var index = roots.indexOf ("<");
		while (index >= 0) {
			if (index == substart) return count;
			count++;
			index = roots.indexOf ("<", index + 1);
		}

		return -1;
	} catch (ex) {
		showStatus ("[structMan.getChildRank] " + ex.message);
	}
}
 */

function getSmallestCommonAncestor (n1, n2) {
  try {
    if (n1 == null || n2 == null) return null;
    if (n1 == n2) return n1;
    if (isAncestor (n2, n1)) return n2;

    while (!isAncestor (n1, n2)) {
      if (n1.parentNode == null) return null;
      n1 = n1.parentNode;
    }

    return n1;
  } catch (ex) {
    showStatus ("[structMan.getSmallestCommonAncestor] " + ex.message);
  }
}

function isSmallestAncestor (ancestor, nodes) {
  try {
    var res = findNodeByStructureID (nodes.pop ());
    if (nodes.length == 0 && ancestor == res.parentNode) return true; 
    var child = findNodeByStructureID (nodes.pop ());
    while (child != null) {
      res = getSmallestCommonAncestor (res, child);
      child = findNodeByStructureID (nodes.pop ());
    }

    if (res == ancestor) return true;
    else return false;
  } catch (ex) {
    showStatus ("[structMan.isSmallestCommonAncestor] " + ex.message);
  }
}

function getCorrespondingNode (newroot, path) {
  try {
    var node = newroot;
		
    for (var i = path.length - 1; i >= 0; i--) {
      node = node.childNodes[path[i]];
    }
		
    return node;
  } catch (ex) {
    showStatus ("[structman.getCorrespondingNode] " + ex.message);
    throw ex;
  }
}

function findPath (node) {
  try {
    var root = node.ownerDocument;
    var res = new Array ();
    if (root == null) return res;
    var p;

    while (node != root) {
      p = node.parentNode;
      if (p == null) {
        showStatus ("[structman.findPath] can't find parent!");
      }
      for (var i = 0; i < p.childNodes.length; i++) 
        if (p.childNodes[i] == node) {
          res.push (i);
          break;
        }
      node = p;
    }

    return res;
  } catch (ex) {
    showStatus ("[structman.findPath] " + ex.message);
  }
}

//Function for finding the smallest common ancestor
//The nodes in the list are not necessarily on the same tree
//The resulting ancestor is on the tree of the first node
function getSCAPath (nodes) {
  try {
    if (nodes.length == 1) return findPath (nodes[0]);
    var paths = new Array ();
    for (var i = 0; i < nodes.length; i++)
      paths[i] = findPath (nodes[i]);
    var level = 0;
    var found = false;
    do {
      var p = paths[0][paths[0].length - level - 1];
      for (var i = 1; i < paths.length; i++) {
        if (level >= paths[i].length || paths[i][paths[i].length - level - 1] != p) {
          found = true;
          break;
        }
      }       
      if (!found) level++;
    } while (!found && level < paths[0].length);

    var res = new Array ();
    for (var i = 0; i < level; i++)
      res.push (paths[0][paths[0].length - level + i]);
    
    return res;
  } catch (ex) {
    showStatus ("[structman.getSCA] " + ex.message);
  }
}