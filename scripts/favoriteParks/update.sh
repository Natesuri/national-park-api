#!/bin/bash

API="http://localhost:4741"
URL_PATH="/favoriteParks"

curl "${API}${URL_PATH}/${ID}/update" \
  --include \
  --request PATCH \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "favoriteParks": {
      "list": ["yell","yose"]
    }
  }'

echo
