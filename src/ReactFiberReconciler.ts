import { createFiber } from './ReactFiber';
import { isArray, isStringOrNumber, updateNode } from './utils';

// 原生标签
export function updateHostComponent(wip) {
  if (!wip.stateNode) {
    wip.stateNode = document.createElement(wip.type);
    // 属性
    updateNode(wip.stateNode, {}, wip.props);
  }
  // 子节点
  reconcileChildren(wip, wip.props.children);

  console.log('test wip', wip);
}

// 函数组件
export function updateFunctionComponent(wip) {}

// 类组件
export function updateClassComponent(wip) {}

// fragement
export function updateFragmentComponent(wip) {}

// 文本
export function updateHostTextComponent(wip) {}

function reconcileChildren(wip: any, children: any) {
  if (isStringOrNumber(children)) {
    return;
  }

  const newChildren = isArray(children) ? children : [children];
  let previousNewFiber: any = null; //记录上一次的fiber
  for (let i = 0; i < newChildren.length; i++) {
    const newChild = newChildren[i];
    const newFiber = createFiber(newChild, wip);

    if (i === 0) {
      wip.child = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }

    previousNewFiber = newFiber;
  }
}
