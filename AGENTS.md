<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:sabaiapply-agent-rules -->
# Maintain Documentation
All API, Database schemas, and architectural docs are located in the `docs/` directory.
BEFORE making backend or database changes, READ these docs to ensure consistency. 
WHENEVER you make changes to the API endpoints, Server Actions, or Database schema, you MUST immediately update the corresponding markdown documentation in the `docs/` folder.

# Manage Translations (i18n)
When adding or updating any internationalization (i18n) translations or localized strings, you MUST strictly refer to and follow the implementation guidelines strictly outlined in `docs/i18n/translation-guide.md`.
<!-- END:sabaiapply-agent-rules -->
