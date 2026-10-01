import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  INodeProperties,
} from "n8n-workflow";
import { NodeConnectionTypes } from "n8n-workflow";
import { executeOperations, type Operation, type ResourceRoute } from "./transport";
import operations from "./operations.json";
import properties from "./properties.json";
import routes from "./routes.json";

export class Postraid implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Postraid",
    name: "postraid",
    icon: { light: "file:postraid.svg", dark: "file:postraid.svg" },
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: "Automate your Postraid account",
    defaults: { name: "Postraid" },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    usableAsTool: true,
    credentials: [{ name: "postraidOAuth2Api", required: true }],
    properties: properties as INodeProperties[],
  };
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    return executeOperations(
      this,
      "https://mcp.postraid.com",
      "postraidOAuth2Api",
      operations as unknown as Operation[],
      routes as Record<string,ResourceRoute>,
    );
  }
}
