/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismIdHandle } from "@framework/id/cubismid";
import { CubismFramework } from "@framework/live2dcubismframework";
import { live2d_view, LAppDelegate } from "./lappdelegate";
import { LAppPal } from "./lapppal";

function getElementTop(element) {
  let actualTop = element.offsetTop;
  let current = element.offsetParent;
  while (current !== null) {
    actualTop += current.offsetTop;
    current = current.offsetParent;
  }
  return actualTop;
}

function getElementLeft(element) {
  let actualLeft = element.offsetLeft;
  let current = element.offsetParent;
  while (current !== null) {
    actualLeft += current.offsetLeft;
    current = current.offsetParent;
  }
  return actualLeft;
}

export class Parameters {
  public id: string;
  public minimumValue: number;
  public maximumValue: number;
  public defaultValue: number;
  public value: number;
  public keyCount: number;
  public keyValue: Float32Array;
}

export class Parts {
  public count: number;
  public ids: string;
  public opacities: number;
  public parentIndices: number;
}

export class ResetExpression {
  constructor() {
    this.enable = true;
    this.time = 5000;
    this.run = false;
    this.name = null;
  }
  public enable: boolean;
  public run: boolean;
  public time: number;
  public name: string;
}

export class Live2dAPI {
  public delegate: LAppDelegate;
  public path: string;
  public resetExpression: ResetExpression;
  public view: HTMLCanvasElement;

  move;
  down;

  constructor() {
    const api = this;
    this.delegate = new LAppDelegate(this);
    this.resetExpression = new ResetExpression();
    this.move = function (a: MouseEvent) {
      api.touchMoved(a.x, a.y);
    };
    this.down = function (a: MouseEvent) {
      api.touchEnded(a.x, a.y);
    };
  }

  public init(width: number, height: number) {
    if (this.delegate.initialize(width, height) == false) {
      return false;
    }
    this.view = live2d_view;
    const liveapi = this;
    this.view.onresize = function () {
      liveapi.delegate.onResize(liveapi.view.width, liveapi.view.height);
    };
    live2d_view.style.position = "fixed";
    live2d_view.style.right = "0px";
    live2d_view.style.bottom = "0px";
    return true;
  }

  public run() {
    this.delegate.run();
  }

  public close() {
    this.delegate.release();
  }

  public scale(size: number) {
    this.delegate._manager._scale = size;
  }

  public setX(x: number) {
    this.delegate._manager._x = x;
  }

  public setY(y: number) {
    this.delegate._manager._y = y;
  }

  public setXY(x: number, y: number) {
    this.delegate._manager._x = x;
    this.delegate._manager._y = y;
  }

  public resize(width: number, height: number) {
    this.delegate.onResize(width, height);
  }

  public setMotionRandom(open: boolean) {
    const model = this.delegate._manager._model;
    if (model) {
      model._motionRandom = open;
      return true;
    }
    return false;
  }

  public setParameter(id: string, value: number) {
    const model = this.delegate._manager._model;
    if (model == null) return null;
    const model1 = model.getModel();
    model1.setParameterValueById(this.getID(id), value);
  }

  public getParameters() {
    const model = this.delegate._manager._model;
    if (model == null) return null;
    const model1 = model.getModel();
    const list = [];
    const list1 = model1.getModel().parameters;

    for (let a = 0; a < list1.count; a++) {
      const item = new Parameters();
      item.id = list1.ids[a];
      item.defaultValue = list1.defaultValues[a];
      item.keyCount = list1.keyCounts[a];
      item.keyValue = list1.keyValues[a];
      item.maximumValue = list1.maximumValues[a];
      item.minimumValue = list1.minimumValues[a];
      item.value = list1.values[a];
      list[a] = item;
    }
    return list;
  }

  public setPart(id: string, value: number) {
    const model = this.delegate._manager._model;
    if (model == null) return null;
    const model1 = model.getModel();
    model1.setPartOpacityById(this.getID(id), value);
  }

  public getParts() {
    const model = this.delegate._manager._model;
    if (model == null) return null;
    const model1 = model.getModel();
    const list = [];
    const list1 = model1.getModel().parts;

    for (let a = 0; a < list1.count; a++) {
      const item = new Parts();
      item.count = list1.count[a];
      item.ids = list1.ids[a];
      item.opacities = list1.opacities[a];
      item.parentIndices = list1.parentIndices[a];
      list[a] = item;
    }
    return list;
  }

  public setBreathName(name: string) {
    const id = this.getID(name);
    this.delegate._manager._model._idParamBreath = id;
  }

  public initModel() {
    this.delegate._manager.initModel();
  }

  public changeModel(name: string, path: string) {
    if (path == null) {
      if (this.path == null) {
        return false;
      }
      this.delegate.getManager().loadModel(name, this.path);
    } else {
      this.path = path;
      this.delegate.getManager().loadModel(name, path);
    }
    const liveapi = this;
    const timer = setTimeout(function () {
      const list = liveapi.getExpressions();
      if (list == null) {
        LAppPal.printMessage(`[APP]no expression`);
        return;
      }
      list.forEach((item) => {
        if (item.name.toLowerCase() == "normal")
          liveapi.resetExpression.name = item[0].name;
      });
      if (!liveapi.resetExpression.name) {
        LAppPal.printMessage(`[APP]no found default expression, set 0`);
        liveapi.resetExpression.name = list[0].name;
      }
      clearInterval(timer);
    }, 200);
    return true;
  }

  public getID(id: string) {
    return CubismFramework.getIdManager().getId(id);
  }

  public useCustomScale(open: boolean) {
    this.delegate._manager._my_scale = open;
  }

  public fixPos(x: number, y: number) {
    const width = live2d_view.width;
    const height = live2d_view.height;
    const posX = getElementLeft(live2d_view);
    const posY = getElementTop(live2d_view);
    const fixX = posX + width;
    const fixY = posY + height;
    const width1 = window.innerWidth;
    const height1 = window.innerHeight;

    const range = 50;

    if (x < posX) {
      x = -(((posX - x) / posX) * range);
    } else if (x >= posX && x <= fixX) {
      x = x - posX;
    } else {
      x = width + ((x - fixX) / (width1 - fixX)) * range;
    }

    if (y < posY) {
      y = -(((posY - y) / posY) * range);
    } else if (y >= posY && x <= fixY) {
      y = y - posY;
    } else {
      y = height + ((y - fixY) / (height1 - fixY)) * range;
    }

    return [x, y];
  }

  public touchesBegan(x: number, y: number) {
    const view = this.delegate.getView();
    if (view == null) {
      return false;
    }
    [x, y] = this.fixPos(x, y);

    view.onTouchesBegan(x, y);
    return true;
  }

  public touchMoved(x: number, y: number) {
    const view = this.delegate.getView();
    if (view == null) {
      return false;
    }
    [x, y] = this.fixPos(x, y);

    view.onTouchesMoved(x, y);
    return true;
  }

  public touchEnded(x: number, y: number) {
    const view = this.delegate.getView();
    if (view == null) {
      return false;
    }
    [x, y] = this.fixPos(x, y);

    view.onTouchesEnded(x, y);
    return true;
  }

  public setOnTap(fun) {
    this.delegate._manager.setOnTap(fun);
  }

  public addListener() {
    addEventListener("mousemove", this.move);
    addEventListener("mousedown", this.down);
  }

  public removeListener() {
    removeEventListener("mousemove", this.move);
    removeEventListener("mousedown", this.down);
  }

  public getMotions() {
    const model = this.delegate.getManager().getModel();
    if (model == null) {
      return null;
    }

    const set = model.getModelSetting();
    if (set == null) return null;
    const count1 = set.getMotionGroupCount();
    if (count1 == 0) return null;
    const list = [];
    for (let a = 0; a < count1; a++) {
      const list1 = [];
      const item = set.getMotionGroupName(a);
      const count2 = set.getMotionCount(item);
      for (let b = 0; b < count2; b++) {
        const item1 = set.getMotionFileName(item, b);
        list1[b] = item1;
      }
      list[item] = list1;
    }

    return list;
  }

  public getExpressions() {
    const model = this.delegate.getManager().getModel();
    if (model == null) {
      return null;
    }

    const set = model.getModelSetting();
    if (set == null) return null;
    const count1 = set.getExpressionCount();
    if (count1 == 0) return null;
    const list = [];
    for (let a = 0; a < count1; a++) {
      const item = set.getExpressionName(a);
      const item1 = set.getExpressionFileName(a);
      list[a] = {
        name: item,
        file: item1,
      };
    }
    return list;
  }

  public startMotion(group: string, no: number, priority: number) {
    const model = this.delegate.getManager().getModel();
    if (model == null) {
      return false;
    }

    model.startMotion(group, no, priority);
    return true;
  }

  public startExpression(name: string) {
    const model = this.delegate.getManager().getModel();
    if (model == null) {
      return false;
    }
    model.setExpression(name);
    return true;
  }

  public tickResetExpression() {
    if (this.resetExpression.run == true) return;
    const model = this.delegate.getManager().getModel();
    if (model != null) {
      if (
        this.resetExpression.enable == true &&
        this.resetExpression.name != null
      ) {
        this.resetExpression.run = true;
        const liveapi = this;
        const timer = setTimeout(function () {
          LAppPal.printMessage(
            `[APP]expression reset ${liveapi.resetExpression.name}`
          );
          model.setExpression(liveapi.resetExpression.name);
          this.resetExpression.run = false;
          clearInterval(timer);
        }, this.resetExpression.time);
      }
    }
  }
}

console.log("live2dAPI init");
window["live2d"] = {
  new: function () {
    return new Live2dAPI();
  },
};
