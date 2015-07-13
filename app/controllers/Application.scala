package controllers

import graph.Database
import play.api.libs.json.{JsError, JsSuccess, Json}
import play.api.mvc._

case class Association(from: String, to: String, weight: Option[Long])

object Association {
  implicit val associationFormat = Json.format[Association]
}

object Application extends Controller {

  def index = Action { Ok(views.html.index(Database.allRelations) ) }

  def associateFormPost = Action { request =>
    val maybeAssociation = for {
      form <- request.body.asFormUrlEncoded
      from <- form.get("from").map(_.mkString)
      to <- form.get("to").map(_.mkString)
    } yield Association(from, to, None)

    maybeAssociation match {
      case Some(assoc) =>
        Database.associate(assoc)
        SeeOther("/")
      case None =>
        InternalServerError("Incorrect form data")
    }
  }

  def associate = Action { request =>
    request.body.asJson.map(_.validate[Association]) match {
      case Some(JsSuccess(assoc, _)) =>
        val result = Database.associate(assoc)
        Ok(result.toString)
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
}

