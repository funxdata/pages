import type { paginationcfg, PaginationCallback } from "./type.ts";
import type { Tpl } from "@/types/tpls.ts";
import { pagination as paginationtpl } from "@funxdata/template/uicomps";

// deno-lint-ignore no-explicit-any
const TplToHtml = (globalThis as any)["TplToHtml"] as Tpl;

export const pagination = async (
  node: HTMLElement,
  cfg: paginationcfg,
  docallback: PaginationCallback
) => {
  // 内部状态用闭包变量保存，避免直接修改 cfg，且不破坏类型
  let _num = cfg.num;
  let _size = cfg.size;
  let _total = cfg.total;

  // 计算总页数
  const computeAmount = () => Math.max(1, Math.ceil(_total / _size));

  // 渲染模板，先用初始数据
  cfg.amount = computeAmount();
  node.innerHTML = await TplToHtml.renderString(paginationtpl, cfg);

  const frontBtn = node.querySelector('#pagination_front') as HTMLButtonElement;
  const behindBtn = node.querySelector('#pagination_behind') as HTMLButtonElement;
  const numInput = node.querySelector('#pagination_input') as HTMLInputElement;
  const totalEl = node.querySelector('#pagination_total') as HTMLElement;
  const amountEl = node.querySelector('#pagination_amount') as HTMLElement;

  // 控制按钮禁用状态
  const updateButtons = () => {
    frontBtn.classList.toggle('disabled', _num <= 1);
    behindBtn.classList.toggle('disabled', _num >= computeAmount());
  };

  // 是否正在同步更新，防止事件循环
  let isSyncing = false;

  // 触发回调和UI更新
  const triggerCallback = () => {
    cfg.amount = computeAmount();
    amountEl.innerText = String(cfg.amount);
    totalEl.innerText = String(_total);
    numInput.value = String(_num);
    updateButtons();
    docallback({
      ...cfg,
      num: _num,
      size: _size,
      total: _total,
      amount: cfg.amount,
    });
  };

  // 给 cfg 设置访问器，但内部用闭包变量存储，避免无限递归
  Object.defineProperty(cfg, 'num', {
    get: () => _num,
    set: (val: number) => {
      if (val === _num) return;
      _num = Math.min(Math.max(val, 1), computeAmount());
      if (!isSyncing) {
        isSyncing = true;
        triggerCallback();
        isSyncing = false;
      }
    }
  });

  Object.defineProperty(cfg, 'size', {
    get: () => _size,
    set: (val: number) => {
      if (val === _size) return;
      _size = val;
      if (!isSyncing) {
        isSyncing = true;
        triggerCallback();
        isSyncing = false;
      }
    }
  });

  Object.defineProperty(cfg, 'total', {
    get: () => _total,
    set: (val: number) => {
      if (val === _total) return;
      _total = val;
      _num = 1;
      if (!isSyncing) {
        isSyncing = true;
        triggerCallback();
        isSyncing = false;
      }
    }
  });

  // 事件绑定
  frontBtn.onclick = () => {
    if (_num > 1) {
      cfg.num = _num - 1;
    }
  };

  behindBtn.onclick = () => {
    const amount = computeAmount();
    if (_num < amount) {
      cfg.num = _num + 1;
    }
  };

  numInput.onchange = (evt) => {
    if (isSyncing) return;
    const value = Number((evt.target as HTMLInputElement).value);
    if (value > 0 && value <= computeAmount()) {
      cfg.num = value;
    } else {
      // 输入非法时恢复当前值
      isSyncing = true;
      numInput.value = String(_num);
      isSyncing = false;
    }
  };

  // 初始化调用
  triggerCallback();
};
