const fs = require("fs");
const { createAudioData } = require("wavefile");

const live2d = require("./lib/live2d.js");

import { CubismModelSettingJson, CubismModel } from "@cubism/model";

// 读取 WAV 文件
const audioBuffer = fs.readFileSync("audio.wav");
const audioData = createAudioData(audioBuffer);

// 获取音频电平
function getAudioLevel(audioData) {
  let sum = 0;
  for (
    let i = 0;
    i < audioData.data.length;
    i += audioData.format.numChannels
  ) {
    for (let j = 0; j < audioData.format.numChannels; j++) {
      sum += Math.abs(audioData.data[i + j]);
    }
  }
  return sum / (audioData.data.length / audioData.format.numChannels);
}

const lipSyncParams = [];

for (let i = 0; i < _modelSetting.getLipSyncParameterCount(); ++i) {
  lipSyncParams.push(_modelSetting.getLipSyncParameterId(i));
}

function updateLipSync() {
  const audioLevel = getAudioLevel(audioData);

  lipSyncParams.forEach((paramId) => {
    _model.setParameterValue(paramId, audioLevel, 0.8);
  });
}

setInterval(updateLipSync, 16.67);
