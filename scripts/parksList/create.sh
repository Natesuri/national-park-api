#!/bin/bash

API="http://localhost:4741"
URL_PATH="/parksList"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "parksList": {
      "list": "'"${LIST}"'"
    }
  }'

echo
