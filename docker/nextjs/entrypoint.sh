#!/bin/sh
echo 'ENV ENV ENV'
cat /igvf-ui/.env.local

exec "$@"
