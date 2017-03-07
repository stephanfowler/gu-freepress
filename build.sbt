name := "gu-free-press"

version := "0.1"

scalaVersion := "2.11.6"

resolvers ++= Seq(
  "anormcypher" at "http://repo.anormcypher.org/",
  "Typesafe Releases" at "http://repo.typesafe.com/typesafe/releases/"
)

libraryDependencies ++= Seq(
  "com.typesafe.play" %% "play" % "2.3.6",
  "org.anormcypher" %% "anormcypher" % "0.6.0",
  "scala-opengraph" %% "scala-opengraph" % "0.1"
)

lazy val root = (project in file(".")).enablePlugins(PlayScala)
