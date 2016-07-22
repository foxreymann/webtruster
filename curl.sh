#!/bin/bash
echo 'foxreymann'
curl -d '{"twitter": "foxreymann", "name": "", "location": ""}' -H "Content-Type: application/json" http://localhost:8080/score
echo -e '\n'

echo 'fxreymann'
curl -d '{"twitter": "fxreymann", "name": "", "location": ""}' -H "Content-Type: application/json" http://localhost:8080/score
echo -e '\n'

echo 'ewareymann'
curl -d '{"twitter": "ewareymann", "name": "", "location": ""}' -H "Content-Type: application/json" http://localhost:8080/score
echo -e '\n'
