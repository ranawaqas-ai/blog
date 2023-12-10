---
title:  "How to Keepalivd"
categories: tech
tag: [tutorial]
---

# Keepalived

To ensure high availability and avoid the single point of failure of the Nginx cluster, there is Keepalived, which can keep track of both machines running Nginx and handle it.

## Installation
Step one is to install Keepalived on machines that are having Nginx:

```bash
sudo apt-get install keepalived
```

Or, if you want the latest version, you might look at this question. After that, for configurations, edit this file:

```bash
sudo nano /etc/keepalived/keepalived.conf
```

And put this content in this file:

```bash
! Configuration File for keepalived
vrrp_instance VI_1 {
    state MASTER // The state of the machine, it will act like master 
    interface eth0
    virtual_router_id 51
    priority 150 // Master have high priority and the slave have lesser 
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass $ place secure password here.
    }
    virtual_ipaddress {
        10.32.75.200 // This is the Virtual IP, which should be same on both machines 
    }
}
```

The configuration (location `sudo nano /etc/keepalived/keepalived.conf`) on the other machines should look like:

```bash
! Configuration File for keepalived

vrrp_instance VI_1 {
    state MASTER
    interface eth0
    virtual_router_id 51
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass $ place secure password here.
    }
    virtual_ipaddress {
        10.32.75.200
    }
}
```

In order to be able to bind on an IP which is not yet defined on the system, we need to enable non-local binding at the kernel level.

Add this to `/etc/sysctl.conf`:

```bash
net.ipv4.ip_nonlocal_bind = 1
```

Enable with:

```bash
sysctl -p
```

## Keepalived Commands

```bash
service keepalived stop/start/reload/restart
```

To see the logs for debugging, those are in:

```bash
tail /var/log/syslog or nano /var/log/syslog
```

## Issues
I am facing this issue:

```
May 13 19:15:03 pc2-VirtualBox Keepalived_vrrp[4069]: bogus VRRP packet received on eth0 !!!
[Additional log entries...]
```
