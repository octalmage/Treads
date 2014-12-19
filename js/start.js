var fs = require("fs");

//On Load
$(document).on("ready", function()
{
	//Run platform specific read functions. Format: <platform>_read();
	window[process.platform + "_read"]();

	$("#saveButton").on("click", function()
	{
		//Run platform specific write function. Format: <platform>_write();
		window[process.platform + "_write"]();
	});
});

/**
 * darwin_read Reads the hosts file on Mac OS X.
 * @return {string} Returns hosts file on success, error on fail. 
 */
function darwin_read()
{
	fs.readFile("/etc/hosts", "utf8", function (err,data) 
	{
  		if (err) 
  		{
    		return console.log(err);
  		}
  	
  		editor.setValue(data);
    	editor.selection.clearSelection();
    	return data;
	});
}

/**
 * Writes to /etc/hosts on Mac OS X.
 * @param  {string} content Text to write to /etc/hosts
 * @return {boolean}        True for False. 
 */
function darwin_write(content)
{
	fs.writeFile("/etc/hosts", content, function(err) 
	{
    	if(err) 
    	{
        	console.log(err);
        	return 0;
    	} 
    	
        return 1;

	}); 
}