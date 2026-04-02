# @wine-app/api-client

Typed client wrapper for the Wine App API contract in `docs/api/openapi.yaml`.

## Scripts

- `npm run build`: typecheck the package
- `npm run check`: alias for the same typecheck

## Notes

- The client is self-contained and does not depend on generated code.
- It supports both bearer-token and cookie-session auth at request level.
- When the contract changes, update `docs/api/openapi.yaml` first, then extend the types/client here.
