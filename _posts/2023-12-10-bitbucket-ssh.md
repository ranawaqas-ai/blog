---
title: Configure Bitbucket SSH
category: vpn
tag: [opensource]
---


## Configure Bitbucket SSH

So, you go through the article by Atlassian and do as it says but you start getting the given below annoying error.

```
unable to negotiate with your-server-ip no matching host key type found
```

It is because your server isn't added in host list and your machine doesn't know the algo used and IP of your Bitbucket server.

In order to get it fixed, you just have to create a file and add the following content to the file.

```bash
vi ~/.ssh/config
```

Add these lines to the file:

```bash
Host your-server-ip
    HostKeyAlgorithms +ssh-rsa
    PubkeyAcceptedKeyTypes +ssh-rsa
```

Save the file, exit the terminal try again. You should be able to clone or use git via SSH now.
