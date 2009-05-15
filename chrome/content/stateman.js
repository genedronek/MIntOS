/*
    State Management Functions (stateman.js)

    Dong Zhou
 */

const HLCONTENT_URL = "$$HLCONTENT_URL$$"

var stateTable = null;

/*
	class MIOState {
		int id;	//Not saved
		String document;	//The page display
		String urlbar;	//Content of URL bar
		FormInput currentInput;	//
		String highlight;
		String clipboard;
		int[] trails; //ID of trail that this state is a part of
		int[] posis; //Position of this state in each trail
	}
 */

function MIOState () {
  this.highlight = null;
  this.clipboard = null;
  this.urlbar = null;
  this.document = null;
  this.currentInput = null;

  this.clone = clone;
}

function clone () {
  try {
    var res = new MIOState ();
    res.urlbar = this.urlbar;
    res.highlight = this.highlight;
    res.clipboard = this.clipboard;
    res.document = this.document;
    if (this.currentInput != null) {
      res.currentInput = new Object ();
      res.currentInput.dest = this.currentInput.dest;
      res.currentInput.source = this.currentInput.source;
    }
	
    return res;
  } catch (ex) {
    showStatus ("[stateman.clone] " + ex.message);
  }
}

//Loads states stored in disk file to an array and returns the array
function loadStates (fileName) {
  stateTable = new Array ();
  try {
    var stateFile = openFile (fileName);
    if (!stateFile.exists()) createFile (stateFile);
    var lis = getLineInputStream (stateFile);
    var line = {}, hasMore;

    var id = 0;
    do {
      hasMore = lis.readLine (line);
      if (!hasMore && line.value.length == 0) break;
      if (line.value.indexOf ("<state") == 0) stateTable.push (readState (lis, id++));
    } while (true);	
		
    showStatus ("[stateman.loadStates] Number of states loaded: " + stateTable.length);
  } catch (ex) {
    showStatus ("[stateman.loadStates] " + ex.message);
  }
}

function readState (lis, id) {
  try {
    var res = new MIOState (REDUCED_NONE);
    var line = {};

    lis.readLine (line);
    res.document = unmarshalSVDoc (line.value);	
    lis.readLine (line);
    res.urlbar = unmarshalSVUrl (line.value);
    lis.readLine (line);
    res.highlight = unmarshalSVHL (line.value);
    lis.readLine (line);
    res.clipboard = unmarshalSVCB (line.value);
    lis.readLine (line);
    res.currentInput = unmarshalSVFI (line.value);
		
    res.trails = new Array ();
    res.posis = new Array ();
	
    lis.readLine (line);
    var tmp = line.value;

    while (tmp.indexOf (",") > 0) {
      var index1 = tmp.indexOf (",");
      res.trails.push (tmp.substring (0, index1) - 0);
      var index2 = tmp.indexOf (" ");
      res.posis.push (tmp.substring (index1 + 1, index2) - 0);
      tmp = tmp.substr (index2 + 1);
    }
	
    lis.readLine (line);
		
    res.id = id;
    return res;

  } catch (ex) {
    showStatus ("[readState] " + ex.message);
  }
}

function registerState (state) {
  try {
    var found = -1;
		
    //if (state.highlight != null)
    //	showStatus ("[stateman.registerState] gen=" + state.highlight.gen);
		
    for (var i = 0; i < stateTable.length; i++) {
      if (isSameState (state, stateTable[i])) { 
        found = i; 
        break; 
      }
    }
		
    if (found == -1) {
      state.trails = new Array ();
      state.posis = new Array ();
      stateTable.push (state);
      found = stateTable.length - 1;
    }
		
    //showStatus ("[registerState] state ID = " + found);
    stateTable[found].id = found; 
		
    //showStatus ("[registerState] registerd state" + found);
		
    return stateTable[found];
  } catch (ex) {
    showStatus ("[stateman.registerState] " + ex.message);
  }
}

function saveStates (fileName) {
  try {
    var stateFile = openFile (fileName);
    if (!stateFile.exists()) createFile (stateFile);
    fos = getOutputStream (stateFile, 'w');
    for (var i = 0; i < stateTable.length; i++)
      writeState (i, fos, stateTable[i]);
    fos.close ();
  } catch (ex) {
    showStatus ("[saveStates] " + ex.message);
  }
}

function writeState (index, fos, state) {
  try {
    var tmp = "<state_" + index + "\n";
    fos.write (tmp, tmp.length);
    tmp = marshalSVDoc (state.document) + "\n";
    fos.write (tmp, tmp.length);
    tmp = marshalSVUrl (state.urlbar) + "\n";
    fos.write (tmp, tmp.length);
    tmp = marshalSVHL (state.highlight) + "\n";
    fos.write (tmp, tmp.length);
    tmp = marshalSVCB (state.clipboard) + "\n";
    fos.write (tmp, tmp.length);
    tmp = marshalSVFI (state.currentInput) + "\n";
    fos.write (tmp, tmp.length);
		
    tmp = "";
    for (var i = 0; i < state.trails.length; i++) {
      tmp += state.trails[i] + "," + state.posis[i] + " ";
    }
    tmp += "\n";
    fos.write (tmp, tmp.length);
    tmp = "/state_" + index + ">\n";
    fos.write (tmp, tmp.length);
  } catch (ex) {
    showStatus ("[stateman.writeState] " + ex.message);
  }
}

function isSameState (s1, s2) {
  try {
    if (s1 == null && s2 == null) return true;
    if (s1 == null || s2 == null) return false;
		
    if (!isSameSVDoc (s1.document, s2.document)) return false;
    if (!isSameSVUrl (s1.urlbar, s2.urlbar)) return false;
    if (!isSameSVHL (s1.highlight, s2.highlight)) return false;
    if (!isSameSVCB (s1.clipboard, s2.clipboard)) return false;
    if (!isSameSVFI (s1.currentInput, s2.currentInput)) return false;
	
    return true;
  } catch (ex) {
    showStatus ("[stateman.isSameState] " + ex.message);
  }
}



function SVUrl () {
  this.gen = GEN_NONE; //By default no generalization is performed
  //this.value = null;
}

function SVUrl (url) {
  this.gen = GEN_NONE;
  this.value = url; 
}

function isSameSVUrl (url1, url2) {
  try {
    if (url1 == null && url2 == null) return true;
    if (url1 == null || url2 == null) return false;
		
    if (url1.gen == GEN_URL_ANY && url2.gen == GEN_URL_ANY) return true;
    if (url1.gen != url2.gen) return false;
    if (url1.gen == GEN_NONE) {
      if (url1.value == null && url2.value == null) return true;
      if (url1.value == null || url2.value == null) return false;
      return url1.value.toLowerCase () == url2.value.toLowerCase ();
    }
		
    var method = genMethodByID (url1.gen);
    return method.isSameValue (GENTYPE_URL, url1.value, url2.value);
  } catch (ex) {
    showStatus ("[stateman.isSameSVUrl] " + ex.message);
  }
}

function marshalSVUrl (svurl) {
  try {
    if (svurl == null) return "";
    var res = "" + svurl.gen;
		
    if (svurl.gen == GEN_URL_ANY) return res;
    res += " ";
    if (svurl.gen == GEN_NONE) res += svurl.value;
    else {
      var method = genMethodByID (url1.gen);
      res += method.marshal (GENTYPE_URL, svurl.value);
    }
    return res;
  } catch (ex) {
    showStatus ("[stateman.marshalSVUrl] " + ex.message);
  }
}

function unmarshalSVUrl (s) {
  try {
    if (s.length == 0) return null;
    var res = new SVUrl ();	
    var index = s.indexOf (" ");
    if (index < 0) res.gen = s - 0;
    else {
      res.gen = s.substring (0, index) - 0;
      if (res.gen == GEN_NONE) res.value = s.substr (index + 1);
      else {
        var method = genMethodByID (url1.gen);
        res.value = method.unmarshal (GENTYPE_URL, s.substr (index + 1));   
      }
    }
    return res;
  } catch (ex) {
    showStatus ("[stateman.unmarshalSVUrl] " + ex.message);
  }
}


function SVDoc () {
  this.gen = GEN_NONE; //By default no generalization is performed
  //this.value = new Object ();
  //this.value.doc = null;
  //this.value.title = null;
  //this.value.loc = loc;
}


function SVDoc (title, loc, doc) {
  this.gen = GEN_NONE;
  this.value = new Object ();
  this.value.doc = doc;
  this.value.title = title;
  this.value.loc = loc;
}


function isSameSVDoc (doc1, doc2) {
  try {
    if (doc1 == null && doc2 == null) return true;
    if (doc1 == null || doc2 == null) return false;
		
    if (doc1.gen == GEN_DOCUMENT_ANY && doc2.gen == GEN_DOCUMENT_ANY) return true;
    if (doc1.gen != doc2.gen) return false;
	
		
    //if (doc1.gen == GEN_NONE)
    //	return doc1.value.doc == doc2.value.doc && doc1.value.title == doc2.title 
    //		&& doc1.value.loc == doc2.value.loc;
			
    if (doc1.gen == GEN_NONE) {
      if (doc1.value.loc.toLowerCase () != doc2.value.loc.toLowerCase()) return false;
      if (doc1.value.title == null && doc2.value.title == null) return true;
      if (doc1.value.title == null || doc2.value.title == null) return false;
      return doc1.value.title.toLowerCase() == doc2.value.title.toLowerCase();
    }
    var method = genMethodByID (doc1.gen);
    return method.isSameValue (GENTYPE_DOCUMENT, doc1.value, doc2.value);
  } catch (ex) {
    showStatus ("[stateman.isSameSVDoc] " + ex.message);
  }
}


function marshalSVDoc (svdoc) {
  try {
    if (svdoc == null) return "";
    var res = "" + svdoc.gen;
    if (svdoc.gen == GEN_DOCUMENT_ANY) return res;
    if (svdoc.gen == GEN_NONE)		
      res += " " + svdoc.value.loc + " " + svdoc.value.doc + " " + svdoc.value.title; 
    else {
      var method = genMethodByID (svdoc.gen);
      res += " " + method.marshal (GENTYPE_DOCUMENT, svdoc.value);
    }
    return res;
  } catch (ex) {
    showStatus ("[stateman.marshalSVDoc] " + ex.message);
  }
}


function unmarshalSVDoc (s) {
  try {
    if (s.length == 0) return null;
    var res = new SVDoc ();	
    var index = s.indexOf (" ");
    if (index < 0) {
      res.gen = s - 0;
    } else {
      res.gen = s.substring (0, index) - 0;
      res.value = new Object ();
      if (res.gen == GEN_NONE) {
        s = s.substr (index + 1);
        index = s.indexOf (" ");
        res.value.loc = s.substring (0, index);
        s = s.substr (index + 1);
        index = s.indexOf (" ");
        res.value.doc = s.substring (0, index);
        res.value.title = s.substr (index + 1);  
      } else {
        var method = genMethodByID (res.gen);
        res.value = method.unmarshal (GENTYPE_DOCUMENT, s.substr (index + 1));
      }
    }
    return res;
  } catch (ex) {
    showStatus ("[stateman.unmarshalSVDoc] " + ex.message);
  }
}

function SVHL () {
  this.gen = GEN_NONE; //By default no generalization is performed
  //this.value = new Object ();
  //this.value.hlStruct = null;
  //this.value.hlContent = null;
}

function isSameSVHL (hl1, hl2) {
  try {
    if (hl1 == null && hl2 == null) return true;
    if (hl1 == null || hl2 == null) return false;
		
    if (hl1.gen == GEN_HIGHLIGHT_ANY && hl2.gen == GEN_HIGHLIGHT_ANY) return true;
    if (hl1.gen != hl2.gen) return false;
	
    if (hl1.gen == GEN_NONE) {
      //return hl1.value.hlContent == hl2.value.hlContent && isSamePhraseStruct (hl1.value.hlStruct, hl2.value.hlStruct);
      return hl1.value.hlContent.toLowerCase() == hl2.value.hlContent.toLowerCase ();
    } else {
      var method = genMethodByID (hl1.gen);
      return method.isSameValue (GENTYPE_HIGHLIGHT, hl1.value, hl2.value);
    }
	
    return false;
  } catch (ex) {
    showStatus ("[stateman.isSameSVHL] " + ex.message);
  }
}

function PhraseStruct () {
  this.root_id = -1;
  this.child_id = -1; //ID of the text node
  this.offset_type = 0; //0: select all; 1: start from head; -1: start from rear
  this.start = -1; //
  this.end = -1;
  this.marshal = phsMarshal;
  this.unmarshal = phsUnmarshal;
}

function phsMarshal () {
  var res = this.root_id + " " + this.child_id + " " + this.offset_type + " " + this.start + " " + this.end;
  return res;
}

function phsUnmarshal (s) {
  try {
    var index = s.indexOf (" ");
    this.root_id = s.substring (0, index) - 0;
    s = s.substr (index + 1);
    index = s.indexOf (" ");
    this.child_id = s.substring (0, index) - 0;
    s = s.substr (index + 1);
    index = s.indexOf (" ");
    this.offset_type = s.substring (0, index) - 0;
    s = s.substr (index + 1);
    index = s.indexOf (" ");
    this.start = s.substring (0, index) - 0;
    s = s.substr (index + 1);
    index = s.indexOf (" ");
    this.end = s.substr (index + 1);
  } catch (ex) {
    showStatus ("[stateman.phsUnmarshal] " + ex.message);
  }
}


function isSamePhraseStruct (sp1, sp2) {
  try {
    if (sp1 == null && sp2 == null) return true;
    if (sp1 == null || sp2 == null) return false;
	
    if (sp1.root_id != sp2.root_id || sp1.child_id != sp2.child_id) return false;
    if (sp1.offset_type == 0 && sp2.offset_type == 0) return true;
    return  sp1.offset_type == sp2.offset_type 
      && sp1.start == sp2.start && sp1.end == sp2.end;
  } catch (ex) {
    showStatus ("[stateman.isSamePhraseStruct] " + ex.message);
  }
}

//"gen nid range_type start end content"
function marshalSVHL (svhl) {
  try {
    if (svhl == null) return "";
    var res = "" + svhl.gen;
    if (svhl.gen == GEN_HIGHLIGHT_ANY) return res;

    res += " ";
    if (svhl.gen == GEN_NONE) {
      res += svhl.value.hlContent;
    } else {
      var method = genMethodByID (svhl.gen);
      res += method.marshal (GENTYPE_HIGHLIGHT, svhl.value);
    }
    return res;
  } catch (ex) {
    showStatus ("[stateman.marshalSVHL] " + ex.message);
  }
}

function unmarshalSVHL (s) {
  try {
    //showStatus ("[stateman.unmarshalSVHL] s=" + s);
    if (s.length == 0) return null;
    var res = new SVHL ();	
    var index = s.indexOf (" ");
    //showStatus ("[stateman.unmarshalSVHL] index=" + index);
    if (index < 0) {
      res.gen = s - 0;
    } else {
      res.gen = s.substring (0, index) - 0;
      res.value = new Object ();
      s = s.substr (index + 1);
      if (res.gen == GEN_NONE) {
        index = s.indexOf (",");
        res.value.hlStruct = new PhraseStruct ();
        res.value.hlContent = s;
      } else {
        //var method = genMethodByID (res.gen);
        var methodv = genMethodTab[res.gen];
        res.value = methodv.unmarshal (GENTYPE_HIGHLIGHT, s);
      }
    }
		
    return res;
  } catch (ex) {
    showStatus ("[stateman.unmarshalSVHL] " + ex.message);
  }
}

function SVCB () {
  this.gen = GEN_NONE; //By default no generalization is performed
  //this.value = new Object ();
  //this.value.hlStruct = null;
  //this.value.hlContent = null;
}

function isSameSVCB (cb1, cb2) {
  return isSameSVHL (cb1, cb2);
}

function marshalSVCB (svcb) {
  return marshalSVHL (svcb);
}

function unmarshalSVCB (s) {
  return unmarshalSVHL (s);
}

function SVFI () {
  this.dest = new Object ();
  this.dest.gen = GEN_NONE; //must conform with doc gen
  //this.dest.value = new Object ();
  //this.dest.value.field_name = null;
  //this.dest.value.field_type = null;
  //this.dest.value.field_id = -1;
  this.source = new SVHL ();
}

function isSameSVFI (fi1, fi2) {
  try {
    if (fi1 == null && fi2 == null) return true;
    if (fi1 == null || fi2 == null) return false;
	
    if (fi1.dest.gen != fi2.dest.gen || fi1.source.gen != fi2.source.gen) return false;
    if (fi1.dest.gen == GEN_NONE) {
      if (fi1.dest.value.field_name.toLowerCase() != fi2.dest.value.field_name.toLowerCase() 
        || fi1.dest.value.field_type != fi2.dest.value.field_type 
        || fi1.dest.value.field_id != fi2.dest.value.field_id)
        return false;
    } else {
      var method = genMethodByID (fi1.dest.gen);
      if (!method.isSameValue (GENTYPE_INPUT_DST, fi1.dest.value, fi1.dest.value)) return false;
    }
	
    return isSameSVHL (fi1.source, fi2.source);
  } catch (ex) {
    showStatus ("[stateman.isSameSVFI] " + ex.message);
  }
}

function marshalSVFI (svfi) {
  try {
    if (svfi == null) return "";
		
    var res = "" + svfi.dest.gen;
		
    if (svfi.dest.gen != GEN_INPUT_DST_ANY) {
      if (svfi.dest.gen == GEN_NONE) 
        res += " " + svfi.dest.value.field_type + " " + svfi.dest.value.field_id + " " + svfi.dest.value.field_name;
      else {
        var method = genMethodByID (svfi.dest.gen);
        res += " " + method.marshal (GENTYPE_INPUT_DST, svfi.dest.value);
      }
    }
		
    res += "," + marshalSVHL (svfi.source);
    return res;
  } catch (ex) {
    showStatus ("[stateman.marshalSVFI] " + ex.message);
  }
}

function unmarshalSVFI (s) {
  try {
    if (s.length == 0) return null;
		
    //showStatus ("[stateman.unmarshalSVFI] s=" + s);
    var res = new SVFI ();	

    var index = s.indexOf (" ");
    var i2 = s.indexOf (",");
    if (index > i2) index = i2;
		
    //showStatus ("[stateman.unmarshalSVFI] index=" + index);
    res.dest.gen = s.substring (0, index) - 0;

    s = s.substr (index + 1);
    //showStatus ("[stateman.unmarshalSVFI] s=" + s);
		
    if (res.dest.gen != GEN_INPUT_DST_ANY) {	
      if (res.dest.gen == GEN_NONE) {
        res.dest.value = new Object ();
        index = s.indexOf (" ");
        res.dest.value.field_type = s.substring (0, index);
        s = s.substr (index + 1);
        index = s.indexOf (" ");
        res.dest.value.field_id = s.substring (0, index);
        //showStatus ("[stateman.unmarshalSVFI] field_id=" + res.dest.value.field_id);
        s = s.substr (index + 1);
        index = s.indexOf (",");
        res.dest.value.field_name = s.substring (0, index);
        //showStatus ("[stateman.unmarshalSVFI] field_name=" + res.dest.value.field_name);
        s = s.substr (index + 1);
      } else {
        index = s.indexOf (",");
        var method = genMethodByID (svfi.dest.gen);
        res.dest.value = method.unmarshal (GENTYPE_INPUT_DST, s.substring (0, index));
        s = s.substr (index + 1);
      }
    }
		
    res.source = unmarshalSVHL (s);

    return res;
  } catch (ex) {
    showStatus ("[stateman.unmarshalSVFI] " + ex.message);
  }
}

