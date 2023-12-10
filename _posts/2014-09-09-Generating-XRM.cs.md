---
category: crm
tag: [ms-dynamics, crm]
---

This is the command by which need to execute while you are in Crm SDK path



> 
> CRMFolder\SDK\Bin\
> 
> 
> 


Where you have the file ” Microsoft.Xrm.Client.CodeGeneration.dll “



> 
> CrmSvcUtil.exe /codeCustomization:”Microsoft.Xrm.Client.CodeGeneration.CodeCustomization, Microsoft.Xrm.Client.CodeGeneration” /out:Xrm\Xrm.cs /url:<http://10.10.10.15:80/crm/XRMServices/2011/Organization.svc> /domain:EFLAB /username:EFLAB\MyUsername /password:MyPassword /namespace:Xrm /serviceContextName:XrmServiceContext
> 
> 
> 


it gives the error


[![error of XRM.cs](https://waqaskhan137.files.wordpress.com/2014/09/error-of-xrm-cs.png?w=646&h=474)](https://waqaskhan137.files.wordpress.com/2014/09/error-of-xrm-cs.png)


Attempt to solve to this question by


applying the solution  
 <http://social.microsoft.com/Forums/en-US/4962b8c8-cc55-493a-810f-2249d78e8462/creating-entity-class-xrmcs-which-gives-error?forum=crmdevelopment#10f3edc1-6cbc-4936-a6e5-ab96f7d9716d>


but now it gives the error


[![new error](https://waqaskhan137.files.wordpress.com/2014/09/new-error.png?w=646)](https://waqaskhan137.files.wordpress.com/2014/09/new-error.png)


Text of the Error 



> 
> Exiting program with exception: SOAP security negotiation with ‘<http://10.10.10>.  
> 15:5555/crm/XRMServices/2011/Organization.svc’ for target ‘<http://10.10.10.15:55>  
> 55/crm/XRMServices/2011/Organization.svc’ failed. See inner exception for more d  
> etails.
> 
> 
> 


This has to do something with SOAP security problem.


Asking the Question 



> 
> Hello guys   
> I am trying to generate early bound types (Xrm.cs), using command
> 
> 
> ” CrmSvcUtil.exe /codeCustomization:”Microsoft.Xrm.Client.CodeGeneration.CodeCustomization, Microsoft.Xrm.Client.CodeGeneration” /out:Xrm\Xrm.cs/url:<http://<CRMServer&gt>;:5555/crm/XRMService  
> s/2011/Organization.svc /domain:<domain> /username:domain\Administrator /password:<password> /namespace:Xrm /serviceContextName:XrmServiceContext “
> 
> 
>  
> 
> 
> I am getting this error if i use username:domain/Administrator
> 
> 
> ” Exiting program with exception: SOAP security negotiation with ‘http://<CRMServer>:5555/crm/XRMServices/2011/Organization.svc’ for target ‘http://<CRMServer>:5555/crm/XRMServices/2011/Organization.svc’ failed. See inner exception for more details. “
> 
> 
> ![EFLAB_forward slash_Administrator](https://waqaskhan137.files.wordpress.com/2014/09/eflab_forward-slash_administrator.png?w=646)
> 
> 
>  
> 
> 
> When I use username:Administrator   
> its giving me this timeout error
> 
> 
> ” Exiting program with exception: The request channel timed out while waiting for  
> a reply after 00:04:58.6189210. Increase the timeout value passed to the call to  
>  Request or increase the SendTimeout value on the Binding. The time allotted to  
> this operation may have been a portion of a longer timeout.  
> Enable tracing and view the trace files for more information. “  
> Here is snapshot:  
> [![Administrator](https://waqaskhan137.files.wordpress.com/2014/09/administrator.png?w=646)](https://waqaskhan137.files.wordpress.com/2014/09/administrator.png)
> 
> 
> If I use the back slash it gives the authentication error which make it obvious its not going to work that way.   
> [![EFLABAdministrator](https://waqaskhan137.files.wordpress.com/2014/09/eflabadministrator.png?w=646)](https://waqaskhan137.files.wordpress.com/2014/09/eflabadministrator.png)
> 
> 
>  
> 
> 
> 


Posted it on Facebook Group [Microsoft Dynamics CRM](https://www.facebook.com/groups/21809302488/) and on [Microsoft Social](http://social.microsoft.com/Forums/en-US/b9652148-3635-49cf-9148-694c22b022e2/soap-security-negotiation-with-httplocalhost5555crmxrmservices2011organizationsvc-while?forum=crmdevelopment)   
Lets see what I get for that


#Point  
*Another suggestion from Akeel Sb*   
*Try to generate that on the native server by putting the SDK there, if that is generated there then copy that here and use it*


*There seems to be a problem that even If i generate it there it’ll be having some problem here on my machine, I don’t have that setup here what is on the server that is just an assumption need to try that*


URL in the command is working which is 


<http://10.10.10.15:5555/crm/XRMServices/2011/Organization.svc>


and here is snapshot what it says   
[![organization service](https://waqaskhan137.files.wordpress.com/2014/09/organization-service.png?w=646)](https://waqaskhan137.files.wordpress.com/2014/09/organization-service.png)


After Removing the domain name from User name “EFLAB/Username” putting only Username stopped the Soap Error  
And the Timeout Error is there   
Next thing to find out about that is where do i change the timeout value or figure out that if is it the real problem or there is something else causing this one ? 


No reply yet from the group members, No answer on MS CRM Forum.    
Generating the file on Server and using it in Project worked. 


That problem solved here but still don’t understand why it was giving the timeout error 


