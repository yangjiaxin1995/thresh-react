import {
  updateClassComponent,
  updateFragmentComponent,
  updateFunctionComponent,
  updateHostComponent,
  updateHostTextComponent,
} from './ReactFiberReconciler';
import {
  ClassComponent,
  Fragment,
  FunctionComponent,
  HostComponent,
  HostText,
} from './ReactWorkTags';
import { scheduleCallback } from './Scheduler';
import { Placement, Update, updateNode } from './utils';

let wip: any = null; // work in progress 当前正在工作中的
let wipRoot: any = null;

// 初次渲染和更新
export function scheduleUpdateOnFiber(fiber: any) {
  wip = fiber;
  wipRoot = fiber;

  scheduleCallback(workLoop);
}

function performUnitOfWork() {
  const { tag } = wip;

  // todo 1. 更新当前组件
  switch (tag) {
    case HostComponent:
      updateHostComponent(wip);
      break;

    case FunctionComponent:
      updateFunctionComponent(wip);
      break;

    case ClassComponent:
      updateClassComponent(wip);
      break;

    case Fragment:
      updateFragmentComponent(wip);
      break;

    case HostText:
      updateHostTextComponent(wip);
      break;

    default:
      break;
  }

  // todo 2. 下一个更新谁 深度优先遍历
  if (wip.child) {
    wip = wip.child;
    return;
  }

  let next = wip;

  while (next) {
    if (next.sibling) {
      wip = next.sibling;
      return;
    }
    next = next.return;
  }

  wip = null;
}

function workLoop() {
  while (wip) {
    performUnitOfWork();
  }

  if (!wip && wipRoot) {
    commitRoot();
  }
}

// requestIdleCallback(workLoop);

function commitRoot() {
  commitWorker(wipRoot);
  wipRoot = null;
}

function commitWorker(wip: any) {
  if (!wip) {
    return;
  }
  // 1. 更新自己

  const { flags, stateNode } = wip;

  const parentNode = getParentNode(wip.return);
  if (flags & Placement && stateNode) {
    parentNode.appendChild(stateNode);
  }

  if (flags & Update && stateNode) {
    // 更新属性
    updateNode(stateNode, wip.alternate?.props, wip?.props);
  }

  // 2. 更新子节点
  commitWorker(wip.child);
  // 2. 更新兄弟节点
  commitWorker(wip.sibling);
}

function getParentNode(wip: any) {
  // console.log('test parent wip', wip);
  let tem = wip;
  while (tem) {
    if (tem.stateNode) {
      return tem.stateNode;
    }
    tem = tem.return;
  }
}
