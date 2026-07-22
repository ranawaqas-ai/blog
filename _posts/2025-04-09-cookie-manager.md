---
title: "How a Web App Works: Building a Cookie Recipe Manager"
category: tutorials
tag: [tutorial, webdev, flask]
---

This one is for Dareen. If you are curious about how web development works, what shows up in your browser, the code that powers it, and where the data lives, you are in the right place. We will build a small but complete app from first principles: a cookie recipe manager.

All the code lives in the [cookie-manager repository](https://github.com/ranawaqas-ai/cookie-manager). Clone it, run it, break it, change the colors, make it yours.

## First principles: what is a web app?

A web application is like a restaurant:

- The **frontend** is the menu and the waiter: it shows you what you can order and takes your request.
- The **backend** is the kitchen: it does the actual cooking.
- The **database** is the pantry: it is where everything is stored so it is still there tomorrow.

| Layer    | What it does         | What we will use      |
| -------- | -------------------- | --------------------- |
| Frontend | What the user sees   | HTML, CSS, JavaScript |
| Backend  | Logic and processing | Python (Flask)        |
| Database | Stores data          | none yet, on purpose  |

One honest note before we start: our first version has no pantry. The kitchen will keep everything on a sticky note, and at the end you will see exactly why real apps need a proper pantry.

Here is how a request flows through the app:

<img src="/assets/img/dareen/webdev-flow.svg" alt="Web App Flow" style="max-width:70%;height:auto;display:block;margin:0 auto;">

## What we are building

A cookie recipe manager. It will:

1. Let you type in the name of a cookie recipe.
2. Send that name to the backend.
3. Store it in a list.
4. Show all the recipes saved so far.

The folder structure:

```
/cookie-manager          # Root directory for your app
├── app.py               # The Flask backend that handles logic and data
├── requirements.txt     # List of Python dependencies (Flask)
└── static               # The frontend: HTML, CSS, and images
    ├── index.html       # Main page for submitting and viewing recipes
    ├── guestbook.html   # A second page we will add at the end
    └── styles.css       # Styling for the app
```

## Step 1: the frontend (`static/index.html`)

```html
<!DOCTYPE html>
<html>
<head>
  <title>Cookie Recipe Manager</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="/static/styles.css">
</head>
<body>
  <div class="container">
    <header>
      <h1>Cookie Recipe Manager</h1>
    </header>

    <div class="nav-links">
      <a href="/">Home</a>
      <a href="/guestbook">Guest Book</a>
    </div>

    <div class="input-group">
      <input type="text" id="recipe" placeholder="Enter your cookie recipe name">
      <button onclick="submitRecipe()">Save Recipe</button>
    </div>

    <ul id="recipeList"></ul>
  </div>

  <footer>
    &copy; 2025 Cookie Recipe Manager
  </footer>

  <script>
    // Send a new recipe to the backend
    async function submitRecipe() {
      const recipe = document.getElementById("recipe").value;
      if (!recipe.trim()) {
        alert("Please enter a recipe name!");
        return;
      }

      await fetch('/cookie/add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ recipe })
      });
      document.getElementById("recipe").value = "";
      loadRecipes(); // Refresh the list after adding
    }

    // Ask the backend for every saved recipe and show them
    async function loadRecipes() {
      const res = await fetch('/cookie/list');
      const recipes = await res.json();
      const recipeList = document.getElementById("recipeList");

      if (recipes.length === 0) {
        recipeList.innerHTML = '<div class="empty-list">No recipes yet. Add your first cookie recipe!</div>';
      } else {
        recipeList.innerHTML = recipes.map(r => `<li>${r}</li>`).join('');
      }
    }

    // Load recipes when the page first opens
    loadRecipes();
  </script>
</body>
</html>
```

The two `fetch` calls are the whole conversation with the kitchen, and they map straight onto the restaurant:

- `fetch('/cookie/add', { method: 'POST', ... })` is the waiter carrying an order **in**: POST means "here is something new", and the recipe name rides along as JSON, which is just a tidy way of writing the order down.
- `fetch('/cookie/list')` is asking the kitchen "what do we have?": no method given means GET, which is "just looking, not changing anything".

Everything the frontend does is one of those two moves: hand something in, or ask for something back.

## Step 2: the backend (`app.py`)

```python
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__)

cookie_recipes = []

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/cookie/add', methods=['POST'])
def add_cookie():
    data = request.get_json()
    cookie_recipes.append(data['recipe'])
    return '', 200

@app.route('/cookie/list')
def list_cookies():
    return jsonify(cookie_recipes)

if __name__ == '__main__':
    app.run(debug=True)
```

Each `@app.route` is a station in the kitchen, one address and what to do when an order arrives there. `/` hands the menu (the HTML page) to anyone who walks in. `/cookie/add` takes a new recipe off the incoming order and appends it to the list. `/cookie/list` reads the list back out.

And that `cookie_recipes = []` is the sticky note: a plain Python list, living in the program's memory. Remember it. It is going to matter at the end.

## Step 3: run it

`requirements.txt` is one line:

```
flask
```

Then, from the `cookie-manager` folder:

```bash
python3 -m venv venv          # create a virtual environment
source venv/bin/activate      # activate it
pip install -r requirements.txt
python app.py
```

Open `http://127.0.0.1:5000` in your browser, type in a recipe, and watch the whole loop run: browser to kitchen to sticky note and back.

## Adding a second feature: the guest book

Here is the part I most want you to see. The app also has a guest book page where visitors sign their name, and adding it took no new ideas at all. Every feature in this kind of app is the same three moves:

1. A page for it (`static/guestbook.html`, the same structure as `index.html` with names instead of recipes).
2. A route to add one thing.
3. A route to list all the things.

The backend additions, in full:

```python
guestbook = []

@app.route('/guestbook')
def guestbook_page():
    return send_from_directory('static', 'guestbook.html')

@app.route('/guestbook/add', methods=['POST'])
def add_guest():
    data = request.get_json()
    guestbook.append(data['name'])
    return '', 200

@app.route('/guestbook/list')
def list_guests():
    return jsonify(guestbook)
```

That is the entire feature. The page itself is in the [repository](https://github.com/ranawaqas-ai/cookie-manager), and if you read it next to `index.html` you will see it is the same pattern with different words. Once you can spot that pattern, you can read most web apps.

## A note on the styling

`styles.css` in the repo makes it all look friendly: rounded cards, a warm palette, hover effects. The one idea in it worth learning early is CSS variables, where you name your colors once at the top and reuse them everywhere:

```css
:root {
  --primary-color: #f8b195;
  --secondary-color: #f67280;
  --accent-color: #c06c84;
}

button {
  background-color: var(--primary-color);
}
```

Change `--primary-color` once and every button, border, and highlight follows. Open the full file in the repo and try repainting the whole app by editing three lines.

## The sticky note problem

Now run your app, add a few recipes, and then stop the server and start it again.

They are gone.

That is not a bug. `cookie_recipes` is a Python list, and a list lives in the program's memory, so when the program stops, the memory is handed back and the sticky note is thrown away. This is exactly why databases exist: a database is the pantry, a place outside the program where things survive restarts.

So here is what to explore next, in order:

- Replace the in-memory lists with a real database (SQLite is built into Python).
- Deploy it to a cloud service like Render or Replit so other people can use it.
- Add user accounts, so each person sees their own recipes.

Each one of those is the same kind of step we took here: a small, understandable change to one layer of the restaurant. Happy baking.
