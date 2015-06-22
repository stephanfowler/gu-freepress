/*
create table items (topic text NOT NULL, url text NOT NULL, likes INT, title text, description text, image_url text, site_name text, unique (url, topic));
*/

var express = require('express'),
    bodyParser = require('body-parser'),
    pg = require('pg'),
    og = require('open-graph'),
    sql = require('sql'),
    sha1 = require('sha1'),
    Promise = require('promise'),
    _ = require('lodash'),

    app = express(),
    urlencodedParser = bodyParser.urlencoded({ extended: false }),
    itemsSchema = {
        name: 'items',
        columns: ['topic', 'url', 'likes', 'title', 'description', 'image_url', 'site_name']
    },
    items = sql.define(itemsSchema);


app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

function clean(url) {
    return (url || '').split(/[\?\#]+/)[0];
}

function db(queryObj) {
    return new Promise(function (fulfill, reject){
        pg.connect(process.env.DATABASE_URL + '?ssl=true', function(err, client, done) {
            client.query(queryObj.text, queryObj.values, function(err, result) {
                done();
                if (err) {
                    reject(err);
                } else {
                    fulfill(result);
                }
            });
        });
    });
};

function openGraph(url) {
    return new Promise(function (fulfill, reject) {
        og(url, function (err, result) {
            if (err) {
                reject(err);
            } else if (!result || !_.isObject(result) || !result.title) {
                reject('No OpenGraph data');
            } else {
                result.url = url;
                fulfill(result);
            }
        })
    });
};

function getTopics(url) {
    return db(
        items.select(items.topic)
          .from(items)
          .where(items.url.equals(url))
          .limit(1)
          .toQuery()
    );
}

function addItem(ogMeta, topic) {
    var props = itemsSchema.columns.reduce(function(props, key) {
            props[key] = ogMeta[key] || null;
            return props;
        }, {});

    props.topic = topic;
    props.likes = 1;
    props.image_url = ogMeta.image ? ogMeta.image.url : null;

    return db(items.insert(props).toQuery());
}

app.get('/', function(req, res) {
    var parentUrl = req.query.parentUrl,
        form = '<form method="post" action="/"><input name="parentUrl" type="hidden" value="' + parentUrl + '"><input style="width: 50%;" type="text" name="childUrl"><input type="submit"></form>';

    if (parentUrl) {
        getTopics(parentUrl)
        .then(function (result) {
            var topic;

            if (result.rows && result.rows[0]) {
                topic = result.rows[0].topic;
                getTopicItems(topic).then(
                    function(result) {
                        res.send(form + '<pre>' + JSON.stringify(result.rows, null, 4) + '</pre>');
                    },
                    function(err) {
                        res.send(err);
                    }
                );
            } else {
                res.send(form);
            }
        }); 
    } else {
        res.send('No parentUrl query param!')
    }
});

app.post('/', urlencodedParser, function (req, res) {
    var childUrl,
        parentUrl,
        query;

    if (!req.body) {
        return res.sendStatus(400);
    }

    childUrl = clean(req.body.childUrl);
    parentUrl = clean(req.body.parentUrl);

    if (childUrl && parentUrl) {
        getTopics(parentUrl).then(
            function(result) {
                var topic,
                    openGraphs = [openGraph(childUrl)];

                if (result.rows && result.rows[0]) {
                    topic = result.rows[0].topic;
                } else {
                    topic = sha1(parentUrl);
                    openGraphs.push(openGraph(parentUrl));
                }

                Promise.all(openGraphs)
                .catch(function(err) {
                    res.redirect("/?error=openGraphs&parentUrl=" + parentUrl);
                })
                .then(function(ogMetas) {
                    Promise.all(
                        ogMetas.map(function (ogMeta) {
                            return addItem(ogMeta, topic);
                        })
                    )
                    .catch(function(err) {
                        res.redirect("/?error=addItems&parentUrl=" + parentUrl);
                    })
                    .then(function() {
                        res.redirect("/?parentUrl=" + parentUrl);
                    })
                })
            },
            function(err) {
                res.send(err);
            }
        );
    } else {
        res.send('No parentUrl form value!')
    }
})

function getTopicItems(topic) {
    return db(
        items.select(items.star())
        .from(items)
        .where(items.topic.equals(topic))
        .toQuery()
    );
}

app.listen(app.get('port'), function() {
    console.log('Node app running on port', app.get('port'));
});
