
// http://support.flurry.com/index.php?title=Publisher/GettingStarted/ManageRewards


var express = require('express');
var crypto = require('crypto');
var db = require('./db').connect();

var secretKey = process.env.SECRET;

var app = express();

app.get('/reward',reward);

var port = 80;

app.listen(port, function() {
  console.log("Listening on " + port);
  console.log("Secret key: " + secretKey);
});


// FUNCTIONS

function reward(req,res)
{	
	console.log("URL: " + req.url);
	
	var fguid = req.query.fguid;
	var rewardQuantity = req.query.rewardquantity;
	var fhash = req.query.fhash;
	var udid = req.query.udid; // to associate reward with user
	
	var md5digest = crypto.createHash('md5').update(fguid + ':' + rewardQuantity + ':' + secretKey).digest('hex');
	
	if(md5digest == fhash)
	{	
		// check if reward not already registered
		db.sismember("rewards",fguid,function(err,value)
		{
			if (!err && value == 0)
			{				
				var multi = db.multi();
				multi.sadd("rewards",fguid);
				multi.sadd("users",udid);
				multi.sadd(udid,fguid);
				multi.hmset(fguid,'qty',rewardQuantity,'collected',false);
				multi.exec();
			}
			else
			{
				console.log("ERROR: Reward already registered");
			}
		});
    }
    else
    {
	    console.log("ERROR: Hash can't be verified");
    }
	
	res.end();	
}
