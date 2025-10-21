import { isVNode, isVNodeArray, type VNode } from './types';

const stringOrPixelToNumber = (value: string | number): number | string => {
	if (typeof value === 'string') {
		const numericValue = Number(value.replace('px', ''));
		if (!isNaN(numericValue)) {
			return numericValue;
		}
		return value;
	}
	return value;
};

export function applyNumericDimensions(reactLike: VNode) {
	if (isVNode(reactLike)) {
		if (reactLike.props.width) {
			reactLike.props.width = stringOrPixelToNumber(reactLike.props.width as string);
		}
		if (reactLike.props.height) {
			reactLike.props.height = stringOrPixelToNumber(reactLike.props.height as string);
		}
	}
	if (reactLike.props.children) {
		if (isVNode(reactLike.props.children)) {
			applyNumericDimensions(reactLike.props.children);
		} else if (isVNodeArray(reactLike.props.children)) {
			reactLike.props.children.forEach(applyNumericDimensions);
		}
	}
	return reactLike;
}
