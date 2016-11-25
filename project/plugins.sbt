resolvers ++= Seq(
    "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/",
    "Typesafe Maven Repository" at "http://repo.typesafe.com/typesafe/maven-releases/"
)

addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.3.6")
