/*
create table items (created timestamp not null default now(), topic text NOT NULL, url text NOT NULL, likes INT, title text, description text, image_url text, site_name text, unique (url, topic));
*/

var express = require('express'),
    bodyParser = require('body-parser'),
    sha1 = require('sha1'),
    Promise = require('promise'),
    _ = require('lodash'),
    app = express(),
    urlencodedParser = bodyParser.urlencoded({ extended: false }),
    database = require('./database');


app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

function clean(url) {
    return (url || '').split(/[\?\#]+/)[0];
}

app.get('/', function(req, res) {
    var parentUrl = req.query.parentUrl;

    if (parentUrl) {
        database.getRelations(parentUrl)
        .then(function (relations) {
                if(relations && relations.items) {
                    res.setHeader('Cache-Control', 'no-cache');
                    res.setHeader('Expires', '0');
                    res.render('index', {
                        parentUrl: parentUrl,
                        items: relations.items
                    });
                } else {
                    res.render('index', {
                        parentUrl: parentUrl
                    });
                }
            })
        .catch((err) => {
                res.status(500);
                res.send({err: 'Failed while talking to database'})
            });
    }
    else {
        res.send('No parentUrl query param!')
    }
});


app.post('/api/like', urlencodedParser, function (req, res) {
    var parentUrl = clean(req.body.parentUrl),
        childUrl = clean(req.body.childUrl);

    if (parentUrl && childUrl) {
        database.associate(parentUrl, childUrl)
            .then(_ => database.getRelations(parentUrl))
            .then((relations) => {
                res.status(200);
                res.send({
                    items: relations.items
                })
            })
            .catch((err) => {
                res.status(500);
                res.send({err: 'Failed while talking to database'})
            });
    } else {
        res.status(400);
    }
});

app.post('/api/add', urlencodedParser, function (req, res) {
    var parentUrl = clean(req.body.parentUrl),
        childUrl  = clean(req.body.childUrl);

    res.setHeader('Content-Type', 'application/json');
    
    if (parentUrl && childUrl) {
        database.associate(parentUrl, childUrl)
            .then(_ => database.getRelations(parentUrl))
            .then((relations) => {
                res.status(200);
                res.send({
                    items: relations.items
                });
            })
            .catch((err) => {
                res.status(500);
                res.send({err: 'Failed while talking to database'});
            });
    } else {
        res.status(400);
        res.send({err: 'No parentUrl and childUrl'});
    }
});

app.listen(app.get('port'), function() {
    console.log('Node app running on port', app.get('port'));
});
