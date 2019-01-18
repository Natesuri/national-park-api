#!/bin/bash

API="http://localhost:4741"
URL_PATH="/favoriteParks"

curl "${API}${URL_PATH}/${ID}/updateOne" \
  --include \
  --request PATCH \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "favoriteParks": {
      "list": ["dena"]
    }
  }'

echo
