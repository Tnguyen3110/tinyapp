const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Middleware function
app.use((req, res, next) => {
  res.locals.username = req.cookies["username"];
  next();
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function retrieveLongURL(id) {
  return urlDatabase[id];
}

function generateRandomString(string_length) {
  let random_string = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789abcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < string_length; i++) {
    random_string += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  console.log(random_string);
  return random_string;
}

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

// POST /login endpoint
app.post('/login', (req, res) => {
  const { username } = req.body;

  // Set the 'username' cookie with the submitted value
  res.cookie('username', username);

  // Redirect the browser back to the /urls page
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  // user post req.body which contains longURL
  const { longURL } = req.body;
  // shortId
  const shortId = generateRandomString(6);
  urlDatabase[shortId] = longURL;
  console.log("urlDatabase", urlDatabase);
  // placing /urls/shortId in the browser
  res.redirect("/urls/" + shortId);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  return res.render('urls_show', templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id; // Get the value of :id from the request URL
  // retrieve the longURL associated with the id
  const longURL = retrieveLongURL(id);
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("URL not found");
  }
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id; // Get the value of :id from the request URL

  // Remove the URL resource using the delete operator
  delete urlDatabase[id];

  // Redirect the client back to the urls_index page ("/urls")
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id; // Get the value of :id from the request URL
  const newURL = req.body.longURL; // Get the new URL from the request body

  // Update the value of the stored long URL based on the new value
  urlDatabase[id] = newURL;

  // Redirect the client back to /urls
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post('/logout', (req, res) => {
  res.clearCookie('username'); // Clear the 'username' cookie
  res.redirect('/urls'); // Redirect the user back to the /urls page
});

app.get('/register', (req, res) => {
  res.render('registration');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});