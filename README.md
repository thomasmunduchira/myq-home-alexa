# MyQ Home
Control your MyQ-Enabled devices using this Alexa skill. You will need to have a MyQ account for this to work.

When using this skill, you need established names for your devices. They are shown in the MyQ app as well as its web counterpart and can be changed.

Here are the actions and queries currently supported by this skill:

For all devices:
* "Alexa, ask MyQ to discover my devices"
* "Alexa, ask MyQ what are my devices"

For your MyQ garage doors:
* "Alexa, ask MyQ to open my [door name] with pin [pin number]"
* "Alexa, ask MyQ to close my [door name]"
* "Alexa, ask MyQ is my [door name] open?"
* "Alexa, ask MyQ what are my doors"

For your MyQ lights:
* "Alexa, ask MyQ to turn on my [light name]"
* "Alexa, ask MyQ to turn off my [light name]"
* "Alexa, ask MyQ is my [light name] on?"
* "Alexa, ask MyQ what are my lights"

If the skill is not finding or toggling the right device, try giving your devices more distinct names. If that doesn't work, ask the skill to discover devices again and make sure it finds the device you're looking for.

## Self Hosting

IMPORTANT: note that the UI for the services used below changes from time to time and as such, the instructions given below might not be exactly correct.

### Step 1
Create a Amazon Developer account [here](https://developer.amazon.com/) or login to it if you already have one.

### Step 2
Now we will create an Alexa skill.

Go to the Alexa Developer Console (found [here](https://developer.amazon.com/alexa/console/ask)) and click **Create Skill**.

Make sure the **Create a new skill** page has the following settings.

```
Name: MyQ Home (if you would like to set a different name, feel free to do so)
Default language: English (US)
```

The skill we are making is a custom Alexa skill. Therefore, make sure **Custom** is selected in the **Choose a model to add to your skill** section and then click **Create skill** up top.

We will not need a template as the complete configuration for the skill is provided. Therefore, make sure **Start from scratch** is selected in the **Choose a template** page and then click **Choose**.

Now we should be on the **Build** page for the Alexa skill.

### Step 3
We will now configure the skill so that it understands the different things users can ask of it.

Click on **JSON Editor** on the left. Copy everything on [this page](https://raw.githubusercontent.com/thomasmunduchira/myq-home-alexa/master/assets/IntentSchema.json) and replace the existing content in the JSON Editor with this new content.

The fourth line in the configuration you copied and pasted should hold the default invocation name, "my queue". If you would like to set a different invocation name, feel free to do so. Make sure this invocation name doesn't conflict with any of the invocation names on your enabled skills.

Before we continue, we have to build the model. To do so, click **Build Model**.

### Step 4
We will need to save the Skill ID of this skill to complete future steps.

In a new tab, go to the Alexa Developer Console again (found [here](https://developer.amazon.com/alexa/console/ask)). The new skill should be listed there.

Under the skill name, click **View Skill ID**. A popup should appear with the Skill ID. Note this down for later. The Skill ID should look similar to this: amzn1.ask.skill.fcs77245-01f4-4981-cze9-a755g4382115.

### Step 5
In a new tab, create an Amazon AWS account [here](https://aws.amazon.com/) or login to it if you already have one.

### Step 6
Now we will make a Lambda function to process requests from the Alexa skill. The Lambda function will act as the glue between Alexa and the MyQ service.

Go to the AWS Lambda page (found [here](https://console.aws.amazon.com/lambda/home#/functions)).

You should be able to see a region on the top right. Only a certain number of regions support Alexa integration. Make sure the region matches one of the ones below:
* US East (N. Virginia) [RECOMMENDED]
* EU (Ireland)
* US West (Oregon)
* Asia Pacific (Tokyo)

Once you have ensured you are working within a supported region, click **Create function** on the AWS Lambda page.

Make sure **Author from scratch** is selected.

Make sure the **Author from scratch** section has the following settings. A new page should pop up for configuring the new custom role.

```
Name: myqHome
Runtime: Node.js 6.10
Role: Create a custom role
```

This custom role will define all the permissions that the Lambda function will have.

Make sure the **Role Summary** section on the new page has the following settings. Some of the settings might not appear initially, but will dynamically appear as you change the settings one by one.

```
IAM Role: Create a new IAM Role
Role Name: myqHomeRole
```

Now we will copy and paste the required policy document for the role.

Click **View Policy Document**. A text box should appear near the bottom. Click **Edit** and then click **Ok** on the confirmation popup.

Copy everything on [this page](https://raw.githubusercontent.com/thomasmunduchira/myq-home-alexa/master/assets/iamPolicy.json) and replace the existing content in the text box with this new content.

When done, click **Allow** on the bottom right.

On the Lambda function creation page, click **Create function** on the bottom right.

We should now be on the **Configuration** page for the Lambda function.

### Step 7
We will now upload all the required code for the Lambda function.

Click [here](https://drive.google.com/file/d/0Bx2mdlDO74LnR1FaZV8zMDQ2Z2M/view?usp=sharing) to access the ZIP file containing all the code. Download it to your local computer.

Go to the **Function code** section on the **Configuration** page. Make sure it has the following settings.

```
Code entry type: Upload a .zip file
Runtime: Node.js 6.10
Handler: index.handler
```

Click **Upload** under **Function Package** and then select the ZIP file you just downloaded.

### Step 8
Now we will input your MyQ account information and other information the Lambda function needs to fulfill requests successfully.

Add the following keys and values to the **Environment variables** section:
```
Key      | Value
email    | <The email for the MyQ account (required)>
password | <The password for your MyQ account (required)>
pin      | <4 to 12 digit number (optional, will not be able to open doors if not set)>
appId    | <Skill ID that you noted down earlier (optional, for developer use)>
dbName   | <The database name (optional, for developer use)>
```

### Step 9
We will now connect the Lambda function to the Alexa skill we made earlier. We will do this by adding an Alexa Skills Kit trigger to the Lambda function.

Go to the **Designer** section near the top. Click **Alexa Skills Kit** under **Add triggers**. A new section called **Configure triggers** should appear underneath.

Make sure **Enable** is selected for **Skill ID verification**. Put the Alexa Skill ID in the textbox. When done, click **Add**.

Finally, click **Save** up top.

### Step 10
We need to save the ARN of the Lambda function for later.

The ARN can be found on the top left. Save this for the next step. The ARN should look similar to this: arn:aws:lambda:us-east-1:143724428083:function:myqHome.

### Step 11
We will now do the reverse - we will connect the Alexa skill to the Lambda function.

Switch back to the **Build** page for the Alexa skill. Click on **Endpoint** on the left.

Make sure **AWS Lambda ARN** is selected. Put the Lambda function ARN in the **Default Region** textbox.

Then click **Save Endpoints** up top.

### Step 12
To use this skill without publishing it, we need to enable testing.

Click on **Test** in the top menu. Make sure **Test is enabled for this skill** is selected.

At this point, the skill should pop up in your Alexa app and be ready to use.

## FAQ
### Alexa says that "there was a problem with the requested skill's response."
One problem might be that the Lambda function doesn't have enough time to process the request within the default timeout of 3 seconds.

To fix this, go to the AWS Lambda page (found [here](https://console.aws.amazon.com/lambda/home#/functions)) and click on your Lambda function.

Find the **Basic settings** section and change the timeout from 3 sec to 10 sec. Then click **Save** up top.

If that doesn't help, you can check the CloudWatch logs for the exact error you're running into. The skill logs useful information throughout the lifespan of a request.

To access these logs, go to the AWS Lambda page (found [here](https://console.aws.amazon.com/lambda/home#/functions)) and click on your Lambda function.

Up top, there should tabs for **Configuration** and **Monitoring**. Click on **Monitoring** and then click on **View logs in CloudWatch**. You should now be able to access the logs.

### My credentials don't work or I forgot what my credentials are.
Go [here](https://www.mychamberlain.com/) to reset your password or test if your login works.

### I changed my MyQ credentials and now the skill doesn't work.
We will have to update the environment variables on your Lambda function to reflect the changed credentials.

Go to the AWS Lambda page (found [here](https://console.aws.amazon.com/lambda/home#/functions)) and click on your Lambda function.

Find the **Environment variables** section. Change these environment variables as needed. Then click **Save** up top.

### I need to change my pin.
Follow the steps to change your MyQ credentials up above, except make sure to change the pin instead of your credentials.

## Installation [only if you want to add or modify features]

```bash
npm install
```

## Contributing

If you would like to contribute enhancements or fixes, please do the following:
1. Fork the repository and clone it locally.
2. Follow the installation steps above.
3. Make your changes.
4. Follow the self hosting steps above.
5. Test the changes on the skill you're self-hosting.
6. Create a pull request.

## Author
[Thomas Munduchira](https://thomasmunduchira.com/) ([thomas@thomasmunduchira.com](mailto:thomas@thomasmunduchira.com))

## License
[MIT](https://github.com/thomasmunduchira/myq-home-alexa/blob/master/LICENSE)
