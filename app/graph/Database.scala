package graph

import controllers.{ValidAssociation, Association}
import org.anormcypher._

import org.anormcypher.CypherParser._
import play.api.libs.json.Json


case class Article(id: String, title: Option[String], image: Option[String])
case class Relations(article: Article, relations: List[Article])

object Article {
  implicit val articleFormat = Json.format[Article]
}

object Relations {
  implicit val relationsFormat = Json.format[Relations]
}

object Database {
  implicit val databaseConnection = Neo4jREST(username="neo4j", password="abc")

  def associate(association: Association, validAssociation: ValidAssociation): Boolean = {
    val result = Cypher(
      """
        |MERGE (from {id:{from}, title:{fromTitle}, image:{fromImage}})
        |MERGE (to {id:{to}, title:{toTitle}, image:{toImage}})
        |MERGE p=(from)-[:related]->(to)
        |RETURN p
      """.stripMargin)
    .on(
        "from" -> association.from,
        "fromTitle" -> validAssociation.from.title,
        "fromImage" -> validAssociation.from.image,
        "to" -> association.to,
        "toTitle" -> validAssociation.to.title,
        "toImage" -> validAssociation.to.image
      )
    .apply()

    result.nonEmpty
  }

  def relations(id: String): Option[Relations] = {
    val relations: List[(String, Option[String], Option[String], String, Option[String], Option[String])] = Cypher(
      """
        |MATCH (article { id:{id} })-[:related]-(relation)
        |RETURN article.id, article.title, article.image, relation.id, relation.title, relation.image;
      """.stripMargin)
      .on("id" -> id)()
      .map { row =>
        (
          row[String]("article.id"),
          row[Option[String]]("article.title"),
          row[Option[String]]("article.image"),
          row[String]("relation.id"),
          row[Option[String]]("relation.title"),
          row[Option[String]]("relation.image"))
      }.toList

    relations.headOption.map { f =>
      Relations(Article(f._1, f._2, f._3), relations.map(r => Article(r._4, r._5, r._6)))
    }
  }

  def allRelations: List[Relations] = {
    val relations = Cypher(
      """
        |MATCH (article)-[:related]-(relation)
        |RETURN article.id, article.title, relation.id, relation.title;
      """.stripMargin)().map { row =>
      (row[String]("article.id"), row[Option[String]]("article.title"), row[String]("relation.id"), row[Option[String]]("relation.title"))
    }

    relations.toList.map(r => r._1 -> r._2).distinct.map { case (id, title) =>
      Relations(Article(id, title, None), relations.toList.filter(_._1 == id).map{ case (_, _, i, t) => Article(i, t, None)})
    }
  }
}
