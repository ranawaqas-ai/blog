---
category: blog
tag: [tutorial,webdev]
---


Hey Dareen! If you're curious about how web development works — from what shows up in your browser to the code that powers it and where the data lives — you're in the perfect place.

We'll walk through everything from scratch using **first principles**, starting with the basics and building up to a real example you can try out yourself.

---

## 🧠 First Principles: What is a Web App?

A web application is like a digital restaurant:

- **Frontend** is like the **recipe card** — it shows you what cookies you can bake and takes your selection.
- **Backend** is the **kitchen** — it follows the recipe and does the actual mixing, baking, and magic.
- **Database** is the **pantry** — it stores all your ingredients like sugar, flour, and chocolate chips.

Now let’s map this analogy to actual components:

| Layer    | Description          | Tech Examples         |
| -------- | -------------------- | --------------------- |
| Frontend | What the user sees   | HTML, CSS, JavaScript |
| Backend  | Logic and processing | Python                |
| Database | Stores data          | SQLite                |

---

## 🔄 Web App Flow Visual

Here’s how a request flows in a web app:

<img src="/assets/img/dareen/webdev.gif" alt="Strategy" width="500" height="300">

---

## 📦 Let's Build a Simple Cookie Recipe Manager

We’ll build a fun little app that Dareen will love — a cookie recipe manager! It will:

1. Let a user type in the name of a cookie recipe.
2. Send that recipe name to the backend.
3. Store it in a list (in memory).
4. Display all submitted cookie recipes.

### 🗂 Folder Structure

```
/cookie-recipes          # Root directory for your app
├── static               # Contains frontend HTML and JS files
│   └── index.html       # Main UI page for submitting and viewing recipes
├── app.py               # The Flask backend that handles logic and data
└── requirements.txt     # List of Python dependencies (Flask)
```

---

### ✨ Step 1: Frontend (`static/index.html`)

```html
<!-- static/index.html -->
<!-- UI for the Cookie Recipe Manager -->
<h1>🍪 Cookie Recipe Manager</h1>
<input type="text" id="recipe" placeholder="Enter your cookie recipe name">
<button onclick="submitRecipe()">Save Recipe</button>
<ul id="recipeList"></ul>

<script>
  // Function to submit a new recipe to the backend
  async function submitRecipe() {
    const recipe = document.getElementById("recipe").value;
    await fetch('/add', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ recipe })
    });
    loadRecipes(); // Refresh the list after adding
  }

  // Function to load and display all recipes from the backend
  async function loadRecipes() {
    const res = await fetch('/list');
    const recipes = await res.json();
    document.getElementById("recipeList").innerHTML =
      recipes.map(r => `<li>${r}</li>`).join('');
  }

  // Load recipes when the page first loads
  loadRecipes();
</script>
```html
<!-- static/guestbook.html -->
<h1>Guest Book</h1>
<input type="text" id="name" placeholder="Enter your name">
<button onclick="submitName()">Submit</button>
<ul id="guestList"></ul>

<script>
  async function submitName() {
    const name = document.getElementById("name").value;
    await fetch('/add', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ name })
    });
    loadNames();
  }

  async function loadNames() {
    const res = await fetch('/list');
    const names = await res.json();
    document.getElementById("guestList").innerHTML =
      names.map(n => `<li>${n}</li>`).join('');
  }

  loadNames();
</script>
```

---

### 🧠 Step 2: Backend (`app.py`)

```python
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__)

cookie_recipes = []
guestbook = []

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

@app.route('/guestbook/add', methods=['POST'])
def add_guest():
    data = request.get_json()
    guestbook.append(data['name'])
    return '', 200

@app.route('/guestbook/list')
def list_guests():
    return jsonify(guestbook)

if __name__ == '__main__':
    app.run(debug=True)
```

---

### 📋 Step 3: Requirements (`requirements.txt`)

```
flask
```

Install with:

```
pip install -r requirements.txt
```

---

### 🚀 Running the App

1. Save all files according to the folder structure.
2. Open terminal and navigate to the `guestbook-app` folder.
3. Run:

   ```bash
   python app.py
   ```

4. Open your browser and go to `http://127.0.0.1:5000`

---

## 🧩 What’s Next?

Once she understands this flow:

- Replace the in-memory list with a database (like SQLite).
- Deploy to a cloud service like Render or Replit.
- Add user login/logout.

---

This step-by-step, visual-first approach will help your sister-in-law get an intuitive understanding of web development — starting from first principles.
