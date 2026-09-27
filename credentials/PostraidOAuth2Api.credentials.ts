import type { ICredentialType, INodeProperties } from "n8n-workflow";

export class PostraidOAuth2Api implements ICredentialType {
  name = "postraidOAuth2Api";
  displayName = "Postraid OAuth2 API";
  documentationUrl =
    "https://github.com/postraid/n8n-nodes-postraid#authentication";
  icon = { light: "file:postraid.svg", dark: "file:postraid.svg" } as const;
  extends = ["oAuth2Api"];
  properties: INodeProperties[] = [
    {
      displayName: "Use Dynamic Client Registration",
      name: "useDynamicClientRegistration",
      type: "hidden",
      default: true,
    },
    {
      displayName: "Server URL",
      name: "serverUrl",
      type: "hidden",
      default: "https://mcp.postraid.com/mcp",
    },
    {
      displayName: "Resource URL",
      name: "resourceUrl",
      type: "hidden",
      default: "https://mcp.postraid.com/mcp",
    },
  ];
}
