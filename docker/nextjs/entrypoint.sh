#!/bin/sh

echo "Check that we have NEXT_PUBLIC_AUTH0_ISSUER_BASE_DOMAIN vars"
test -n "$NEXT_PUBLIC_AUTH0_ISSUER_BASE_DOMAIN"

find /app/.next \( -type d -name .git -prune \) -o -type f -print0 | xargs -0 sed -i "s#APP_NEXT_PUBLIC_AUTH0_ISSUER_BASE_DOMAIN#$NEXT_PUBLIC_AUTH0_ISSUER_BASE_DOMAIN#g"


exec "$@"
