---
category: crm
tag: [ms-dynamics, crm]
---

# MS CRM Plug In


### Background:


There is a need to send outbound and receive the http request from CRM GUI to the third party application for a product.


did some research and found that there are few ways


* [Plug In](http://mscrmmindfire.wordpress.com/2013/06/14/calling-external-web-service-from-a-crm-2011-plug-in/)
* [Custom Action](http://xrmguy.com/2014/03/10/crm-2013-actions-are-my-new-favorite-feature/)
* [JavaScript](http://mscrmmindfire.wordpress.com/2013/06/14/calling-external-web-service-from-a-crm-2011-plug-in/)


Now exploring the possibilities of plug in method


asked questions on forum


<https://community.dynamics.com/crm/f/117/p/142728/313312.aspx>


<https://www.facebook.com/groups/21809302488/10152749493047489/?notif_t=group_comment>




---


### Installing the CRM Tools for Visual Studio 2013:


Found this [LINK](http://torsteinutne.com/2014/03/24/getting-the-crm-developer-toolkit-to-work-with-visual-studio-2013/) about how to do it on vs 2013 while MS doesnt provide tools for 2013 so


but this had problem vs 2013 would even launch and give error


but after creating the registry file and adding it worked like mentioned in [The LINK](https://community.dynamics.com/crm/b/tsgrdcrmblog/archive/2014/08/23/microsoft-dynamics-crm-2013-toolkit-with-visual-studio-2013.aspx)


Working CRM tools in VS 2013  

[![working crm tool](https://waqaskhan137.files.wordpress.com/2014/10/working-crm-tool.png?w=646&h=348)](https://waqaskhan137.files.wordpress.com/2014/10/working-crm-tool.png)


After watching the [tutorial](http://www.ytpak.com/?component=video&task=view&id=v3vie4hSE80)i found that vs 2013 doesn’t support the CRM Explorer and connect to the crm server facility so I had to install 2012 which supports this all.


While installing the CRM Plugin Toolkit for i have encounter the problem that msi doesn’t have some .dll that why it will not execute, the solution to that is [THIS LINK](http://superuser.com/questions/478631/dll-could-not-be-run-for-msi-installers).


There comes a problem when I create the new CRM project which is


[![System.IO.FileNotFOund](https://waqaskhan137.files.wordpress.com/2014/10/system-io-filenotfound.png?w=646)](https://waqaskhan137.files.wordpress.com/2014/10/system-io-filenotfound.png)


Watching the tutorial about the plugin


<http://www.ytpak.com/?component=video&task=view&id=rnQqxSO-WHQ>


and reading the plugin Development at


<http://msdn.microsoft.com/en-us/library/gg328263.aspx#bkmk_design>




---


10/24/2014


Today registered a plugin and test it running on MS CRM


for that i have used the sample plugin provided in the sample code of the SDK The procedure is


* Locate the plugin registration tool in  \SDK\Tools\PluginRegistration
* run the PluginRegistration
* Register new Assembly
* Load the assembly from \SDK\SampleCode\CS\Plug-ins\bin\Debug\SamplePlugins.dll
* save the changes
* now register the steps which task you want to perform


Snapshots


[![plugin registration](https://waqaskhan137.files.wordpress.com/2014/10/plugin-registration.png?w=646)](https://waqaskhan137.files.wordpress.com/2014/10/plugin-registration.png)


and this is the result


[![plugin testing](https://waqaskhan137.files.wordpress.com/2014/10/plugin-testing.png?w=646)](https://waqaskhan137.files.wordpress.com/2014/10/plugin-testing.png)


the more detailed tutorial is provided at [THIS LINK](http://www.resultondemand.nl/support/sdk/c0adf742-e0b7-4699-8972-afe0638af4e4.htm)


Asked the question ON CRM Community [THE LINK](https://community.dynamics.com/crm/f/117/t/143103.aspx)


How to create a new organization in MS CRM


[LINK](http://mostlymscrm.blogspot.com/2012/09/creating-new-organization-in-dynamics.html)


[![trial time check](https://waqaskhan137.files.wordpress.com/2014/10/trial-time-check.png?w=646)](https://waqaskhan137.files.wordpress.com/2014/10/trial-time-check.png)




---


**Getting the Phone Number in Task Activity:**


Trying to get the phone number in activity using the plugin method


The discussion is going on here


<https://community.dynamics.com/crm/f/117/t/143340.aspx>



```c#
if (context.InputParameters.Contains("Target") &&

  context.InputParameters["Target"] is Entity)

{

  // Obtain the target entity from the input parameters.  

  Entity entity = (Entity) context.InputParameters["Target"];

  //  

  //getting the phone number  

  string phone1 = null;

  if (entity.Attributes.Contains("Telephone1"))

  {

    phone1 = entity.GetAttributeValue("Telephone1");

  }

  // Verify that the target entity represents an account.  

  // If not, this plug-in was not registered correctly.  

  if (entity.LogicalName != "account")

    return;
  `


try  

{  

// Create a task activity to follow up with the account customer in 7 days.  

Entity followup = new Entity("task");


followup["subject"] = "The Phone Number of the Customer is:" + phone1+ "Phone No?";  

followup["description"] =  

"Follow up with the customer. Check if there are any new issues that need resolution.";  

followup["scheduledstart"] = DateTime.Now.AddDays(7);  

followup["scheduledend"] = DateTime.Now.AddDays(7);  

followup["category"] = context.PrimaryEntityName;


// Refer to the account in the task activity.  

if (context.OutputParameters.Contains("id"))  

{  

Guid regardingobjectid = new Guid(context.OutputParameters["id"].ToString());  

string regardingobjectidType = "account";


followup["regardingobjectid"] =  

new EntityReference(regardingobjectidType, regardingobjectid);  

}


//  

// Obtain the organization service reference.  

IOrganizationServiceFactory serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));  

IOrganizationService service = serviceFactory.CreateOrganizationService(context.UserId);  

//


// Create the task in Microsoft Dynamics CRM.  

tracingService.Trace("FollowupPlugin: Creating the task activity.");  

service.Create(followup);  

}  

//  

catch (FaultException ex)  

{  

throw new InvalidPluginExecutionException("An error occurred in the FollupupPlugin plug-in.", ex);  

}  

//


catch (Exception ex)  

{  

tracingService.Trace("FollowupPlugin: {0}", ex.ToString());  

throw;  

}  

```


