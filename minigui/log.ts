// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {Nullable} from './base';
import {getElement, querySelector} from './util';

type CmdHandler = (cmd: string) => void;

class Log {
  private logElem: HTMLElement;
  private consoleElem: Nullable<HTMLElement> = null;
  private cmdHandler: Nullable<CmdHandler> = null;

  constructor(logElemId: string, consoleElemId: Nullable<string> = null) {
    this.logElem = getElement(logElemId);
    if (consoleElemId) {
      this.consoleElem = getElement(consoleElemId);
      this.consoleElem.addEventListener('keypress', (e) => {
        // The TypeScript compiler isn't smart enough to understand that
        // consoleElem is never null here.
        let elem = this.consoleElem as HTMLElement;
        if (e.keyCode == 13) {
          let cmd = elem.innerText.trim();
          if (cmd != '' && this.cmdHandler) {
            this.cmdHandler(cmd);
          }
          elem.innerHTML = '';
          e.preventDefault();
          return false;
        }
      });
    }
  }

  log(msg: string | HTMLElement, className='') {
    let child: HTMLElement;
    if (typeof msg == 'string') {
      if (msg == '') {
        msg = ' ';
      }
      child = document.createElement('div');
      child.innerText = msg;
      if (className != '') {
        child.className = className;
      }
    } else {
      child = msg as HTMLElement;
    }

    this.logElem.appendChild(child);
  }

  clear() {
    this.logElem.innerHTML = '';
  }

  scroll() {
    if (this.logElem.lastElementChild) {
      this.logElem.lastElementChild.scrollIntoView();
    }
  }

  onConsoleCmd(cmdHandler: CmdHandler) {
    this.cmdHandler = cmdHandler;
  }

  get hasFocus() {
    return this.consoleElem && document.activeElement == this.consoleElem;
  }

  blur() {
    if (this.consoleElem) {
      this.consoleElem.blur();
    }
  }
}

export {Log}
