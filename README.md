# n8n-nodes-postraid

Connect [**Postraid**](https://postraid.com) to n8n workflows using your own account. This package exposes 5 named operations through the product's authenticated API, with form fields for required inputs and optional fields you choose explicitly.

## Installation

For self-hosted n8n, open **Settings → Community Nodes → Install** and enter `n8n-nodes-postraid`. On n8n Cloud, installation depends on n8n's community-node verification; npm publication alone does not make a node verified.

Use n8n **2.40.7 or newer**, with OAuth dynamic client registration support. Older installations should upgrade before using this credential.

## Authentication

1. Add the **Postraid** node and create a **Postraid OAuth2 API** credential.
2. Click **Connect my account**. n8n discovers the product authorization server and registers its own callback automatically.
3. Sign in to your Postraid account, check the account and permissions on the consent screen, and approve the connection.
4. Save the credential and select an operation.

No API key, client secret, browser cookie, or access token belongs in a workflow field. n8n stores the OAuth credential and refreshes tokens. Your account roles, ownership checks, available integrations, plan limits and credits still apply. You can revoke the connection in the product's connected-app settings. This node contacts only `https://mcp.postraid.com/mcp`; the n8n OAuth flow contacts the product's discovered authorization server.

## Operations

| Operation | Access | Purpose |
| --- | --- | --- |
| Create Post Draft | Write / may use credits | Save supplied slide copy as an editable carousel with placeholder backgrounds. No AI generation, rendering, scheduling, publishing or credit spending. Reuse requestId only to retry the same draft. |
| Get Post | Read | Read a saved content piece owned by your account, with its editor URL. Does not query social provider credentials or publish. |
| Get Profile | Read | Read the signed-in customer's own Postraid account profile. Does not search for or identify other people. |
| List Brands | Read | List brands in your own Postraid workspace. Team workspaces are not included. Use the returned brand ID for content tools. |
| List Posts | Read | Browse saved content pieces for a brand in your own workspace. These are drafts or library items; reaction=published is a local marker, not independent proof of provider delivery. |

## Example workflow

Import [the included example](examples/account-check.json), select your credential, and execute the manual trigger. It runs **Get Profile** once and outputs the account response. Replace the trigger with a schedule to build a recurring report, then connect a filter, spreadsheet or notification node.

For operations that return IDs, map the returned ID into the required field of a second Postraid node. Returned arrays stay inside the response object; use n8n's **Split Out** node when you need one item per record. Pagination fields are exposed only where the product supports them; advance the cursor/page explicitly rather than assuming all records were fetched.

## Writes and account limits

Write operations require **Confirm Write Operation**. Review the inputs before enabling it: every workflow execution may repeat the action, create a draft, change account data, or consume product credits depending on the selected operation. The node does not retry write operations automatically. Use read-only operations for monitoring and deduplicate scheduled workflows that create data. Product authorization remains enforced by the server.

## Error handling

- Reconnect OAuth after an authorization failure or revoked grant.
- Check account permissions and plan limits for forbidden or rate-limited responses.
- Invalid inputs stop the item before sending a request. Product-specific validation remains authoritative.
- **On Error → Continue** returns an error item linked to the original input. Failed MCP tool results are never returned as successful data.
- No passwords, environment variables, or customer data are bundled. No external runtime dependencies are installed by this package.

## Development

```sh
npm ci --ignore-scripts
npm run lint
npm test
```

Releases are built and tested in [GitHub Actions](https://github.com/postraid/n8n-nodes-postraid/actions), then published to npm with provenance. Public snapshots use GitHub Actions bot attribution.

## Links

- [Website](https://postraid.com)
- [Privacy policy](https://postraid.com/privacy/)
- [Source and issues](https://github.com/postraid/n8n-nodes-postraid)
- [n8n community-node installation](https://docs.n8n.io/integrations/community-nodes/installation/)

MIT licensed. This community integration is not an n8n core node.
