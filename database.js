var neo4j = require('neo4j-driver').v1,
    openGraph = require('./opengraph').openGraph,
    _ = require('lodash');

const USERNAME = process.env.GRAPHENEDB_BOLT_USER; // "neo4j";
const PASSWORD = process.env.GRAPHENEDB_BOLT_PASSWORD; // "abc";
const BOLT_URL = process.env.GRAPHENEDB_BOLT_URL; // "bolt://localhost";

var driver = neo4j.driver(BOLT_URL, neo4j.auth.basic(USERNAME, PASSWORD));
driver.onError = function (err) { console.log(err); }
var session = driver.session();

function associate(parentUrl, childUrl) {
    return Promise.all([
        openGraph(parentUrl),
        openGraph(childUrl)
    ]).then(([
        {
            url: parentUrl,
            description: parentDescription,
            image: parentImage,
            type: parentType,
            title: parentTitle,
            site_name: parentSitename
        },
        {
            url: childUrl,
            description: childDescription,
            image: childImage,
            type: childType,
            title: childTitle,
            site_name: childSitename
        }
    ]) => {
        const keys = {
            parentUrl: parentUrl,
            parentDescription: parentDescription,
            parentImageUrl: parentImage.url,
            parentType: parentType,
            parentTitle: parentTitle,
            parentSitename: parentSitename,
            childUrl: childUrl,
            childDescription: childDescription,
            childImageUrl: childImage.url,
            childType: childType,
            childTitle: childTitle,
            childSitename: childSitename
        };
        return session
            .run(
            "MERGE (from {url:{parentUrl}})" +
            "ON CREATE SET from.description={parentDescription}," +
            "from.image_url={parentImageUrl}," +
            "from.type={parentType}," +
            "from.title={parentTitle}," +
            "from.site_name={parentSitename}" +
            "MERGE (to {url:{childUrl}})" +
            "ON CREATE SET to.description={childDescription}," +
            "to.image_url={childImageUrl}," +
            "to.type={childType}," +
            "to.title={childTitle}," +
            "to.site_name={childSitename} " +
            "MERGE p=(from)-[r:related]->(to) " +
            "ON CREATE SET r.likes = 1 " +
            "ON MATCH SET r.likes = r.likes + 1 " +
            "RETURN p", keys)
    });
}

function getRelationsQuery(parentUrl) {
    return session
        .run("" +
        "MATCH (parent { url:{id} })-[edge:related]-(child)" +
        "OPTIONAL MATCH (child)-[secondEdge:related]-(secondChild)" +
        "WHERE parent <> secondChild " +
        "RETURN parent, edge, child, secondEdge, secondChild " +
        "ORDER BY edge.likes DESC;", {id: parentUrl});
}

function getRelations(parentUrl) {
    return getRelationsQuery(parentUrl)
        .then((result) => {
            var parent;
            var records = [];

            for (i = 0; i < result.records.length; i++) {
                var record = result.records[i];
                var edge = record.get("edge");
                var child = record.get("child");

                if (!parent) {
                    parent = record.get("parent").properties;
                }

                if (parent && parent.url === child.properties.url) {
                    parent = _.merge(parent, {likes: edge.properties.likes.toInt()});
                }

                var childWithLikesFromEdge = _.merge(
                    child.properties,
                    {likes: edge.properties.likes.toInt()});

                if (childWithLikesFromEdge && !_.find(records, record => record.url === childWithLikesFromEdge.url)) {
                    records.push(childWithLikesFromEdge);
                }

                var secondEdge = record.get("secondEdge");
                var secondChild = record.get('secondChild');
                if (secondChild) {
                    var secondChildWithLikesFromEdge = _.merge(
                        secondChild.properties,
                        {likes: secondEdge.properties.likes.toInt()});


                    if (secondChildWithLikesFromEdge && !_.find(records, record => record.url === secondChildWithLikesFromEdge.url)) {
                        records.push(secondChildWithLikesFromEdge);
                    }
                }
            }

            if(parent && !_.find(records, record => record.url === parent.url)) {
                records.push(_.merge(parent, {likes: 0}));
            }


            var deduplicatedRecords = _.uniq(records, 'url');
            var sortedRecords = _.sortBy(deduplicatedRecords, record => record.likes).reverse();

            return {parent: parent, items: sortedRecords};
        });
}

module.exports = { getRelations: getRelations, associate: associate };
