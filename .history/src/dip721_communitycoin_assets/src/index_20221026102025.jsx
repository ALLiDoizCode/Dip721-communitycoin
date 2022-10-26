import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import {HashRouter} from "react-router-dom";
import "../../../node_modules/bootstrap/dist/css/bootstrap.css";
import "../../../node_modules/bootstrap/dist/js/bootstrap";
import "../../../node_modules/jquery/dist/jquery";
import "../../../node_modules/@popperjs/core/dist/cjs/popper";
import "*.svg";

import {
  RecoilRoot
} from 'recoil';

const container = document.getElementById('root');
const root = createRoot(container)
root.render(
    <RecoilRoot>
      <HashRouter>
        <App />
      </HashRouter>
    </RecoilRoot>
);
