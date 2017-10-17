# MyQ Home
An Alexa custom skill to control your MyQ-Enabled devices.

## Hosting

### Step 1
Create a free Amazon Developer account [here](https://developer.amazon.com/) or login to it if you already have one.

### Step 2
Click the **Alexa** tab on top, then the **Get Started** button on the Alexa Skills Kit card, and then the **Add a New Skill** button on the top right.

### Step 3
Make sure the **Create a New Alexa Skill** page has the following settings. Any settings not mentioned should be left as is.

```
Skill Type: Custom Interaction Model
Language: English (U.S.)
Name: MyQ Home (if you would like to set a different name, feel free to do so)
Invocation Name: my queue (if you would like to set a different invocation name, feel free to do so. Make sure this invocation name doesn't conflict with any of the invocation names of your enabled skills)
```

When done, click **Save** down at the bottom.

### Step 4
Click on **Interaction Model** on the left and then click **Launch Skill Builder**. After the Skill Builder dashboard pops up, click on **Code Editor** on the top left.

### Step 5
Copy everything on [this page](https://raw.githubusercontent.com/thomasmunduchira/myq-home-alexa/master/speechAssets/IntentSchema.json) and replace the existing content in the Code Editor with this new content.

### Step 6
Click **Build Model**. Then click **Configuration** up on top.

### Step 7
In a new tab, create a free Amazon AWS account [here](https://aws.amazon.com/) or login to it if you already have one.

### Step 8
Ensure that the location on the top right is **N. Virginia**. If not, switch to that location.

### Step 9
Click on **Lambda** under **Compute**. Then click on **Create function**, and then click **Author from scratch**.

### Step 10
Make sure the **Basic Information** page has the following settings. Some of the settings might not appear initially, but will dynamically appear as you change the settings one by one.

```
Name: myqHome
Role: Create new role from template(s)
Role name: myqHomeRole
Policy templates: Simple Microservice permissions
```

When done, click on **Create function** on the bottom right.

### Step 11
Make sure the **Function code** section has the following settings.

```
Code entry type: Upload a .ZIP file
Runtime: Node.js 6.10
Handler: index.handler
```

### Step 12
Click [here](https://drive.google.com/file/d/0Bx2mdlDO74LnR1FaZV8zMDQ2Z2M/view?usp=sharing) to download the ZIP file containing all the code.

### Step 13
Click **Upload** under **Function Package** and then upload the ZIP file you downloaded in the previous step.

### Step 14
Click **Environment variables** and add the following keys and values:

```
Key      | Value

email    | <the email for the Amazon account your Alexa is registered to (required)>
password | <the password for your Amazon account (required)>
appId    | <Copy and paste the ID for your Alexa skill here (optional, no functionality blocked if not set). Sample: amzn1.ask.skill.fcs77245-01f4-4981-cze9-a755g4382115>
pin      | <4 to 12 digit number (optional, will not be able to open doors if not set)>
dbName   | <The database name (optional, will default to myqHome if not set)>
```

When done, click **Save** up on top.

### Step 15
Click on **Triggers** under the Lambda function name and then click **Add Trigger**. Click the box and then select **Alexa Skills Kit**. Click **Submit** afterwards.

### Step 16
Switch back to your Alexa skill. Make sure the **Configuration** section has the following settings. Any settings not mentioned should be left as is. Some of the settings might not appear initially, but will dynamically appear as you change the settings one by one.

```
Endpoint:
AWS Lambda ARN (Amazon Resource Name)
Default: <Copy and paste the Lambda function ARN here. Sample: arn:aws:lambda:us-east-1:135672458571:function:myqHome>
Provide geographical region endpoints?: No

Account Linking:
Do you allow users to create an account or link to an existing account with you?: No
```

When done, click **Next** down at the bottom.

### Step 17
Click the toggle to enable testing on your account if not already enabled.

At this point, the skill should pop up in your Alexa app and be ready to use.

## Installation

### Step 1
```bash
yarn install   or   npm install
```

### Step 2
```bash
./publish.sh
```

## Contributing

If you would like to contribute enhancements or fixes, please do the following:
1. Fork the repository and clone it locally.
2. Follow the hosting steps above.
3. Follow the installation steps above.
4. Make your changes.
5. Test those changes on the application you're self-hosting.
6. Create a pull request.

## Author
[Thomas Munduchira](https://thomasmunduchira.com/) ([thomas@thomasmunduchira.com](mailto:thomas@thomasmunduchira.com))

## License
[MIT](https://github.com/thomasmunduchira/myq-home-alexa/blob/master/LICENSE)
