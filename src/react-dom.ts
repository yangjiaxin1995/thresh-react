import { createFiber } from './ReactFiber';
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop';

function ReactDOMRoot(internalRoot: { containerInfo: any }) {
  this._internalRoot = internalRoot;
}

ReactDOMRoot.prototype.render = function (children: any) {
  // console.log("children", children);
  const root = this._internalRoot;
  updateContainer(children, root);
};

function updateContainer(element: any, container: { containerInfo: any }) {
  const { containerInfo } = container;
  const fiber = createFiber(element, {
    type: containerInfo.nodeName.toLocaleLowerCase(),
    stateNode: containerInfo,
  });
  // 组件初次渲染
  scheduleUpdateOnFiber(fiber);
}

function createRoot(container: any) {
  const root = { containerInfo: container };

  return new ReactDOMRoot(root);
}

export default { createRoot };
