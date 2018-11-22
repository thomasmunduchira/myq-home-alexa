rm index.zip
zip -r -X ./index.zip config/ handlers/ utils/ node_modules/ index.js
# aws lambda update-function-code --function-name 'myqHome' --region us-east-1 --zip-file 'fileb://index.zip' # uploads your zip file to Lambda function in US East through the AWS Command Line
# aws lambda update-function-code --function-name 'myqHome' --region eu-west-1 --zip-file 'fileb://index.zip' # uploads your zip file to Lambda function in EU West through the AWS Command Line
