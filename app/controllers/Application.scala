package controllers

import graph.Database
import model.{Basic, OpenGraphElement}
import opengraph.FreePressOpenGraph
import play.api.libs.json.{JsError, JsSuccess, Json}
import play.api.mvc._

case class Association(from: String, to: String, weight: Option[Long])

object Association {
  implicit val associationFormat = Json.format[Association]
}

//Carry Basic for now, remove to own type
case class ValidAssociation(from: Basic, to: Basic, weight: Option[Long])

object Application extends Controller {

  def index = Action { Ok(views.html.index(Database.allRelations) ) }

  def associateFormPost = Action { request =>
    val maybeAssociation: Option[Association] = for {
      form <- request.body.asFormUrlEncoded
      from <- form.get("from").map(_.mkString)
      to <- form.get("to").map(_.mkString)
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
    request.body.asJson.map(_.validate[Association]) match {
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

  private def checkAssociation(assoc: Association): Option[ValidAssociation] =
    FreePressOpenGraph.getTwo(assoc.from, assoc.to)
      .map{ case (from: Basic, to: Basic) => ValidAssociation(from, to, assoc.weight)}
}

