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
                if (!parent) {
                    parent = record.get("parent").properties;
                }
                var edge = record.get("edge");
                var child = record.get("child");

                var childWithLikesFromEdge = _.merge(
                    child.properties,
                    {likes: edge.properties.likes.toInt()});

                var secondEdge = record.get("secondEdge");
                var secondChild = record.get('secondChild');
                var secondChildWithLikesFromEdge = _.merge(
                    secondChild.properties,
                    {likes: secondEdge.properties.likes.toInt()});


                records.push(childWithLikesFromEdge);
                records.push(secondChildWithLikesFromEdge);
            }

            records.push(parent);

            var deduplicatedRecords = _.uniq(records, 'url');

            return {parent: parent, items: deduplicatedRecords};
        });
}

module.exports = { getRelations: getRelations, associate: associate };
