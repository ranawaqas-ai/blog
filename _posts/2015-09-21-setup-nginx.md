
---
title:  "How to Setup Nginx"
categories: tech
tag: [tutorial]
---

## Motivation
Making sure of failover and load balancing mechanism in company products.

### Diagram
![Diagram Image](/assets/img/nginx.svg)

## Installation
Installing it on Ubuntu is just running this command:
```bash
sudo apt-get install nginx
```

## Configurations
To check the simple scenario:

- Two Tomcat servers running a simple website.
- Nginx decides the failover and load balancing.

### Configuration File
The default file I tried to edit:

```nginx
server {
    listen 80 default_server;

    root /usr/share/nginx/html;
    index index.html index.htm;

    # Make site accessible from http://localhost/
    server_name localhost;

    location / {
        # First attempt to serve request as file, then
        # as directory, then fall back to displaying a 404.
        try_files $uri $uri/ =404;
        # Uncomment to enable naxsi on this location
        # include /etc/nginx/naxsi.rules

        # if localhost:80 get hit pass this to the following url 
        proxy_pass  http://localhost:8080/myapp/
    }
}
```

But still, it doesn't show the `proxy_pass` path.

#### The Default File
```nginx
# [Configuration details continue...]
```

### Followed The Tutorial
But it doesn't seem to work for me, it just gives me the default page of Nginx.

## Load Balancing
For load balancing, `upstream` is used to define the servers. There are four types of load balancing Nginx provides:

1. **Default (Round Robin)**
2. **Least Connected Load Balancing**
3. **Session Persistence**
4. **Weight Load Balancing**

### Simple Default (Round Robin) Configuration
```nginx
http {
    upstream myapp1 {
        server srv1.example.com;
        server srv2.example.com;
        server srv3.example.com;
    }

    server {
        listen 80;

        location / {
            proxy_pass http://myapp1;
        }
    }
}
```

#### For Least Connected
```nginx
upstream myapp1 {
    least_conn;
    server srv1.example.com;
    server srv2.example.com;
    server srv3.example.com;
}
```

#### For Session Persistence
```nginx
upstream myapp1 {
    ip_hash;
    server srv1.example.com;
    server srv2.example.com;
    server srv3.example.com;
}
```

#### For Weight Load Balancing
```nginx
upstream myapp1 {
    server srv1.example.com weight=3;
    server srv2.example.com;
    server srv3.example.com;
}
```
With this configuration, every 5 new requests will be distributed as follows: 3 requests to srv1, one request to srv2, and another one to srv3.

Reference: [Nginx Load Balancing](http://nginx.org/en/docs/http/load_balancing.html)

## Working Load Balancing Example
Assuming we have two servers: one is an app server and the other is a backup server.

### Apache Servers LB for lb.site.com
```nginx
# [Configuration details continue...]
```

### Putting This in Location
```
/etc/nginx/site-enabled/lb-sites.com    
```

### Link the File
```bash
ln -s /etc/nginx/sites-available/lb-site.com /etc/nginx/sites-enabled/
```

Then restart the Nginx Service or use a signal to reload the configurations. By default, it has round robin implemented. For other implementations, refer to the Nginx documentation.

## Next Steps
We will do the following things:

- Testing SOAP services on Nginx.
- Building a high availability cluster using KeepAlived or Heartbeat.

