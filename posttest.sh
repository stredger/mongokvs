#! /usr/bin/env bash

$host = grack04.uvic.trans-cloud.net

curl --data "{\"name\":\"hey\", \"key\":\"sup\", \"value\":\"butts\"}" http://${host}:44444/put
