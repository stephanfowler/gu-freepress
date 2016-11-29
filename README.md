# Free Press

Prototype system for crowdsourcing “related content” for arbitrary articles. The idea is to promote the Guardian as first-port-of-call news destination by identifying quality journalism - through consensus - from across the news ecosystem. It could be syndicated to participating orgs, and could potentially pop-up on non-participating sites to drive traffic to related Guardian articles.


![Alt text](docs/free-press.gif)

_Developed for Guardian HackDay._

## Installing the extension

* clone the repo
* go to your Chrome Extensions page
* allow "Developer mode"
* click "Load unpacked extension..."
* choose the "chrome-extension" directory from your repo copy
* make sure "Enabled" is checked

## Development

* `npm i`
* compile the code in public/js with `npm run build`

#### neo4j

Unfinished experiment in using a proper graph representation of the data. This is not connected yet to the chrome extension. 

Install and run `neo4j` community edition. After running it, go to `http://localhost:7474/` to setup an initial account. The default username is `neo4j`. Upon logging in you will be asked to enter a default **password**, enter `abc`.

Once `neo4j` is up and running, go to root of project and make sure `sbt` is on your path. Run `sbt` and then type `run`.

Go to `http://localhost:9000/` to start using.
