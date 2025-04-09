---
category: blog
tag: [tutorial,webdev]
---

Hey Dareen! If you're curious about how web development works — from what shows up in your browser to the code that powers it and where the data lives — you're in the perfect place.


**🚨 [Cookie Manager Repository](https://github.com/waqaskhan137/cookie-manager) 🚨**

👉 **Check out the complete source code here!** 👈  
Click the link above to explore, clone, and contribute to the project. Your feedback and ideas are always welcome!

Feel free to clone the repository, experiment with the code, and customize it to your liking. Contributions and feedback are always welcome!

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
/cookie-manager          # Root directory for your app
├── app.py               # The Flask backend that handles logic and data
├── blog.md              # This tutorial file
├── requirements.txt     # List of Python dependencies (Flask)
└── static               # Contains frontend HTML, CSS, and images
    ├── guestbook.html   # Guestbook page
    ├── index.html       # Main UI page for submitting and viewing recipes
    ├── styles.css       # Styling for the app
    └── images           # Folder for images
```

---

### ✨ Step 1: Frontend (`static/index.html`)

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
      <h1>🍪 Cookie Recipe Manager</h1>
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
    &copy; 2025 Cookie Recipe Manager - Made with ❤️
  </footer>

  <script>
    // Function to submit a new recipe to the backend
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

    // Function to load and display all recipes from the backend
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

    // Load recipes when the page first loads
    loadRecipes();
  </script>
</body>
</html>
```

---

### ✨ Step 2: Guestbook Frontend (`static/guestbook.html`)

```html
<!-- static/guestbook.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Guest Book</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="/static/styles.css">
</head>
<body>
  <div class="container">
    <header>
      <h1>📝 Guest Book</h1>
    </header>
    
    <div class="nav-links">
      <a href="/">Cookie Recipes</a>
      <a href="/guestbook">Guest Book</a>
    </div>
    
    <div class="input-group">
      <input type="text" id="name" placeholder="Enter your name">
      <button onclick="submitName()">Sign Guestbook</button>
    </div>
    
    <ul id="guestList"></ul>
  </div>

  <footer>
    &copy; 2025 Cookie Recipe Manager - Made with ❤️
  </footer>

  <script>
    async function submitName() {
      const name = document.getElementById("name").value;
      if (!name.trim()) {
        alert("Please enter your name!");
        return;
      }
      
      await fetch('/guestbook/add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name })
      });
      document.getElementById("name").value = "";
      loadNames();
    }

    async function loadNames() {
      const res = await fetch('/guestbook/list');
      const names = await res.json();
      const guestList = document.getElementById("guestList");
      
      if (names.length === 0) {
        guestList.innerHTML = '<div class="empty-list">No guests yet. Be the first to sign!</div>';
      } else {
        guestList.innerHTML = names.map(n => `<li>${n}</li>`).join('');
      }
    }

    loadNames();
  </script>
</body>
</html>
```

---

### 🧠 Step 3: Backend (`app.py`)

```python
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__)

cookie_recipes = []
guestbook = []

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/guestbook')
def guestbook_page():
    return send_from_directory('static', 'guestbook.html')

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

### 📋 Step 4: Requirements (`requirements.txt`)

```
flask
```

Install with:

```bash
pip install -r requirements.txt
```

---

### ✨ Step 5: Styling (`static/styles.css`)

The `styles.css` file contains the styling for the Cookie Manager and Guestbook pages. It uses a modern design with a clean layout, custom colors, and responsive design principles. Here's a summary of its features:

- **Custom Colors and Fonts**: The app uses the Poppins font and a color palette defined in CSS variables for consistency.
- **Responsive Design**: The layout adapts to smaller screens using media queries.
- **Interactive Elements**: Buttons and list items have hover and active states for better user experience.


```css
/* Cookie Manager & Guestbook Styles */
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

:root {
  --primary-color: #f8b195;
  --secondary-color: #f67280;
  --accent-color: #c06c84;
  --background-color: #f9f7f7;
  --text-color: #355c7d;
  --light-text: #6c757d;
  --success: #6a994e;
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --border-radius: 8px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Poppins', sans-serif;
  color: var(--text-color);
  line-height: 1.6;
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  background-color: var(--background-color);
  min-height: 100vh;
}

.container {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 30px;
  box-shadow: var(--shadow);
  margin-bottom: 20px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: var(--accent-color);
}

.nav-links {
  margin-bottom: 30px;
}

.nav-links a {
  color: var(--secondary-color);
  margin-right: 15px;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: var(--accent-color);
  text-decoration: underline;
}

.input-group {
  display: flex;
  margin-bottom: 20px;
}

input[type="text"] {
  flex-grow: 1;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.3s;
}

input[type="text"]:focus {
  outline: none;
  border-color: var(--primary-color);
}

button {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  margin-left: 10px;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.3s, transform 0.2s;
}

button:hover {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
}

button:active {
  transform: translateY(0);
}

ul {
  list-style-type: none;
  margin-top: 30px;
}

li {
  background-color: white;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: var(--border-radius);
  border-left: 4px solid var(--primary-color);
  box-shadow: var(--shadow);
  transition: transform 0.3s;
}

li:hover {
  transform: translateX(5px);
}

.empty-list {
  text-align: center;
  color: var(--light-text);
  padding: 20px;
}

footer {
  text-align: center;
  margin-top: 40px;
  color: var(--light-text);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .input-group {
    flex-direction: column;
  }
  
  button {
    margin-left: 0;
    margin-top: 10px;
  }
}
```

To customize the styles, edit the `static/styles.css` file. For example, you can change the primary color by updating the `--primary-color` variable in the `:root` section.

---

### 🚀 Running the App

1. Save all files according to the folder structure.
2. Open terminal and navigate to the `cookie-manager` folder.
3. Create a virtual environment:

   ```bash
   python3 -m venv venv
   ```

4. Activate the virtual environment:

   ```bash
   source venv/bin/activate
   ```

5. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

6. Run the app:

   ```bash
   python app.py
   ```

7. Open your browser and go to `http://127.0.0.1:5000`

---

## 🧩 What’s Next?

Once you understands this flow:

- Replace the in-memory list with a database (like SQLite).
- Deploy to a cloud service like Render or Replit.
- Add user login/logout.
