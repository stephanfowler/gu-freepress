package opengraph

import model.{OpenGraphElement, OpenGraphRequest}

object FreePressOpenGraph {

  def getTwo(urlOne: String, urlTwo: String): Option[(OpenGraphElement, OpenGraphElement)] =
    for {
      openGraphElementOne <- getUrl(urlOne)
      openGraphElementTwo <- getUrl(urlTwo)
    } yield (openGraphElementOne, openGraphElementTwo)

  private def getUrl(url: String): Option[OpenGraphElement] =
    OpenGraph.getTask(OpenGraphRequest(url)).run.toOption

}
