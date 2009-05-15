/*
 * This file exclusively handles inputs to forms
 * 
 * Dong Zhou
 */

function FormInput (reduced, name, value, type) {
	this.name = name;
	this.value = value;
	this.type = type;
	this.reduced = reduced;
}

function readFormInput (line, offset) {
	var reduced, name, value, type;
	var tmp = line.substr (offset);
	var index = tmp.indexOf (" ");
	if (index < 0) return null;
	
	reduced = tmp.substring (0, index) - 0;
	tmp = tmp.substr (index + 1);
	
	index = tmp.indexOf ("=");
	if (index < 0) return null;
	name = tmp.substring (0, index);
	var index2 = tmp.lastIndexOf (",");
	if (reduced == REDUCED_SCP) {
		var ss = tmp.substring (index + 1, index2);
		value = readSCPHighlight (ss);
	} else value = tmp.substring (index + 1, index2);
	type = tmp.substr (index2 + 1);
	return new FormInput (reduced, name, value, type);
}

function writeFormInput (fi) {
	if (fi == null) return "";
	else {
		if (fi.reduced == REDUCED_SCP) 
			return REDUCED_SCP + " " + fi.name + "=" + writeSCPHighlight (fi.value) + "," + fi.type;
		else return "0 " + fi.name + "=" + fi.value + "," + fi.type;
	}
}

function isSameFormInput (fi1, fi2) {
	if (fi1 == null && fi2 == null) return true;
	if (fi1 == null || fi2 == null) return false;
	if (fi1.reduced != fi2.reduced) return false;
	if (fi1.reduced == REDUCED_SCP) 
		return fi1.name == fi2.name && sameSCPHighlight (fi1.value, fi2.value) && fi1.type == fi2.type;
	else return fi1.name == fi2.name && fi1.value == fi2.value && fi1.type == fi2.type;
}