#! /usr/bin/env bash

host=grack04.uvic.trans-cloud.net
#curl --data "{\"name\":\"hey\", \"key\":\"sup\", \"value\":\"poo\"}" http://${host}:64444/put
curl --data "{\"name\":\"hey\", \"key\":\"sup\"}" http://${host}:64444/get
echo ""
