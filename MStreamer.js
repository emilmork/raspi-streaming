
var spawn = require('child_process').spawn;
var fs = require('fs');

var cmd = "mjpg-streamer";
// Default options
var options = {
    device : '/dev/video0',
    resolution : 'SVGA',
    framerate : 15,
    port : 8090,
    fileFolder : 'usr/local/lib/'
  };


var isCapturing = false;
var process;

//Constructor
var MStreamer = function(args){
	if(args) {
		options = args;
	} 
};

// Returns mjpeg-streamer arguments
var getArgs = function() {
	return [ '-i' ,
              options.fileFolder +'input_uvc.so -r ' + options.resolution + ' -f ' + options.framerate,
              '-o',
              options.fileFolder + 'output_http.so -p ' + options.port
            ];
}

//Set mjpeg-streamer options
MStreamer.prototype.setOptions = function(args) {
	for(var key in args) {
		if(args.hasOwnProperty(key)) {
			if(!options.hasOwnProperty(key)) {
				print(key + " is not a valid property");
				continue;
			}
			options[key] = args[key];
		}
	}
};

// Start mjpeg-streamer process
MStreamer.prototype.start = function(callback) {
	if(isCapturing) {
		console.log("already capturing");
		return;
	}

	fs.exists(options.device, function(exists) {
		if(!exists) {
			print("device location not fount: " + options.device);
			return;
		}

		process = spawn(cmd, getArgs());
		isCapturing = true;

	    process.stdout.on('data', function (data) {
	    	print("stdout: " + data);
	    });
	  
	    process.stderr.on('data', function (data) {
	    	callback(data);
	    	print("stderr: " + data);
	    });
	  
	    process.on('exit', function (code) {
	    	print('child process exited with code ' + code);
	    }); 

	    print("started streaming on port: " + options.port);
	});
};
// Stop mjpeg-streamer process
MStreamer.prototype.stop = function() {
	if(!isCapturing)  {
		print("Not capturing");
		return;
	}
	process.kill(process.pid, 'SIGHUP');
	isCapturing = false;
};

var print = function(msg) {
	console.log(cmd + ": " + msg);
}


module.exports = MStreamer;