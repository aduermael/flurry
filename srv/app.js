
// http://support.flurry.com/index.php?title=Publisher/GettingStarted/ManageRewards


var express = require('express');
var crypto = require('crypto');
var db = require('./db').connect();

// Flurry secret key should be set as "SECRET" environment variable
var secretKey = process.env.SECRET;

var app = express();

app.get('/reward',reward);
app.get('/collect',collect);

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
	var userid = req.query.userid; // to associate reward with user
	
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
				multi.sadd("users",userid);
				multi.sadd(userid,fguid);
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
	
	// always return 200
	res.end();	
}




function collect(req,res)
{	
	var userid = req.query.userid;
	
	
	if (userid)
	{
		var reward = 0;
		
		// check if user has potential rewards
		db.sismember("users",userid,function(err,value)
		{
			if (!err && value == 1)
			{				
				db.smembers(userid,function(err,rewards)
				{	
					var multi = db.multi();
					
					rewards.forEach(function(reward)
					{
						multi.hget(reward,"qty");
					});
					
					multi.exec(function(err,quantities)
					{
						if (!err)
						{
							console.log("quantities: " + JSON.stringify(quantities));
							
							
							quantities.forEach(function(quantity)
							{
								reward += parseInt(quantity);
							});
							
							var multi = db.multi();
							multi.srem("rewards",rewards); // remove rewards from set
							multi.del(rewards); // delete rewards
							multi.srem("users",userid); // remove user from set
							multi.del(userid); // delete user
							
							multi.exec(function(err)
							{
								if (!err)
								{
									end(res,{reward:reward});
								}
								else
								{
									error(res,"Can't delete user and rewards.");
								}
							});
						}
						else
						{
							error(res,"Can't get reward quantities.");
						}
					});
				});
			}
			else
			{
				error(res,"There are no rewards for that user (" + userid + ")");
			} 
		});
	}
	else
	{
		error(res,"User ID is required.");
	}
}


function error(res,msg)
{
	var err = {};
	err.error = msg;
	
	console.log("ERROR: " + msg);
	
	res.statusCode = 500;
	res.end(msg);
}


function end(res,obj)
{
	var body = JSON.stringify(obj);
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Content-Length', body.length);
	res.end(body);
}

