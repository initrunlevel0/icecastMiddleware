#!/bin/bash

NUM=$1
TIME=$2
URL=$3

for i in $(seq $NUM)
do
    curl -o /dev/null -m $TIME -s -w "%{size_download}\n" $URL &
done
wait
