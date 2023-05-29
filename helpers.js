const urlDatabase = {
  
};

const users = {
  
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

module.exports = {
  urlDatabase, users, retrieveLongURL, generateRandomString, getUserByEmail, urlsForUser
}