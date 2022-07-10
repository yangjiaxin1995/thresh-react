import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop';
import { HookLayout, HookPassive, areHookInputsEqual } from './utils';

let currentlyRenderingFiber: any = null;
let workInProgressHook: any = null;

let currentHook: any = null;

export function renderWithHooks(wip: any) {
  currentlyRenderingFiber = wip;
  currentlyRenderingFiber.memorizedState = null;
  workInProgressHook = null;

  // 源码中使用链表储存且放在一起，为简化实现，此处使用两个数组储存
  currentlyRenderingFiber.updateQueueOfEffect = [];
  currentlyRenderingFiber.updateQueueOfLayout = [];
}

function updateWorkInProgressHook() {
  let hook;

  const current = currentlyRenderingFiber.alternate;
  if (current) {
    // 组件更新
    currentlyRenderingFiber.memorizedState = current.memorizedState;
    if (workInProgressHook) {
      workInProgressHook = hook = workInProgressHook.next;
      currentHook = currentHook.next;
    } else {
      // hook0
      workInProgressHook = hook = currentlyRenderingFiber.memorizedState;
      currentHook = current.memorizedState;
    }
  } else {
    // 组件初次渲染
    currentHook = null;
    hook = {
      memorizedState: null, // state
      next: null, // 下一个hook
    };
    if (workInProgressHook) {
      workInProgressHook = workInProgressHook.next = hook;
    } else {
      // hook0
      workInProgressHook = currentlyRenderingFiber.memorizedState = hook;
    }
  }

  return hook;
}

export function useReducer(reducer: any, initalState: any) {
  const hook = updateWorkInProgressHook();

  if (!currentlyRenderingFiber.alternate) {
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
  hook.memorizedState = reducer ? reducer(hook.memorizedState) : action;
  fiber.alternate = { ...fiber };
  fiber.sibling = null;
  scheduleUpdateOnFiber(fiber);
}

export function useState(initalState: any) {
  return useReducer(null, initalState);
}

function updateEffectImpl(hookFlags: any, create: () => void, deps: any[]) {
  const hook = updateWorkInProgressHook();

  if (currentHook) {
    // 检查deps是否变化
    const prevEffect = currentHook.memorizedState;

    if (deps) {
      const prevDeps = prevEffect.deps;
      if (areHookInputsEqual(deps, prevDeps)) {
        return;
      }
    }
  }

  const effect = { hookFlags, create, deps };
  hook.memorizedState = effect;

  if (hookFlags & HookPassive) {
    currentlyRenderingFiber.updateQueueOfEffect.push(effect);
  } else if (hookFlags & HookLayout) {
    currentlyRenderingFiber.updateQueueOfLayout.push(effect);
  }
}

export function useEffect(create: () => void, deps: any[]) {
  return updateEffectImpl(HookPassive, create, deps);
}

export function useLayoutEffect(create: () => void, deps: any[]) {
  return updateEffectImpl(HookLayout, create, deps);
}
