import { createFiber } from './ReactFiber';
import { isArray, isStringOrNumber, Placement, Update } from './utils';

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

function placeChild(
  newFiber: any,
  lastPlacedIndex: number,
  newIndex: number,
  shouldTrackSideEffects: boolean
) {
  newFiber.index = newIndex;
  if (!shouldTrackSideEffects) {
    // 父节点的初次渲染
    return lastPlacedIndex;
  }

  // 父节点的更新
  const current = newFiber.alternate;
  if (current) {
    // 更新
    const oldIndex = current.index;
    if (oldIndex < lastPlacedIndex) {
      // oldIndex 节点在dom上的位置
      // 新节点的位置
      // 1  3 5
      // 2
      newFiber.flags |= Placement;
      return lastPlacedIndex;
    } else {
      return oldIndex;
    }
  } else {
    // 初次渲染
    // 插入
    newFiber.flags |= Placement;
    return lastPlacedIndex;
  }
}

function mapRemainingChildren(currentFirstChild: any) {
  const existingChildren = new Map();
  let existingChild = currentFirstChild;
  while (existingChild) {
    existingChildren.set(
      existingChild.key || existingChild.index,
      existingChild
    );
    existingChild = existingChild.sibling;
  }

  return existingChildren;
}

// 节点复用的条件：1. 同一层级下 2. 类型相同 3. key相同
function sameNode(a: any, b: any) {
  return a && b && a.type === b.type && a.key === b.key;
}

// 协调（diff）
// abc
// bc
export function reconcileChildren(returnFiber: any, children: any) {
  if (isStringOrNumber(children)) {
    return;
  }

  const newChildren: any[] = isArray(children) ? children : [children];
  const newChildrenLen = newChildren.length;
  // oldfiber的头结点
  let oldFiber: any = returnFiber.alternate?.child;
  // 存储下一个oldfiber || 缓存当前的olfFiber
  let nextOldFiber: any = null;
  // 更新true，初次渲染是false
  let shouldTrackSideEffects = !!returnFiber.alternate;

  let previousNewFiber: any = null;
  let newIndex = 0;
  // 上次插入节点的位置
  let lastPlacedIndex = 0;
  // *1.从左边往右按序查找，如果节点能复用，继续往右，不能复用就停止
  for (; oldFiber && newIndex < newChildrenLen; newIndex++) {
    const newChild = newChildren[newIndex];
    if (newChild == null) {
      continue;
    }
    if (oldFiber.index > newIndex) {
      nextOldFiber = oldFiber;
      oldFiber = null;
    } else {
      nextOldFiber = oldFiber.sibling;
    }
    const same = sameNode(newChild, oldFiber);

    if (!same) {
      if (oldFiber === null) {
        oldFiber = nextOldFiber;
      }
      break;
    }

    const newFiber = createFiber(newChild, returnFiber);

    Object.assign(newFiber, {
      stateNode: oldFiber.stateNode,
      alternate: oldFiber,
      flags: Update,
    });

    lastPlacedIndex = placeChild(
      newFiber,
      lastPlacedIndex,
      newIndex,
      shouldTrackSideEffects
    );

    if (previousNewFiber === null) {
      returnFiber.child = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
    oldFiber = nextOldFiber;
  }

  // 0 1 2 3 4
  // 0 1 2
  // *2. 如果新节点遍历完了，但是(多个)老节点还有，（多个）老节点要被删除
  if (newIndex === newChildrenLen) {
    deleteRemainingChildren(returnFiber, oldFiber);
    return;
  }

  //  *3
  //   1) 初次渲染
  //   2) 老节点复用完了，但是新节点还有
  if (!oldFiber) {
    for (; newIndex < newChildrenLen; newIndex++) {
      const newChild = newChildren[newIndex];
      if (newChild == null) {
        continue;
      }
      const newFiber = createFiber(newChild, returnFiber);

      lastPlacedIndex = placeChild(
        newFiber,
        lastPlacedIndex,
        newIndex,
        shouldTrackSideEffects
      );

      if (previousNewFiber === null) {
        // head node
        returnFiber.child = newFiber;
      } else {
        previousNewFiber.sibling = newFiber;
      }

      previousNewFiber = newFiber;
    }

    return;
  }

  // *4. 新老节点都还有
  //  0 1 [2 3 4]
  //  0 1 [3 4]
  // Map key: value
  //  {2, }
  const existingChildren = mapRemainingChildren(oldFiber);

  for (; newIndex < newChildrenLen; newIndex++) {
    const newChild = newChildren[newIndex];
    if (newChild == null) {
      continue;
    }

    const newFiber = createFiber(newChild, returnFiber);
    // 新增 | 复用
    let matchedFiber = existingChildren.get(newFiber.key || newFiber.index);

    if (matchedFiber) {
      // 节点复用
      Object.assign(newFiber, {
        stateNode: matchedFiber.stateNode,
        alternate: matchedFiber,
        flags: Update,
      });
      existingChildren.delete(newFiber.key || newFiber.index);
    }

    lastPlacedIndex = placeChild(
      newFiber,
      lastPlacedIndex,
      newIndex,
      shouldTrackSideEffects
    );

    if (previousNewFiber === null) {
      // head node
      returnFiber.child = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }

    previousNewFiber = newFiber;
  }

  // *5. 还剩下oldFiber
  if (shouldTrackSideEffects) {
    existingChildren.forEach((child) => deleteChild(returnFiber, child));
  }
}
