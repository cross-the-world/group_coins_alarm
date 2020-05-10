#!/usr/bin/env bash

resturl=http://localhost:3000

echo
echo "=== /api/config/styles === "

curl -s \
    --request GET \
    $resturl/api/config/styles

echo $resturl/api/config/styles


echo
echo "=== /api/send ==="

curl -s \
    --header "Content-Type: application/json" \
    --request POST \
    --form 'soundblob=@\"E:/auth.txt\"' \
    $resturl/api/send

echo $resturl/api/send

##    --data '{"data":"test send"}' \
