import { createFiber } from './ReactFiber';
import { isArray, isStringOrNumber, updateNode } from './utils';

// 原生标签
export function updateHostComponent(wip: any) {
  // console.log('test host component wip', wip, new Date().valueOf());

  if (!wip.stateNode) {
    wip.stateNode = document.createElement(wip.type);
    // 属性
    updateNode(wip.stateNode, {}, wip.props);
  }
  // 子节点
  reconcileChildren(wip, wip.props.children);
}

// 函数组件
export function updateFunctionComponent(wip: any) {
  // console.log('test function component wip', wip, new Date().valueOf());

  const { type, props } = wip;

  const children = type(props);

  reconcileChildren(wip, children);
}

// 类组件
export function updateClassComponent(wip: any) {
  // console.log('test class component wip', wip, new Date().valueOf());

  const { type, props } = wip;

  const instance = new type(props);
  const children = instance.render();

  reconcileChildren(wip, children);
}

// Fragement
export function updateFragmentComponent(wip: any) {
  // console.log('test fragment component wip', wip, new Date().valueOf());
  reconcileChildren(wip, wip.props.children);
}

// 文本
export function updateHostTextComponent(wip: any) {
  // console.log('test host text component wip', wip, new Date().valueOf());
  wip.stateNode = document.createTextNode(wip.props.children);
}

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
