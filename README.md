flurry
======

A callback server for Flurry, running in a Docker container. 
(http://support.flurry.com/index.php?title=Publisher/GettingStarted/ManageRewards)

_Run the container:_
docker run -e "SECRET=<SECRET_KEY>" -t -i -d -p <PORT>:80 <IMAGE_NAME>
