import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop';

let currentlyRenderingFiber: any = null;
let workInProgressHook: any = null;

export function renderWithHooks(wip: any) {
  currentlyRenderingFiber = wip;
  currentlyRenderingFiber.memorizedState = null;
  workInProgressHook = null;
}

function updateWorkInProgressHook() {
  let hook;

  const current = currentlyRenderingFiber?.alternate;
  if (current) {
    // 组件更新
    currentlyRenderingFiber.memorizedState = current.memorizedState;
    if (workInProgressHook) {
      workInProgressHook = hook = workInProgressHook.next;
    } else {
      // hook0
      workInProgressHook = hook = currentlyRenderingFiber.memorizedState;
    }
  } else {
    // 组件初次渲染
    hook = {
      memorizedState: null, // state
      next: null, // 下一个hook
    };
    if (workInProgressHook) {
      workInProgressHook = workInProgressHook.next = hook;
    } else {
      // hook0
      if (currentlyRenderingFiber?.memorizedState) {
        workInProgressHook = currentlyRenderingFiber.memorizedState = hook;
      }
    }
  }

  return hook;
}

export function useReducer(reducer: any, initalState: any) {
  const hook = updateWorkInProgressHook();

  if (!currentlyRenderingFiber?.alternate) {
    // 初次渲染
    hook.memorizedState = initalState;
  }

  //   let dispatch = store.dispatch;
  //   const midApi = {
  //     getState: store.getState(),
  //     // dispatch,
  //     dispatch: (action, ...args) => dispatch(action, ...args),
  //   };
  //   dispatch
  //   const dispatch = () => {
  //     hook.memorizedState = reducer(hook.memorizedState);
  //     currentlyRenderingFiber.alternate = { ...currentlyRenderingFiber };
  //     scheduleUpdateOnFiber(currentlyRenderingFiber);
  //     console.log("log"); //sy-log
  //   };

  const dispatch = dispatchReducerAction.bind(
    null,
    currentlyRenderingFiber,
    hook,
    reducer
  );

  return [hook?.memorizedState, dispatch];
}

function dispatchReducerAction(
  fiber: any,
  hook: any,
  reducer: any,
  action: any
) {
  console.log('test fiber', fiber);
  if (fiber) {
    if (hook.memorizedState) {
      hook.memorizedState = reducer ? reducer(hook.memorizedState) : action;
    }

    fiber.alternate = { ...fiber };
    fiber.sibling = null;
    scheduleUpdateOnFiber(fiber);
  }
}

export function useState(initalState: any) {
  return useReducer(null, initalState);
}
