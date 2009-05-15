/*
 * For file I/O operation
 * 
 * Dong Zhou
*/

function openFile (path) {
	var file = Components.classes['@mozilla.org/file/local;1']
							.createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(path);
	//alert("openFile " + path + " returns " + file);
	return file;
}

function createFile (file) {
	try {
		file.create(0x00, 0664);
	}
	catch (e) {
		//alert("createFile "+ file + " returned " + e);
	}
}

function getLineInputStream (file) {
	// open an input stream from file
	var istream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                       .createInstance(Components.interfaces.nsIFileInputStream);
	istream.init(file, 0x01, 0444, 0);
	istream.QueryInterface(Components.interfaces.nsILineInputStream);
		
	return istream;
}

function getOutputStream (file, mode) {
	// file is nsIFile, data is a string
	var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                       .createInstance(Components.interfaces.nsIFileOutputStream);

	// use 0x02 | 0x10 to open file for appending.	
	if (mode == 'a') {
		foStream.init(file, 0x02 | 0x10, 0666, 0); // wronly | append
	} else
		foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0); 

	return foStream;
}
