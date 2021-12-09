const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertMovieDbObjectToResponseObject = (dbobject) => {
    return{
        movieId:object.movie_id,
        directorId:object.director_id,
        movieName:object.movie_name,
        leadActor:object.lead_actor,
    };
};

const convertDirectorDbObjectToResponseObject = (dbobject) =>{
    return{
        directorId:object.director_id,
        directorName:object.director_name,
    };
};


app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie;`;
  const moviesArray = await database.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.post("/movies/", async (request, response) => {
    const { directorId, movieName, leadActor } = request.body;
    const postMovieQuery = `
    INSERT INTO
    movie (directorId,movieName,leadActor)
    VALUES
    ('${directorId}', '${movieName}', '${leadActor}');`;
    await database.run(postMoviesQuery);
    response.send("Movie Successfully Added");
});

app.get("/movies/:movieId", async (request,response) => {
    const {movieId} = request.params;
    const getMovieQuery = `
    SELECT 
    *
    FROM
    movie
    WHERE
    movie_id: ${movieId};`;
    const movie = await database.get(getMovieQuery);
    response.send(convertMovieDbObjectToResponseObject(movie));
});

app.put("/movies/:movieId", async (request, response) => {
    const { directorId, movieName, leadActor } = request.body;
    const {movieId} = request.params;
    const putMovieQuery =`
    UPDATE
    movie
    SET
    director_id = '${directorId}',
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
    WHERE
    movie_id = '${movieId};'`;

    await database.run(putMovieQuery);
    response.send("Movie Details Updated");
});

app.delete("/movies/:movieId", async (request, response) =>{
    const { movieId } = request.params;
    const deleteMovieQuery =`
    SELECT FROM
    movie
    WHERE
    movie_id = '${movieId}';`;
    await database.run(deleteMovieQuery);
    response.send("Movie Removed");
});

app.get("/directors/:directorId/movies/", (request, response) =>{
    const {directorId} = request.param;
    const getDirectorMoviesQuery = `
    SELECT
    movie_name
    FROM
    movie
    WHERE
    director_id = '${directorId}';`;
    const moviesArray = await database.all(getDirectorMoviesQuery);
    response.send(moviesArray.map((eachMovie) =>({movieName:eachMovie.movie_name}))
    );
});
module.exports = app;
