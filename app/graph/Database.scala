package graph

import controllers.Association
import org.anormcypher._

import org.anormcypher.CypherParser._
import play.api.libs.json.Json


case class Article(id: String)
case class Relations(article: Article, relations: List[Article])

object Article {
  implicit val articleFormat = Json.format[Article]
}

object Relations {
  implicit val relationsFormat = Json.format[Relations]
}

object Database {
  implicit val databaseConnection = Neo4jREST(username="neo4j", password="abc")

  def associate(association: Association): Boolean = {
    val result = Cypher(
      """
        |MERGE (from {id:{from}})
        |MERGE (to {id:{to}})
        |MERGE p=(from)-[:related]-(to)
        |RETURN p
      """.stripMargin)
    .on(
        "from" -> association.from,
        "to" -> association.to)
    .apply()

    result.nonEmpty
  }

  def relations(id: String): Option[Relations] = {
    val relations: List[(String, String)] = Cypher(
      """
        |MATCH (article { id:{id} })-[:related]-(relation)
        |RETURN article.id, relation.id;
      """.stripMargin)
      .on("id" -> id)
      .as(str("article.id") ~ str("relation.id") map(flatten) *)

    relations.headOption.map { f =>
      Relations(Article(f._1), relations.map(r => Article(r._2)))
    }
  }

  def allRelations: List[Relations] = {
    val relations: List[(String, String)] = Cypher(
      """
        |MATCH (article)-[:related]-(relation)
        |RETURN article.id, relation.id;
      """.stripMargin)
      .as(str("article.id") ~ str("relation.id") map(flatten) *)

    relations.map(_._1).distinct.map { id =>
      Relations(Article(id), relations.filter(_._1 == id).map(r => Article(r._2)))
    }
  }
}
