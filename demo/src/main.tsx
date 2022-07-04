// import React from "react";
// import ReactDOM from "react-dom";
// import {  useReducer } from "react";
import { ReactDOM } from '../which-react';

import './index.css';

const jsx = (
  <div className="border">
    <h1>react</h1>
    <a href="https://github.com/yangjiaxin1995/thresh-react">thresh react</a>
    {/* <FunctionComponent name="函数组件" /> */}
    {/* <ClassComponent name="类组件" /> */}
    {/* <FragmentComponent /> */}
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(jsx);

// 实现了常见组件初次渲染

// 原生标签
// 函数组件
// 类组件
// 文本
// Fragment
