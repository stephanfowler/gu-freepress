var express = require('express'),
    bodyParser = require('body-parser'),
    pg = require('pg'),
    og = require('open-graph'),

    app = express(),
    urlencodedParser = bodyParser.urlencoded({ extended: false });

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
    response.send('<form method="post" action="/"><input type="text" name="newurl"><input type="submit"></form>');
});

app.post('/', urlencodedParser, function (req, res) {
    if (!req.body) return res.sendStatus(400)

    og(req.body.newurl, function(err, meta){
        if (err) {
            res.send("Error... " + err);
        }
        else if (!meta || !meta.title) {
            res.send('Nothing found there...');
        }
        else {
            res.send(meta);
        }
    })
})

app.get('/db', function (request, response) {
    pg.connect(process.env.DATABASE_URL + '?ssl=true', function(err, client, done) {
          client.query('SELECT * FROM test_table', function(err, result) {
              done();
              if (err) {
                  console.error(err);
                  response.send("Error " + err);
              }
              else {
                  response.send(result.rows);
              }
          });
      });
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
