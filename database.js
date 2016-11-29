var neo4j = require('neo4j-driver').v1,
    openGraph = require('./opengraph').openGraph,
    _ = require('lodash');

const USERNAME = "neo4j";
const PASSWORD = "abc";

var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic(USERNAME, PASSWORD));
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
            "MERGE (from {url:{parentUrl}, description:{parentDescription}, image_url:{parentImageUrl}, type:{parentType}, title:{parentTitle}, site_name:{parentSitename}}) " +
            "MERGE (to {url:{childUrl}, description:{childDescription}, image_url:{childImageUrl}, type:{childType}, title:{childTitle}, site_name:{childSitename}}) " +
            "MERGE p=(from)-[r:related]->(to) " +
            "ON CREATE SET r.votes = 1 " +
            "ON MATCH SET r.votes = r.votes + 1 " +
            "RETURN p", keys)
    });
}

function getRelationsQuery(parentUrl) {
    return session
        .run("" +
        "MATCH (article { url:{id} })-[:related]-(relation)" +
        "RETURN article, relation;", {id: parentUrl});
}

function getRelations(parentUrl) {
    return getRelationsQuery(parentUrl)
        .then((result) => {
            var parent;
            var records = [];

            for (i = 0; i < result.records.length; i++) {
                var record = result.records[i];
                if (!parent) {
                    parent = record.get("article").properties;
                }
                var relation = record.get("relation");

                records.push(relation.properties)
            }

            return _.merge(parent,
                {items: records});
        });
}

module.exports = { getRelations: getRelations, associate: associate };
