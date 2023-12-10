---
category: crm
tag: [ms-dynamics, crm]
---


> Gotta try this one !
> 
> 
> 

![](https://2.gravatar.com/avatar/b45d53affd69e65186fdbe1f14371125063d84470ba9603ecb197327a84b90b5?s=32&d=identicon&r=G)[DynamicsCRM@MindfireSolutions](http://mscrmmindfire.wordpress.com/2013/06/14/calling-external-web-service-from-a-crm-2011-plug-in)


## Introduction


This blog explains how to call external **Web Service** from a CRM 2011 *Plug-in*.


## Background


Sometimes we need to call a **Web Service** from a *Plug-in*. We had a similar requirement, but while trying to access the service, we got the following error.


“Could not find default endpoint element that references contract ‘**ServiceReference.Service**′ in the **ServiceModel** client configuration section. This might be because no configuration file was found for your application, or because no endpoint element matching this contract could be found in the client element.”


## Problem


The reason for this is because the configuration information for the **Web Service** from the client side is missing.


## Using the Code


So, now in case of our plugin, we need to define the binding and endpoint information programmatically. Something like this…


This way we would be able to access our **Web Service** inside *Plug-in*.


## Note


The…


[View original post](http://mscrmmindfire.wordpress.com/2013/06/14/calling-external-web-service-from-a-crm-2011-plug-in) 103 more words

 