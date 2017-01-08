#!/bin/sh
SECONDS_PER_MINUTE=60

# How many minutes to between generating tweets
GENERATE_FREQUENCY=${GENERATE_FREQUENCY:-60} 

DELAY=$(expr $SECONDS_PER_MINUTE \* $GENERATE_FREQUENCY)

echo "[INFO] Started. Generating tweets every $DELAY seconds."

while true; do
	echo "[INFO] Generating tweet..."
	node src/ebooks.js || exit 1
	echo "[INFO] Sleeping for $DELAY seconds."
	sleep $DELAY
done

echo "[INFO] Exited."
