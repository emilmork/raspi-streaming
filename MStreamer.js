
var spawn = require('child_process').spawn;
var fs = require('fs');

var cmd = "mjpg_streamer";

var isCapturing = false;
var process;
//Constructor
var MStreamer = function(args){
	
	//default options
	this.options = {
	    device : '/dev/video0',
	    resolution : 'SVGA',
	    framerate : 15,
	    port : 8090,
	    fileFolder : 'usr/local/lib/'
	  };

	if(args) {
		this.setOptions(args);
	} 
};

// Returns mjpeg-streamer arguments
var getArgs = function() {
	return [ '-i' ,
              this.options.fileFolder +'input_uvc.so -r ' + this.options.resolution + ' -f ' + this.options.framerate,
              '-o',
              this.options.fileFolder + 'output_http.so -p ' + this.options.port
            ];
}

//Set mjpeg-streamer options
MStreamer.prototype.setOptions = function(args) {
	for(var key in args) {
		if(args.hasOwnProperty(key)) {
			if(!this.options.hasOwnProperty(key)) {
				print(key + " is not a valid property");
				continue;
			}
			this.options[key] = args[key];
			print(key + " set to: " + args[key]);
		}
	}
};

// Start mjpeg-streamer process
MStreamer.prototype.start = function(callback) {
	var _self = this;

	if(isCapturing) {
		console.log("already capturing");
		return;
	}

	fs.exists(this.options.device, function(exists) {
		if(!exists) {
			print("device location not found: " + _self.options.device);
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

	    print("started streaming on port: " + _self.options.port);
	});
};
// Stop mjpeg-streamer process
MStreamer.prototype.stop = function() {
	if(!isCapturing)  {
		print("not capturing");
		return;
	}
	process.kill(process.pid, 'SIGHUP');
	isCapturing = false;
	
	print("stopped");
};

var print = function(msg) {
	console.log(cmd + ": " + msg);
}


module.exports = MStreamer;