---
category: crm
tag: [ms-dynamics, crm]
---


Concept


Using MS CRM SDK which gives us access to the entities of the CRM, Which provide us a CRUD operations


Making an other web app which will use the service for displaying, create, delete and update the data of MS CRM


Objective


* Providing a service which can let the user or any application perform CRUD operations
* Providing an interface which show the CRUD operations on the basis of that service


Problems Encountered


* Query Execution Time Problem
* Learning LINQ Queries


————————————————————————————————————————  

Understanding the LINQ queries by reading the article written here


<http://www.codeproject.com/Articles/38010/CRUD-Operations-using-LINQ-Entities#Step> 2:- Create using LINQ


### Create


 `private Dictionary<Guid, String> _recordIds = new Dictionary<Guid, String>();  

private OrganizationServiceProxy _serviceProxy;  

private IOrganizationService _service;  

public void createContact(){  

Account account = new Account  

{  

Name = "Fourth Coffee",  

Address1_StateOrProvince = "Colorado",  

};  

_recordIds.Add(_service.Create(account), Account.EntityLogicalName);  

}`  

This is a snippet from SDK sample class CreateALinqQuery.cs  

Its giving me the Null pointer exception, How do I put values in \_recordlds?


similar way I can create Contact


Exception Handling Link


[LINK](http://msdn.microsoft.com/query/dev12.query?appId=Dev12IDEF1&l=EN-US&k=k(EHNullReference);k(TargetFrameworkMoniker-.NETFramework,Version%3Dv4.0);k(DevLang-csharp)&rd=true#BKMK_Use_Debug_Assert_to_confirm_an_invariant) Which mentions the how to handle the Null pointer Exception but we have some other kind of problem, Which is  

We create a dictionary object and put those created accounts in that before we put any account in there it gives the error about null pointer exception which is why having problem.  

Posted the problem in facebook MS CRM group and on the [Microsoft Social forum for CRM](http://social.microsoft.com/Forums/en-US/c345fb35-c12d-4f8e-b052-b7cea94697de/null-pointer-exception-while-creating-an-account-in-ms-crm?forum=crm)


### Update


Found that MS CRM has its own service for CRUD operations to perform. Which is IOrganizationService and they have Sample Code too which explains the Whole situation


Need to read the docs and how to use of that code


So what has been decided after discussing the situation with senior that I should continue my work on Interface with the service I have made with 2 or 3 things running using Linq Queries  

So now I’ll work for a Webpage which will get data from the service and display it on the Page!


### Learning ASP


Having problems with the ASP .net I was considering it like PHP but it had too much confusion with it, But now i have written hello world program.  

Tasks are


* Event Handling in JSP
* Sending the string to the Service class
* Getting the data
* Displaying it in the Interface


Links


<http://forums.asp.net/t/1818142.aspx?Calling+Method+in+Class+from+Web+Form+aspx+page+>


<http://www.asp.net/web-forms/videos/how-do-i/build-your-first-asp-net-application-with-asp-net-web-forms>


\*Issues


* Fixing the problem with the CRM Service With GUI
* What was the problem [There is a facebook group question i’ll post here]
* Issues with Web config which was using service tags had to be removed
* code is working now and displaying the information of a user on a webpage
* Next task is to parse the data and show it there in a proper way


Learning about the parsing and considering if Object can be turned into json if yes then i’ll use that one,


Links are


<http://msdn.microsoft.com/en-us/library/ms228388.aspx>


<https://json.codeplex.com/>


<http://msdn.microsoft.com/en-us/library/bb410770(v=vs.110)>.aspx


Today 0/23/2014 I updated the Code on bitbucket and deleted the old buggy code


This code which shows how to split the strings  

 `//All the parsing happens here :D  

public string ParsingString(String result )  

{`


//parsing the string here  

char[] delimiterChars = { ‘ ‘, ‘,’, ‘.’, ‘:’, ‘\t’ };


string text = result;  

System.Console.WriteLine(“Original text: ‘{0}'”, text);


string[] words = text.Split(delimiterChars);  

System.Console.WriteLine(“{0} words in text:”, words.Length);


foreach (string s in words)  

{  

System.Console.WriteLine(s);  

}


// Keep the console window open in debug mode.  

System.Console.WriteLine(“Press any key to exit.”);  

System.Console.ReadKey();


string displayString=”Results comes here”;


return displayString;  

}  

}


To parse the data the aproah which splits the string one by on which seems bad way to do it,  

I looked for something better which would be like  

convert the object data into json and then get the values from jason by doing  

 `string name= jsonObjectWhcihHoldsTheValues["Name"];`


The problem was  

Publish  

Remotely Publishing/deploy the project using Visual Studio <http://msdn.microsoft.com/en-us/library/cdt9aht6(v=vs.90)>.aspx  

<http://msdn.microsoft.com/en-us/library/dd465337(v=vs.110)>.aspx


<http://stackoverflow.com/questions/13441692/how-to-add-publishing-profile-to-a-new-sln-in-vs2012>


IIS .net Version of application <http://technet.microsoft.com/en-us/library/cc754523(v=ws.10)>.aspx  

Tomcat Port <http://www.mkyong.com/tomcat/how-to-change-tomcat-default-port/>  

 `Error!  

Web deployment task failed. (The application pool that you are trying to use has the 'managedRuntimeVersion' property set to 'v2.0'. This application requires 'v4.0'. Learn more at: http://go.microsoft.com/fwlink/?LinkId=221672#ERROR_APPPOOL_VERSION_MISMATCH.)`


This problem was solved by changing the version of the .net to the 4.0


\*Publishing the Project Problem


Application was running the version i code before but then I improved the code added exception handling, put some checks and clean the code. After that I needed to deploy the latest version of the code. Then I struct with a problem which is at the msdn forum


<https://social.msdn.microsoft.com/Forums/en-US/53df52b3-b0d3-4d8b-8f0b-fab2f30defaf/publishing-a-project-and-getting-the-uex141016log-is-in-use-?forum=visualstudiogeneral>



> I am trying to publish a project on a remote server and getting this error
> 
> 
> 
> ```
> 2>C:\Program Files (x86)\MSBuild\Microsoft\VisualStudio\v12.0\Web\Microsoft.Web.Publishing.targets(4255,5): Warning : An error was encountered when processing operation 'Delete File' on 'u\_ex141016.log'.  
> 2>Retrying operation 'Delete' on object filePath (crm-crud/logs\wmsvc\W3SVC1\u\_ex141016.log). Attempt 1 of 2.
> 2>C:\Program Files (x86)\MSBuild\Microsoft\VisualStudio\v12.0\Web\Microsoft.Web.Publishing.targets(4255,5): Warning : An error was encountered when processing operation 'Delete File' on 'u\_ex141016.log'.  
> 2>Retrying operation 'Delete' on object filePath (crm-crud/logs\wmsvc\W3SVC1\u\_ex141016.log). Attempt 2 of 2.
> 2>C:\Program Files (x86)\MSBuild\Microsoft\VisualStudio\v12.0\Web\Microsoft.Web.Publishing.targets(4255,5): Error ERROR\_FILE\_IN\_USE: Web deployment task failed. (The file 'u\_ex141016.log' is in use.  Learn more at: http://go.microsoft.com/fwlink/?LinkId=221672#ERROR\_FILE\_IN\_USE.)
> 2>Publish failed to deploy.
> ```
> 
> Did some googling on it but found nothing useful
> 
> 
> This [Question](http://serverfault.com/questions/484499/delete-iis-log-files)‘s answer suggest find the process and kill it, while i am seeing nothing like “u\_ex141016.log” in processes so how do I kill it?
> 
> 
> I deleted the log file going into the directory “inetpub/logs/wmsvc/W3SVC1/” but it didnt do anything still the error persist.
> 
> 
> tried this one too
> 
> 
> <http://www.iis.net/learn/publish/troubleshooting-web-deploy/web-deploy-error-codes#ERROR_FILE_IN_USE>
> 
> 
> I tried stopping the server and tried but the same.
> 
> 
> Using Visual Studio 2013
> 
> 


How do you suggest me to do it?


now I am resolving this problem will update the log when I’ll solve this


Final working configuration are shown in the snapshot


[![final working configurations](https://waqaskhan137.files.wordpress.com/2014/09/final-working-configurations.png?w=646&h=506)](https://waqaskhan137.files.wordpress.com/2014/09/final-working-configurations.png)


