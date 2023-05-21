const express = require("express");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');
const { use } = require("bcrypt/promises");


app.set("view engine", "ejs");

// Configure cookie-session middleware
app.use(
  cookieSession({
    name: "session",
    keys: ["secret-key"], // Replace "secret-key" with your own secret key or use an array of multiple keys for encryption
    maxAge: 24 * 60 * 60 * 1000, // Set the session expiration time (e.g., 24 hours)
  })
);
app.use(express.urlencoded({ extended: true }));

// Middleware function
// app.use((req, res, next) => {
  
//   next();
// });

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
  return urlDatabase[id] ? urlDatabase[id].longURL : null;
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

function urlsForUser(id) {
  const userURLs = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURLs[url] = urlDatabase[url];
    }
  }
  return userURLs;
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

  // Hash the password using bcrypt
  const hashedPassword = bcrypt.hashSync(password, 10); // Use bcrypt.hashSync with a salt round of 10

  const newUser = {
    id: userId,
    email: email,
    password: hashedPassword // Save the hashed password
  };

  // Add the new user object to the global users object
  users[userId] = newUser;

  // Print the updated users object
  console.log("users", users);

  // Set the user_id cookie containing the newly generated user ID
  // res.cookie('user_id', userId);
  req.session.user_id = userId

  // Redirect the user to the /urls page
  res.redirect('/urls');
});


app.get('/urls', (req, res) => {
  const userId = req.session.user_id;
  const userURLs = {}
  console.log(urlDatabase)
  for (id in urlDatabase) {
    if (userId === urlDatabase[id].userId) {
      userURLs[id] = urlDatabase[id]
    }

  }if (userId) {
  const templateVars = {
    user: users[userId], // Pass the user object instead of just the username
    urls: userURLs
  
  };
  
  res.render('urls_index', templateVars);
} else {
  const error = "You must be logged in to view this page.";
  res.status(401).send('error', { error });
}
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

  // Use bcrypt to compare the submitted password with the hashed password
  const passwordMatch = bcrypt.compareSync(password, existingUser.password); // Use bcrypt.compareSync to compare the passwords

  if (!passwordMatch) {
    res.status(400).send("Invalid credentials");
    return;
  }

  // Set the 'username' cookie with the submitted value
  res.cookie('user_id', existingUser.id);

  // Redirect the browser back to the /urls page
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  const userId = req.session.user_id;
  console.log("/urls")
  console.log("userId && users[userId]", userId && users[userId])

  // Check if the user is logged in
  if (userId && users[userId]) {
    // User is logged in, proceed with URL shortening logic
    // user post req.body which contains longURL
    const userId = req.session.user_id;
    const longURL = req.body.longURL;
    const shortId = generateRandomString(6);
    urlDatabase[shortId] = {
      longURL: longURL,
      userID: userId
    };
    res.redirect("/urls/" + shortId);
  } else {
    // User is not logged in, respond with an HTML message
    res.status(401).send('<html><body>You must be logged in to shorten URLs. Please <a href="/login">login</a> or <a href="/register">register</a>.</body></html>');
  }
});

app.get('/login', (req, res) => {
  const userId = res.cookie.user_id;

  // Check if the user is logged in
  if (userId && users[userId]) {
    // Redirect to GET /urls
    res.redirect('/urls');
  } else {
    // Render the login page as usual
    res.render('login');
  }
});


app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
 

  // Check if the user is logged in
  if (userId && users[userId]) {
    const templateVars = {
      user: users[userId], // Pass the user object instead of just the username
    };
    res.render("urls_new", templateVars);
    
  } else {
    // Redirect to GET /urls
    res.redirect('/login');
  }
})

app.get('/urls/:id', (req, res) => {
  const userId = req.session.user_id;
  const id = req.params.id;
  const longURL = urlDatabase[id];

  if (!userId || !users[userId]) {
    const error = "You must be logged in to view this page.";
    res.status(401).render('error', { error });
    return;
  }

  if (!longURL) {
    const error = "The requested URL does not exist.";
    res.status(404).render('error', { error });
    return;
  }

  if (urlDatabase[id].userID !== userId) {
    const error = "You do not have permission to access this URL.";
    res.status(403).render('error', { error });
    return;
  }

  const templateVars = {
    user: users[userId],
    id: id,
    longURL: longURL
  };
  res.render('urls_show', templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id; // Get the value of :id from the request URL
  // retrieve the longURL associated with the id
  const longURL = retrieveLongURL(id);
  if (longURL) {
    res.redirect(longURL);
  } else {
    // Render an HTML error message if the id does not exist
    res.status(404).send('<html><body>The requested URL does not exist.</body></html>');
  }
});

app.post('/urls/:id/delete', (req, res) => {
  const userId = req.session.user_id;
  const id = req.params.id;

  // Check if the user is logged in
  if (!userId || !users[userId]) {
    res.status(401).send("You must be logged in to delete URLs.");
    return;
  }

  // Check if the URL exists
  if (!urlDatabase[id]) {
    res.status(404).send("The requested URL does not exist.");
    return;
  }

  // Check if the user is the owner of the URL
  if (urlDatabase[id].userID !== userId) {
    res.status(403).send("You do not have permission to delete this URL.");
    return;
  }

  // Delete the URL from the database
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  const userId = req.session.user_id;
  const id = req.params.id;
  const newURL = req.body.longURL;

  // Check if the user is logged in
  if (!userId || !users[userId]) {
    res.status(401).send("You must be logged in to update URLs.");
    return;
  }

  // Check if the URL exists
  if (!urlDatabase[id]) {
    res.status(404).send("The requested URL does not exist.");
    return;
  }

  // Check if the user is the owner of the URL
  if (urlDatabase[id].userID !== userId) {
    res.status(403).send("You do not have permission to update this URL.");
    return;
  }

  // Update the URL in the database
  urlDatabase[id] = newURL;
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
  const userId = req.session.user_id;

  // Check if the user is logged in
  if (userId && users[userId]) {
    // Redirect to GET /urls
    res.redirect('/urls');
  } else {

    const templateVars = {
      user: users[req.session.user_id], // Pass the user object instead of just the username
    };
    res.render('registration', templateVars);
  };
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});