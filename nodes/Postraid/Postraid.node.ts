import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { executeOperations, type Operation, type ResourceRoute } from './transport';
import operations from './operations.json';
import routes from './routes.json';

export class Postraid implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Postraid',
		name: 'postraid',
		icon: { light: 'file:postraid.svg', dark: 'file:postraid.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Automate your Postraid account',
		defaults: { name: 'Postraid' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: 'postraidOAuth2Api', required: true }],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Account',
						value: 'account',
					},
					{
						name: 'Brand',
						value: 'brands',
					},
					{
						name: 'Post',
						value: 'posts',
					},
					{
						name: 'Post Draft',
						value: 'post-drafts',
					},
				],
				default: 'account',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Profile',
						value: 'get_profile',
						description:
							"Read the signed-in customer's own Postraid account profile. Does not search for or identify other people.",
						action: 'Get profile in postraid',
					},
				],
				default: 'get_profile',
				displayOptions: {
					show: {
						resource: ['account'],
					},
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'List Brands',
						value: 'list_brands',
						description:
							'List brands in your own Postraid workspace. Team workspaces are not included. Use the returned brand ID for content tools',
						action: 'List brands in postraid',
					},
					{
						name: 'List Posts',
						value: 'list_posts',
						description:
							'Browse saved content pieces for a brand in your own workspace. These are drafts or library items; reaction=published is a local marker, not independent proof of provider delivery.',
						action: 'List posts in postraid',
					},
				],
				default: 'list_brands',
				displayOptions: {
					show: {
						resource: ['brands'],
					},
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Post',
						value: 'get_post',
						description:
							'Read a saved content piece owned by your account, with its editor URL. Does not query social provider credentials or publish.',
						action: 'Get post in postraid',
					},
				],
				default: 'get_post',
				displayOptions: {
					show: {
						resource: ['posts'],
					},
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Create Post Draft',
						value: 'create_post_draft',
						description:
							'Save supplied slide copy as an editable carousel with placeholder backgrounds. No AI generation, rendering, scheduling, publishing or credit spending. Reuse requestId only to retry the same draft',
						action: 'Create post draft in postraid',
					},
				],
				default: 'create_post_draft',
				displayOptions: {
					show: {
						resource: ['post-drafts'],
					},
				},
			},
			{
				displayName:
					'This operation changes data or may use account credits. Review the inputs and the product permissions before running this workflow.',
				name: 'writeNotice',
				type: 'notice',
				default: '',
				displayOptions: {
					show: {
						operation: ['create_post_draft'],
						resource: ['post-drafts'],
					},
				},
			},
			{
				displayName: 'Confirm Write Operation',
				name: 'confirmWrite',
				type: 'boolean',
				default: false,
				description:
					'Whether you authorize this workflow to run the selected write operation, including any applicable product credits',
				displayOptions: {
					show: {
						operation: ['create_post_draft'],
						resource: ['post-drafts'],
					},
				},
			},
			{
				displayName: 'Request ID',
				name: 'create_post_draft__requestId',
				type: 'string',
				default: '',
				required: true,
				description: 'The request ID for this operation',
				displayOptions: {
					show: {
						operation: ['create_post_draft'],
						resource: ['post-drafts'],
					},
				},
			},
			{
				displayName: 'Title',
				name: 'create_post_draft__title',
				type: 'string',
				default: '',
				required: true,
				description: 'The title for this operation',
				displayOptions: {
					show: {
						operation: ['create_post_draft'],
						resource: ['post-drafts'],
					},
				},
			},
			{
				displayName: 'Slides',
				name: 'create_post_draft__slides',
				type: 'json',
				default: '[]',
				required: true,
				description: 'The slides for this operation',
				displayOptions: {
					show: {
						operation: ['create_post_draft'],
						resource: ['post-drafts'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'options_create_post_draft',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['create_post_draft'],
						resource: ['post-drafts'],
					},
				},
				options: [
					{
						displayName: 'Brand ID',
						name: 'brandId',
						type: 'string',
						default: 'default',
						description: 'The brand ID for this operation',
					},
					{
						displayName: 'Hashtags',
						name: 'hashtags',
						type: 'json',
						default: [],
						description: 'The hashtags for this operation',
					},
				],
			},
			{
				displayName: 'Post ID',
				name: 'get_post__postId',
				type: 'string',
				default: '',
				required: true,
				description: 'The post ID for this operation',
				displayOptions: {
					show: {
						operation: ['get_post'],
						resource: ['posts'],
					},
				},
			},
			{
				displayName: 'Additional Fields',
				name: 'options_list_brands',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['list_brands'],
						resource: ['brands'],
					},
				},
				options: [
					{
						displayName: 'Offset',
						name: 'offset',
						type: 'number',
						default: 0,
						description: 'The offset for this operation',
						typeOptions: {
							minValue: 0,
							maxValue: 10000,
							numberPrecision: 0,
						},
					},
				],
			},
			{
				displayName: 'Additional Fields',
				name: 'options_list_posts',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						operation: ['list_posts'],
						resource: ['brands'],
					},
				},
				options: [
					{
						displayName: 'Brand ID',
						name: 'brandId',
						type: 'string',
						default: 'default',
						description: 'The brand ID for this operation',
					},
					{
						displayName: 'Offset',
						name: 'offset',
						type: 'number',
						default: 0,
						description: 'The offset for this operation',
						typeOptions: {
							minValue: 0,
							maxValue: 10000,
							numberPrecision: 0,
						},
					},
				],
			},
		],
	};
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return executeOperations(
			this,
			'https://www.postraid.com',
			'postraidOAuth2Api',
			operations as unknown as Operation[],
			routes as Record<string, ResourceRoute>,
		);
	}
}
