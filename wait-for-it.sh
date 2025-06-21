#!/bin/sh
# wait-for-it.sh

set -e

host="$1"
shift
cmd="$@"

until PONG=$(redis-cli -h "$host" ping) && [ "$PONG" = "PONG" ]; do
  >&2 echo "Redis is unavailable - sleeping"
  sleep 1
done

>&2 echo "Redis is up - executing command"
exec $cmd 