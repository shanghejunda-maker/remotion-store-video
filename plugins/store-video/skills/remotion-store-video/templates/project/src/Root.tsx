import React from "react";
import { EnvTestComp } from "../effects/_env-test";
// @effects-imports（new_effect.sh 会在这一行上方插入 import）

/**
 * 所有视频在这里注册。新增视频：
 * 1. 新建 effects/<name>/index.tsx，导出一个包含 <Folder><Composition/></Folder> 的组件
 * 2. 在下面 import 并加入列表（new_effect.sh 会自动完成）
 */
export const RemotionRoot: React.FC = () => (
  <>
    {/* @effects-list */}
    <EnvTestComp />
  </>
);
