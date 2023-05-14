const express = require("express");
const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs")

app.use(express.urlencoded({ extended: true }));
//shortId: longURL
// urlDatabase[shortId] = longURL;
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
}

// user submits a form, this function handles the user submission and insert into the urlDatabase and redirect to /urls/shortId function
app.post('/urls', (req, res) => {
  // user post req.body which contains longURL
  const { longURL } = req.body;
  // shortId
  const shortId = generateRandomString(6);
  urlDatabase[shortId] = longURL;
  console.log("urlDatabase", urlDatabase);
  // placing /urls/shortId in the browser
  res.redirect("/urls/"+shortId)
});


// Browser receives above and calls this function that handles the redirect of /urls/:id route and display the page
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

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});