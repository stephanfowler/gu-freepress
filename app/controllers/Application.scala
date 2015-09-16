package controllers

import java.net.URL

import graph.Database
import model.Basic
import opengraph.FreePressOpenGraph
import play.api.libs.json.{JsResult, JsError, JsSuccess, Json}
import play.api.mvc._

import scala.util.Try

case class Node(id: String) //Shape, Image
case class Edge(from: String, to: String)

object Node {
  implicit val nodeFormat = Json.format[Node]
}

object Edge {
  implicit val edgeFormat = Json.format[Edge]
}

case class Association(from: String, to: String, weight: Option[Long])

object Association {
  implicit val associationFormat = Json.format[Association]
}

//Carry Basic for now, remove to own type
case class ValidAssociation(from: Basic, to: Basic, weight: Option[Long])

object Application extends Controller {

  def index = Action { Ok(views.html.index(Database.allRelations) ) }

  private def normaliseUrl(url: String): Option[String] =
    Try(new URL(url))
      .map(u => s"${u.getProtocol}://${u.getHost}${u.getPath}")
      .toOption

  private def normaliseAssociationUrls(assoc: Association): Option[Association] =
    for {
      from <- normaliseUrl(assoc.from)
      to <- normaliseUrl(assoc.to)
    } yield Association(from, to, assoc.weight)

  def associateFormPost = Action { request =>
    val maybeAssociation: Option[Association] = for {
      form <- request.body.asFormUrlEncoded
      from <- form.get("from").map(_.mkString).flatMap(normaliseUrl)
      to <- form.get("to").map(_.mkString).flatMap(normaliseUrl)
    } yield Association(from, to, None)

    val maybeValidAssociation: Option[(Association, ValidAssociation)] =
      maybeAssociation.flatMap(assoc => checkAssociation(assoc).map(assoc -> _))

    maybeValidAssociation match {
      case Some((assoc, validAssoc)) =>
        Database.associate(assoc, validAssoc)
        SeeOther("/")
      case None =>
        InternalServerError("Incorrect form data")
    }
  }

  def associate = Action { request =>
    val maybeNormalisedAssociation: Option[JsResult[Association]] = request.body.asJson
      .map(_.validate[Association])
      .map(_.flatMap(assoc =>
        normaliseAssociationUrls(assoc)
          .fold[JsResult[Association]](JsError("Could not normalise Urls"))(JsSuccess(_))))

    maybeNormalisedAssociation match {
      case Some(JsSuccess(assoc, _)) =>
        val maybeValidAssociation: Option[ValidAssociation] = checkAssociation(assoc)

        maybeValidAssociation match {
          case Some(validAssoc) =>
            val result = Database.associate(assoc, validAssoc)
            Ok(result.toString)
          case None =>
            InternalServerError("Not a valid association: could not parse OpenGraph data")}

      case Some(JsError(_)) => InternalServerError("Feed me the correct JSON")
      case None => InternalServerError("Feed me JSON")
    }
  }

  def relations(id: String) = Action { request =>
    val maybeRelations = Database.relations(id)
    maybeRelations match {
      case Some(relations) => Ok(Json.toJson(relations)).as("application/json")
      case _ => InternalServerError
    }
  }

  def nodesAndEdgesFor(id: String) = Action { request =>
    val maybeRelations = Database.relations(id)
    maybeRelations match {
      case Some(relations) =>
        val nodes: List[Node] = relations.relations.map(r => Node(r.id)) :+ Node(relations.article.id)
        val edges: List[Edge] = relations.relations.map(r => Edge(relations.article.id, r.id))

        val json = Json.obj(
          "nodes" -> nodes,
          "edges" -> edges)

        Ok(Json.prettyPrint(json)).as("application/json")
      case _ => InternalServerError
    }
  }

  private def checkAssociation(assoc: Association): Option[ValidAssociation] =
    FreePressOpenGraph.getTwo(assoc.from, assoc.to)
      .map{ case (from: Basic, to: Basic) => ValidAssociation(from, to, assoc.weight)}
}

