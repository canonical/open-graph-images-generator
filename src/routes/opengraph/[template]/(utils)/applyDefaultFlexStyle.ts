import { isVNode, isVNodeArray, type VNode } from './types';

const tagsToApplyDefaultFlexStyle = ['div', 'footer', 'main', 'article'];
export function applyDefaultFlexStyle(reactLike: VNode) {
	if (isVNode(reactLike) && tagsToApplyDefaultFlexStyle.includes(reactLike.type)) {
		reactLike.props.style = {
			...reactLike.props.style,
			display: 'flex'
		};
	}
	if (reactLike.props.children) {
		if (isVNode(reactLike.props.children)) {
			applyDefaultFlexStyle(reactLike.props.children);
		} else if (isVNodeArray(reactLike.props.children)) {
			reactLike.props.children.forEach(applyDefaultFlexStyle);
		}
	}
	return reactLike;
}
