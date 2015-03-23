var Q = require("q");
var fs = require("fs");
var exec = require('child_process').exec;
var gui = require('nw.gui');
var dns = require('dns');

var win = gui.Window.get();

if (process.platform === "darwin")
{
	var mb = new gui.Menu(
	{
		type: "menubar"
	});
	mb.createMacBuiltin("Treads");
	win.menu = mb;
}

var password;

//On Load
$(document).on("ready", function()
{
	//Run platform specific read functions. Format: <platform>_read();
	window[process.platform + "_read"]().then(function(data)
	{
		editor.setValue(data);
		editor.selection.clearSelection();
		editor.getSession().setScrollTop(0);
	});

	$("#saveButton").on("click", function()
	{
		content = editor.getValue();
		//Run platform specific write function. Format: <platform>_write();
		window[process.platform + "_write"](content);
	});
	
	$("#addButton").on("click", function()
	{
		var domainname = prompt("Please enter your domain name.");
		var installname = prompt("Please enter your WP Engine install name.");

		if (installname.indexOf("wpengine.com") == -1)
		{
			installname = installname + ".wpengine.com";
		}

		get_a_record(installname).then(function(data)
		{
			editor.setValue(editor.getValue() + "\n" + data + " " + domainname);
			editor.selection.clearSelection();
			editor.getSession().setScrollTop(0);
		});
	});
});

/**
 * darwin_read Reads the hosts file on Mac OS X.
 * @return {string} Returns hosts file on success, error on fail.
 */
function darwin_read()
{
	var deferred = Q.defer();
	fs.readFile("/etc/hosts", "utf8", function(err, data)
	{
		if (err)
		{
			deferred.reject();
		}
		
		deferred.resolve(data);
	});
	return deferred.promise;
}

/**
 * Writes to /etc/hosts on Mac OS X.
 * @param  {string} content Text to write to /etc/hosts
 * @return {boolean}        True for False.
 */
function darwin_write(content)
{
	if (!password)
	{
		//Temporary until I create a real dialog.
		password = prompt("Please enter your password.");
	}
	chmod("777").then(function()
	{
		fs.writeFile("/etc/hosts", content, function(err)
		{
			chmod("644");
			if (err)
			{
				console.log(err);
				return 0;
			}

			return 1;
		});
	}, function(error)
	{
		password=null;
		alert("Password incorrect!")
	});
}

/**
 * linux_read Reads the hosts file on Linux.
 * @return {string} Returns hosts file on success, error on fail.
 */
function linux_read()
{
	var deferred = Q.defer();
	fs.readFile("/etc/hosts", "utf8", function(err, data)
	{
		if (err)
		{
			deferred.reject();
		}
		
		deferred.resolve(data);
	});
	return deferred.promise;
}

/**
 * Writes to /etc/hosts on Linux.
 * @param  {string} content Text to write to /etc/hosts
 * @return {boolean}        True for False.
 */
function linux_write(content)
{
	fs.writeFile("/etc/hosts", content, function(err)
	{
		if (!password)
		{
			//Temporary until I create a real dialog.
			password = prompt("Please enter your password.");
		}
		chmod("777").then(function()
		{

			fs.writeFile("/etc/hosts", content, function(err)
			{
				chmod("644");
				if (err)
				{
					console.log(err);
					return 0;
				}

				return 1;
			});
		}, function(error)
		{
			password=null;
			alert("Password incorrect!")
		});

	});
}

/**
 * Chmod /etc/hosts
 * @param  {int} stat The permissions to apply.
 * @return {deferred.promise}      A promise to track the exec status.
 */
function chmod(stat)
{
	var deferred = Q.defer();

	exec("/bin/echo " + password + " | /usr/bin/sudo -S /bin/chmod " + stat + " /etc/hosts", function(err, stdout, stderr)
	{
		if (stderr.indexOf("incorrect password") != -1)
		{
			deferred.reject();
		}
		else
		{
			deferred.resolve();
		}
	});
	return deferred.promise;
}

function get_a_record(hostname)
{
	var deferred = Q.defer();

	dns.lookup(hostname, function(err, address, family) {

		if (err)
		{
			deferred.reject();
		}
		else
		{
			deferred.resolve(address);
		}
	});
	return deferred.promise;
}