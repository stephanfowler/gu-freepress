name := "gu-free-press"

version := "0.1"

scalaVersion := "2.11.6"

resolvers += "Typesafe repository" at "http://repo.typesafe.com/typesafe/releases/"

libraryDependencies ++= Seq(
  "com.typesafe.play" %% "play" % "2.3.6"
)

lazy val root = (project in file(".")).enablePlugins(PlayScala)
