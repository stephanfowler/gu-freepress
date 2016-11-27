/*
create table items (created timestamp not null default now(), topic text NOT NULL, url text NOT NULL, likes INT, title text, description text, image_url text, site_name text, unique (url, topic));
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
        columns: ['created', 'topic', 'url', 'likes', 'title', 'description', 'image_url', 'site_name']
    },
    items = sql.define(itemsSchema);


app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

function clean(url) {
    return (url || '').split(/[\?\#]+/)[0];
}

function db(queryObj) {
    return new Promise(function (fulfill, reject) {
        pg.connect(process.env.DATABASE_URL + '?ssl=true', function(err, client, done) {
            if (err) {
                reject(err);
            } else {
                client.query(queryObj.text, queryObj.values, function(err, result) {
                    done();
                    if (err) {
                        reject(err);
                    } else {
                        fulfill(result);
                    }
                });
            }
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

function getTopicFromUrl(url) {
    return db(
        items.select(items.topic)
          .from(items)
          .where(items.url.equals(url))
          .toQuery()
    ).then(function (result) {
        if (result.rows && result.rows[0]) {
            return result.rows[0].topic;
        }
    });
}

function addItem(ogMeta, topic) {
    var props = itemsSchema.columns.reduce(function(props, key) {
            if (ogMeta[key]) {
                props[key] = ogMeta[key];
            }
            return props;
        }, {});

    props.topic = topic;
    props.likes = 0;

    props.image_url = ogMeta.image ? ogMeta.image.url : null;
    props.image_url = _.isArray(ogMeta.image.url) ? ogMeta.image.url[0] : ogMeta.image.url;

    props.site_name = props.site_name.replace(/^the/, 'The');

    return db(items.insert(props).toQuery());
}

function likeItem (url) {
    return db({
        text:'UPDATE items SET likes = likes + 1 WHERE (items.url = $1)',
        values: [url]
    });
}

function getTopicItems(topic) {
    return db(
        items.select(items.star())
        .from(items)
        .where(items.topic.equals(topic))
        .order(items.likes.descending, items.created.descending)
        .toQuery()
    );
}

function getTopicItemsGuardian(topic) {
    return db(
        items.select(items.star())
        .from(items)
        .where(items.topic.equals(topic), items.url.like('%theguardian.com/%'))
        .order(items.likes.descending, items.created.descending)
        .limit(1)
        .toQuery()
    );
}

function respondWithTopicItems(res, topic, stickyUrl) {
    getTopicItems(topic).then(
        function(result) {
            var items = stickyUrl ? _.sortBy(result.rows, function(item) {
                    return item.url !== stickyUrl;
                }) : result.rows;

            res.status(200);
            res.send({
                items: items.slice(0, 6)
            });
        },
        function(err) {
            res.status(304);
            console.log('Failed fetching that topic');
        }
    );
}

app.get('/', function(req, res) {
    var parentUrl = req.query.parentUrl,
        title = req.query.title,
        asGuPopup = req.query.asGuPopup,
        getItems  = asGuPopup ? getTopicItemsGuardian : getTopicItems;

    if (parentUrl) {
        getTopicFromUrl(parentUrl)
        .then(function (topic) {
            if (topic) {
                getItems(topic).then(
                    function(result) {
                        res.render('index', {
                            title: title,
                            asGuPopup: asGuPopup,
                            parentUrl: parentUrl,
                            items: result.rows.slice(0, 6)
                        });
                    },
                    function(err) {
                        res.send(err);
                    }
                );
            } else {
                res.render('index', { 
                    parentUrl: parentUrl
                });
            }
        }); 
    } else {
        res.send('No parentUrl query param!')
    }
});

app.get('/api/show-popup', function(req, res) {
    var parentUrl = req.query.parentUrl;

    res.setHeader('Content-Type', 'application/json');
    res.status(200);
    
    if (parentUrl) {
        getTopicFromUrl(parentUrl)
        .then(function (topic) {
            if (topic) {
                getTopicItemsGuardian(topic)
                .then(
                    function(result) {
                        res.send(!!result.rows[0]);
                    },
                    function(err) {
                        res.send(err);
                    }
                );
            } else {
                res.send(false);
            }
        }); 
    } else {
        res.send(false);
    }
});

app.post('/api/like', urlencodedParser, function (req, res) {
    var url = clean(req.body.url),
        topic = clean(req.body.topic);

    if (url) {
        likeItem(url)
        .then(
            function (result) {
                respondWithTopicItems(res, topic);
            },
            function (err) {
                res.status(500);
            }
        );
    } else {
        res.status(400);
    }
});

app.post('/api/add', urlencodedParser, function (req, res) {
    var parentUrl = clean(req.body.parentUrl),
        childUrl  = clean(req.body.childUrl),
        specs;

    res.setHeader('Content-Type', 'application/json');
    
    if (parentUrl && childUrl) {
        specs = [
            {url: parentUrl, topic: getTopicFromUrl(parentUrl)},
            {url: childUrl,  topic: getTopicFromUrl(childUrl)}
        ];

        Promise.all(
            _.pluck(specs, 'topic')
        ).then(
            function(topics) {
                var topic = _.compact(topics)[0];

                if (!topic) {
                    topic = sha1(parentUrl);
                }

                topics.forEach(function(topic, i) {
                    specs[i].topic = topic; // convert promise to value
                })

                Promise.all(
                    specs
                    .filter(function(spec) {
                        return !spec.topic; // only fetch OG data for urls that havent previously been registered
                    })
                    .map(function(spec) {
                        return openGraph(spec.url);
                    })                    
                )
                .catch(function(err) {
                    res.status(304);
                    res.send({err: 'Failed to find opengraph data'});
                })
                .then(function(ogMetas) {
                    Promise.all(
                        ogMetas.map(function (ogMeta) {
                            return addItem(ogMeta, topic);
                        })
                    )
                    .catch(function(err) {
                        res.status(304);
                        respondWithTopicItems(res, topic, childUrl);
                    })
                    .then(function() {
                        res.status(200);
                        respondWithTopicItems(res, topic, childUrl);
                    })
                })
            },
            function(err) {
                res.status(500);
                res.send({err: 'Failed while talking to database'});
            }
        );
    } else {
        res.status(400);
        res.send({err: 'No parentUrl and childUrl'});
    }
})

app.listen(app.get('port'), function() {
    console.log('Node app running on port', app.get('port'));
});
