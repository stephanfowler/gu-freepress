package controllers

import play.api.libs.json.Json
import play.api.mvc._

object Application extends Controller {

  def index = Action { Ok(views.html.index() ) }

  def associate = Action { request =>
    Ok
  }

  def relations = Action { request =>
    Ok
  }
}

