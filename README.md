# whatsvote-server
Instant Messaging voting system

*This is a very WIP type of project.
It generally works, but because WhatsApp discourages sending large amounts of messages,
the bot will probably be blocked when used in large groups.*

## What this is
The Idea of WhatsVote is to bring online voting and instant messaging (i.e. WhatsApp).
With this you can make sure that one person has one and only one vote while the vote is anonymous.
It also allows for more complex voting systems and of course automatic counting of votes.
Participants can't see the results until the end, so they are not influenced by the decision of others.

## How this works
WhatsVote comes in many parts you have to put together yourself or with a little help from docker containers.

### [Axiom](https://github.com/xanecs/axiom)
This is the message gateway that sends and receives messages via WhatsApp.
It is built around the amazing [yowsup](https://github.com/tgalal/yowsup) library.
Installation instructions can be found in the README.

### [MQTT](http://mqtt.org)
This is a message broker that is used to pass messages between the python whatsapp gateway and the nodejs backend server.
There are many implementations available any of them will work. I test and develop with [mosquitto](http://mosquitto.org) though.

### [RethinkDB](https://www.rethinkdb.com)
The backend uses RethinkDB to store all of its data. This has been chosen for its real-time capabilites.

### WhatsVote Server
This very project. It handles the business logic (processing votes, registrations, etc).

### [WhatsVote Frontend](https://github.com/xanecs/whatsvote-frontend)
This is the browser interface the user will see. To 'install' it, just put it on a web server. It is a javascript app that will connect to the WhatsVote server.

