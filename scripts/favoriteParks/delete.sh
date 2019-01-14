#!/bin/sh

API="http://localhost:4741"
URL_PATH="/favoriteParks"

curl "${API}${URL_PATH}/${ID}/delete" \
  --include \
  --request DELETE \
  --header "Authorization: Bearer ${TOKEN}"

echo
