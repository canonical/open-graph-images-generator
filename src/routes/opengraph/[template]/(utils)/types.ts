export type VNode = {
	type: string;
	props: {
		style?: Record<string, unknown>;
		children?: string | VNode | VNode[];
		[prop: string]: unknown;
	};
};

export function isVNode(node: unknown): node is VNode {
	return typeof node === 'object' && node !== null && 'type' in node && 'props' in node;
}

export function isVNodeArray(node: unknown): node is VNode[] {
	return Array.isArray(node) && node.every(isVNode);
}
