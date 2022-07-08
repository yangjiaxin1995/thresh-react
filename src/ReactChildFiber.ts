import { createFiber } from './ReactFiber';
import { isArray, isStringOrNumber, Update } from './utils';

// 协调（diff）
// abc
// bc
export function reconcileChildren(returnFiber: any, children: any) {
  if (isStringOrNumber(children)) {
    return;
  }

  const newChildren = isArray(children) ? children : [children];
  const newChildrenLen = newChildren.length;
  // oldfiber的头结点
  let oldFiber = returnFiber.alternate?.child;
  let previousNewFiber: any = null;
  let newIndex = 0;
  for (newIndex = 0; newIndex < newChildrenLen; newIndex++) {
    const newChild = newChildren[newIndex];
    if (newChild == null) {
      continue;
    }
    const newFiber = createFiber(newChild, returnFiber);
    const same = sameNode(newFiber, oldFiber);

    if (same) {
      Object.assign(newFiber, {
        stateNode: oldFiber.stateNode,
        alternate: oldFiber,
        flags: Update,
      });
    }

    if (!same && oldFiber) {
      deleteChild(returnFiber, oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (previousNewFiber === null) {
      // head node
      returnFiber.child = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }

    previousNewFiber = newFiber;
  }

  if (newIndex === newChildren.length) {
    deleteRemainingChildren(returnFiber, oldFiber);
    return;
  }
}

// 节点复用的条件：1. 同一层级下 2. 类型相同 3. key相同
function sameNode(a: any, b: any) {
  return a && b && a.type === b.type && a.key === b.key;
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

// 删除多个节点
function deleteRemainingChildren(returnFiber: any, currentFirstChild: any) {
  let childToDelete = currentFirstChild;
  while (childToDelete) {
    deleteChild(returnFiber, childToDelete);
    childToDelete = childToDelete.sibling;
  }
}
