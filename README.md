flurry
======

A callback server for Flurry, running in a Docker container.

(http://support.flurry.com/index.php?title=Publisher/GettingStarted/ManageRewards)

### Pull the container:
```
docker pull aduermael/flurry
```

### Run the container:
```
docker run -e "SECRET=<SECRET_KEY>" -t -i -p <PORT>:80 aduermael/flurry
```

### Flurry config:

Publishers > Manage > Rewarded Options > Edit Rewards

In the **Callback URL** field:
**http://[HOST]:[PORT]/reward**

If you wanna check directly from that page, change the address to:
**http://[HOST]:[PORT]/reward?userid=%{udid}**

Enter  something in the **UDID** field and hit **Test Response** button.

### Client side:

Don't forget to set a Flurry session cookie: **"userid" = [SOME USER ID]**

To get the rewards: 

**GET http://[HOST]:[PORT]/collect?userid=[SOME USER ID]**

Check if you get the rewards from Flurry, and if users can collect them.
Then detach from the container using the escape sequence: **Ctrl-p + Ctrl-q**
