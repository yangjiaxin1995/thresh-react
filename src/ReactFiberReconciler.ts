import { createFiber } from './ReactFiber';
import { renderWithHooks } from './hooks';
import { isArray, isStringOrNumber, Update, updateNode } from './utils';

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
  renderWithHooks(wip);

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

// 删除单个节点
function deleteChild(returnFiber: any, childToDelete: any) {
  // returnFiber.deletoins = [...]
  const deletions = returnFiber.deletions;
  if (deletions) {
    returnFiber.deletions.push(childToDelete);
  } else {
    returnFiber.deletions = [childToDelete];
  }
}

// 协调（diff）
// abc
// bc
function reconcileChildren(wip: any, children: any) {
  if (isStringOrNumber(children)) {
    return;
  }

  const newChildren = isArray(children) ? children : [children];
  // oldfiber的头结点
  let oldFiber = wip.alternate?.child;
  let previousNewFiber = null;
  for (let i = 0; i < newChildren.length; i++) {
    const newChild = newChildren[i];
    if (newChild == null) {
      continue;
    }
    const newFiber = createFiber(newChild, wip);
    const same = sameNode(newFiber, oldFiber);

    if (same) {
      Object.assign(newFiber, {
        stateNode: oldFiber.stateNode,
        alternate: oldFiber,
        flags: Update,
      });
    }

    if (!same && oldFiber) {
      deleteChild(wip, oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (previousNewFiber === null) {
      // head node
      wip.child = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }

    previousNewFiber = newFiber;
  }
}

// 节点复用的条件：1. 同一层级下 2. 类型相同 3. key相同
function sameNode(a: any, b: any) {
  return a && b && a.type === b.type && a.key === b.key;
}
