#!/bin/sh
SECONDS_PER_MINUTE=60

# How many minutes to between generating tweets
GENERATE_FREQUENCY=${GENERATE_FREQUENCY:-60}
MIN_GENERATE_FREQUENCY=${MIN_GENERATE_FREQUENCY:-$GENERATE_FREQUENCY}
MAX_GENERATE_FREQUENCY=${MAX_GENERATE_FREQUENCY:-$GENERATE_FREQUENCY}

if [ "$MIN_GENERATE_FREQUENCY" -gt "$MAX_GENERATE_FREQUENCY" ]; then
	echo "[ERR ] MIN_GENERATE_FREQUENCY is greater than MAX_GENERATE_FREQUENCY"
	exit 1
fi

# Check environment variables before starting
node src/options.js || exit 1 

MIN_DELAY=$(expr $SECONDS_PER_MINUTE \* $MIN_GENERATE_FREQUENCY)
MAX_DELAY=$(expr $SECONDS_PER_MINUTE \* $MAX_GENERATE_FREQUENCY)

echo "[INFO] Started. Generating tweets between every $MIN_DELAY and $MAX_DELAY seconds."

while true; do
	NEXT_SLEEP=$(python -S -c "import random; print random.randrange($MIN_DELAY, $MAX_DELAY + 1)")
	echo "[INFO] Sleeping for $NEXT_SLEEP seconds."
	sleep $NEXT_SLEEP

	echo "[INFO] Generating tweet..."
	node src/ebooks.js || exit 1
done

echo "[INFO] Exited."
