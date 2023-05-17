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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
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

function getUserByEmail(email) {
  return Object.values(users).find(user => user.email === email);
}

app.post('/register', (req, res) => {
  const { email, password } = req.body;

  // Check if email or password is empty
  if (!email || !password) {
    res.status(400).send("Email and password fields cannot be empty");
    return;
  }

  // Check if the email is already registered
  const existingUser = getUserByEmail(email);
  if (existingUser) {
    res.status(400).send("Email already registered");
    return;
  }

  const userId = generateRandomString(5); // Function to generate a random ID
  const newUser = {
    id: userId,
    email: email,
    password: password
  };

  // Add the new user object to the global users object
  users[userId] = newUser;

  // Print the updated users object
  console.log("users", users);

  // Set the user_id cookie containing the newly generated user ID
  res.cookie('user_id', userId);

  // Redirect the user to the /urls page
  res.redirect('/urls');
});


app.get('/urls', (req, res) => {
  console.log("inside /url", req.cookies.user_id)
  console.log(users[req.cookies.user_id])
  const templateVars = {
    user: users[req.cookies.user_id], // Pass the user object instead of just the username
    urls: urlDatabase
  };
  res.render('urls_index', templateVars);
});

// POST /login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Check if email or password is empty
  if (!email || !password) {
    res.status(400).send("Email and password fields cannot be empty");
    return;
  }

  // Check if the email is already registered
  const existingUser = getUserByEmail(email);
  if (!existingUser) {
    res.status(400).send("Invalid email");
    return;
  }

  if (password !== existingUser.password) {
    res.status(400).send("Invalid credentials");
    return;
  }

  // Set the 'username' cookie with the submitted value
  res.cookie('user_id', existingUser.id);

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

app.get('/login', (req, res) => {
  res.render('login');
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id], // Pass the user object instead of just the username

  };
  res.render("urls_new", templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id], // Pass the user object instead of just the username
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


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id'); // Clear the 'username' cookie
  res.redirect('/urls'); // Redirect the user back to the /urls page
});

app.get('/register', (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id], // Pass the user object instead of just the username
  };
  res.render('registration', templateVars);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});