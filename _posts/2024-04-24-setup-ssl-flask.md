---
title:  "Setting up SSL for Flask APP"
categories: AI
tag: SSl, FLASK, tutorial
---
![SSL](/assets/img/ssl-flask.png)

### **Setting Up SSL on Your Subdomain with Nginx and a Simple Python Flask Example**

---

### **Introduction**
In this guide, we'll walk through the steps to secure a subdomain with SSL, route it using Nginx, and serve a simple "Hello, World!" application using Python's Flask framework. By the end of this tutorial, you'll have a basic but complete setup illustrating how to secure and serve a Python application.

---

### **Prerequisites**
- A domain and access to modify its DNS records.
- A server with Nginx installed.
- Python and Flask installed on your server.
- A valid SSL certificate (we'll use Let's Encrypt).

---

### **Step 1: Obtain an SSL Certificate for Your Subdomain**
1. **Install Certbot**: First, install Certbot, the recommended tool by Let's Encrypt for obtaining SSL certificates.
   ```bash
   sudo apt-get update
   sudo apt-get install certbot python3-certbot-nginx
   ```
2. **Generate the Certificate**: Run Certbot with the Nginx plugin to automatically handle the certificate challenge and configuration.
   ```bash
   sudo certbot --nginx -d yoursubdomain.example.com
   ```
3. **Verify Auto-Renewal**: Ensure that your SSL certificate will auto-renew by checking the renewal process.
   ```bash
   sudo certbot renew --dry-run
   ```

---

### **Step 2: Create Your Flask Application**
1. **Setup Flask**: Create a new directory for your project and set up a virtual environment.
   ```bash
   mkdir myproject
   cd myproject
   python3 -m venv venv
   source venv/bin/activate
   ```
2. **Install Flask**: Install Flask using pip.
   ```bash
   pip install Flask
   ```
3. **Write Your Flask App**:
   ```python
   from flask import Flask
   app = Flask(__name__)

   @app.route('/')
   def hello_world():
       return 'Hello, World!'

   if __name__ == '__main__':
       app.run(host='0.0.0.0', port=8000)
   ```
4. **Run the Flask App**:
   ```bash
   python app.py
   ```

---
Absolutely! Let's extend the article by adding steps on how to containerize the Flask application using Docker, including both a `Dockerfile` and a `docker-compose.yml` file for orchestrating the setup. This will make the deployment process even more robust and easier to manage.

---

### **Extending the Setup with Docker**

Incorporating Docker into our project helps standardize the development environment and simplifies deployment. Here’s how you can create a Dockerized version of the Flask application.

---

### **Step 3: Dockerize Your Flask Application**

#### **Create a Dockerfile**

1. **Create a Dockerfile**: This file defines the environment in which your Flask app will run. Create a `Dockerfile` in your project directory:

   ```Dockerfile
   # Use an official Python runtime as a base image
   FROM python:3.9-slim

   # Set the working directory in the container
   WORKDIR /app

   # Copy the current directory contents into the container at /app
   COPY . /app

   # Install any needed packages specified in requirements.txt
   RUN pip install --no-cache-dir -r requirements.txt

   # Make port 8000 available to the world outside this container
   EXPOSE 8000

   # Define environment variable
   ENV NAME World

   # Run app.py when the container launches
   CMD ["python", "app.py"]
   ```

2. **Requirements File**: Ensure you have a `requirements.txt` file in your project directory that includes Flask:

   ```plaintext
   Flask
   ```

3. **Build Your Docker Image**:
   ```bash
   docker build -t my-flask-app .
   ```

#### **Create a docker-compose.yml File**

1. **Set Up Docker Compose**: Create a `docker-compose.yml` file to define services, networks, and volumes:

   ```yaml
   version: '3.8'
   services:
     web:
       image: my-flask-app
       build: .
       ports:
         - "8000:8000"
       environment:
         - NAME=World
   ```

2. **Run Your Application with Docker Compose**:
   ```bash
   docker-compose up
   ```

This will start your Flask application inside a Docker container and expose it on port 8000, ready to be served by Nginx as configured earlier.

---

### **Integrate Docker and Nginx**

#### **Nginx Configuration to Proxy Docker**

Modify your existing Nginx configuration to proxy requests to the Docker-managed Flask application:

```nginx
server {
    listen 443 ssl;
    server_name yoursubdomain.example.com;

    ssl_certificate /etc/letsencrypt/live/yoursubdomain.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yoursubdomain.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Note**: Ensure Docker is running the Flask app when you configure Nginx to proxy to it.

---

### **Conclusion**

With Docker and Nginx, your Flask application is not only secure but also encapsulated in a container, making it portable and easy to deploy across different environments. This setup is ideal for both development and production uses, providing a solid base for scaling up applications.

### **Next Steps**

- Implement Docker Swarm or Kubernetes for better orchestration.
- Explore continuous integration/continuous deployment (CI/CD) pipelines to automate your deployment process.
- Enhance security by using Docker secrets to manage sensitive data.

---