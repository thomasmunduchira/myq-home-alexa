rm index.zip
zip -r -X ./index.zip *
aws lambda update-function-code --function-name 'myqHome' --region us-east-1 --zip-file 'fileb://index.zip'
