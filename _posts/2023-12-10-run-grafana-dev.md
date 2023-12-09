---
title: Run Grafana in Dev Mod
category: vpn
tag: [opensource]
---


## Clone Grafana Repository and CD into It

First, clone the Grafana repository and navigate into the directory:

```bash
git clone [Grafana Repository URL]
cd [Grafana Repository Directory]
```

### Front End

For the front end, run the following commands:

1. Install dependencies:
   ```bash
   yarn install --pure-lockfile
   ```

2. Start the front-end server:
   ```bash
   yarn start
   ```

### Back End

For the back end, execute:

```bash
make run
```

### Access Grafana in Browser

Access the Grafana interface in your browser at:

```
http://localhost:3000
```
