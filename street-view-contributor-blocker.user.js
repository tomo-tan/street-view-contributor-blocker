// ==UserScript==
// @name         Street View Contributor Blocker for Google Maps
// @name:ja      Googleマップ Street View 投稿者ブロッカー
// @namespace    https://github.com/
// @version      0.1.0
// @description  Block Street View and Photo Sphere imagery from selected Google Maps contributors.
// @description:ja Googleマップで指定した投稿者のストリートビュー／360度画像だけを非表示にします。
// @author       TOMO
// @license      MIT
// @match        https://www.google.com/maps/*
// @match        https://www.google.co.jp/maps/*
// @match        https://maps.google.com/maps/*
// @match        https://maps.google.co.jp/maps/*
// @run-at       document-start
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(() => {
  "use strict";

  const STORAGE_KEY = "streetViewContributorBlocker.blockedContributors.v1";
  const UI_ID = "svcb-root";
  const CHECK_INTERVAL_MS = 300;
  const isJapanese = /^ja\b/i.test(navigator.language || "");

  const t = isJapanese
    ? {
        app: "SV投稿者ブロッカー",
        block: "この投稿者をブロック",
        manage: "ブロックリストを管理",
        blocked: "ブロックしたため地図へ戻ります",
        add: "追加",
        remove: "解除",
        close: "閉じる",
        idPlaceholder: "投稿者ID またはプロフィールURL",
        namePlaceholder: "表示名（省略可）",
        empty: "ブロック中の投稿者はいません。",
        invalid: "投稿者IDまたはプロフィールURLを入力してください。",
        current: "現在の投稿者",
        official: "Google公式画像はブロックしません。",
        howto: "投稿画像を開いて「この投稿者をブロック」を押すか、ID／プロフィールURLを追加します。"
      }
    : {
        app: "SV Contributor Blocker",
        block: "Block this contributor",
        manage: "Manage blocklist",
        blocked: "Blocked contributor; returning to the map",
        add: "Add",
        remove: "Remove",
        close: "Close",
        idPlaceholder: "Contributor ID or profile URL",
        namePlaceholder: "Display name (optional)",
        empty: "No blocked contributors.",
        invalid: "Enter a contributor ID or profile URL.",
        current: "Current contributor",
        official: "Google-owned imagery is always allowed.",
        howto: "Open contributed imagery and choose “Block this contributor”, or add an ID/profile URL."
      };

  let handling = false;
  let currentContributor = null;

  function loadBlocked() {
    try {
      const value = typeof GM_getValue === "function"
        ? GM_getValue(STORAGE_KEY, [])
        : JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function saveBlocked(items) {
    const normalized = items
      .filter((item) => item && /^\d+$/.test(String(item.id || "")))
      .map((item) => ({ id: String(item.id), name: String(item.name || "").trim() }))
      .filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index);

    if (typeof GM_setValue === "function") {
      GM_setValue(STORAGE_KEY, normalized);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    }
    return normalized;
  }

  function contributorIdFrom(value) {
    const text = String(value || "").trim();
    const profileMatch = text.match(/\/maps\/contrib\/(\d+)/);
    if (profileMatch) return profileMatch[1];
    return /^\d+$/.test(text) ? text : null;
  }

  function detectContributor() {
    const links = Array.from(document.querySelectorAll('a[href*="/maps/contrib/"]'));
    for (const link of links) {
      const id = contributorIdFrom(link.getAttribute("href"));
      if (!id) continue;
      const name = (link.textContent || "").trim()
        || (document.querySelector("h1")?.textContent || "").trim()
        || document.title.split(/\s[-–—]\s/)[0].trim();
      return { id, name };
    }
    return null;
  }

  function isGoogleOwnedImagery() {
    return /!2e0(?:!|$)/.test(location.href)
      || location.href.includes("streetviewpixels-pa.googleapis.com");
  }

  function mapUrlAtCurrentLocation() {
    const match = location.pathname.match(/\/maps\/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    const authuser = new URLSearchParams(location.search).get("authuser");
    const query = `entry=ttu${authuser === null ? "" : `&authuser=${encodeURIComponent(authuser)}`}`;
    return match
      ? `https://${location.host}/maps/@${match[1]},${match[2]},18z?${query}`
      : `https://${location.host}/maps/?${query}`;
  }

  function addBlocked(contributor) {
    if (!contributor?.id) return;
    const items = loadBlocked();
    const existing = items.find((item) => item.id === contributor.id);
    if (existing) {
      existing.name = contributor.name || existing.name;
    } else {
      items.push({ id: contributor.id, name: contributor.name || "" });
    }
    saveBlocked(items);
    checkPage();
  }

  function removeBlocked(id) {
    saveBlocked(loadBlocked().filter((item) => item.id !== id));
    renderPanel();
  }

  function showToast(message) {
    let toast = document.getElementById("svcb-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "svcb-toast";
      document.documentElement.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.display = "block";
  }

  function ensureUi() {
    if (!document.documentElement || document.getElementById(UI_ID)) return;
    const root = document.createElement("div");
    root.id = UI_ID;
    root.innerHTML = `
      <style>
        #svcb-root, #svcb-root * { box-sizing: border-box; font-family: system-ui, sans-serif; }
        #svcb-launcher { position: fixed; left: 12px; bottom: 12px; z-index: 2147483645;
          border: 0; border-radius: 999px; padding: 9px 13px; background: #202124; color: #fff;
          box-shadow: 0 2px 9px #0005; font-size: 13px; cursor: pointer; }
        #svcb-current { position: fixed; left: 12px; bottom: 58px; z-index: 2147483645;
          border: 0; border-radius: 8px; padding: 9px 13px; background: #b3261e; color: #fff;
          box-shadow: 0 2px 9px #0005; font-size: 13px; cursor: pointer; display: none; }
        #svcb-toast { position: fixed; top: max(12px, env(safe-area-inset-top)); left: 50%;
          transform: translateX(-50%); z-index: 2147483647; padding: 10px 14px; border-radius: 8px;
          background: #202124f2; color: #fff; box-shadow: 0 2px 9px #0005; font-size: 14px;
          width: max-content; max-width: calc(100vw - 24px); display: none; }
        #svcb-overlay { position: fixed; inset: 0; z-index: 2147483646; background: #0008;
          display: none; align-items: center; justify-content: center; padding: 16px; }
        #svcb-panel { width: min(520px, 100%); max-height: min(680px, 90vh); overflow: auto;
          background: #fff; color: #202124; border-radius: 12px; padding: 18px; box-shadow: 0 8px 30px #0007; }
        #svcb-panel h2 { margin: 0 0 8px; font-size: 19px; }
        #svcb-panel p { margin: 7px 0; font-size: 13px; color: #5f6368; }
        .svcb-form { display: grid; grid-template-columns: 1fr; gap: 7px; margin: 14px 0; }
        .svcb-form input { width: 100%; padding: 9px; border: 1px solid #dadce0; border-radius: 6px; }
        .svcb-actions { display: flex; gap: 8px; justify-content: flex-end; }
        .svcb-actions button, .svcb-remove { border: 0; border-radius: 6px; padding: 8px 12px;
          cursor: pointer; background: #1a73e8; color: #fff; }
        .svcb-actions .secondary { background: #e8eaed; color: #202124; }
        #svcb-list { list-style: none; padding: 0; margin: 12px 0; }
        #svcb-list li { display: flex; gap: 8px; align-items: center; justify-content: space-between;
          padding: 9px 0; border-top: 1px solid #eee; font-size: 13px; }
        .svcb-id { color: #5f6368; font-family: ui-monospace, monospace; overflow-wrap: anywhere; }
        .svcb-remove { background: #fce8e6; color: #b3261e; flex: 0 0 auto; }
      </style>
      <button id="svcb-current" type="button"></button>
      <button id="svcb-launcher" type="button">${t.app}</button>
      <div id="svcb-overlay" role="dialog" aria-modal="true" aria-label="${t.manage}">
        <div id="svcb-panel">
          <h2>${t.manage}</h2>
          <p>${t.howto}</p><p>${t.official}</p>
          <div class="svcb-form">
            <input id="svcb-id-input" type="text" placeholder="${t.idPlaceholder}">
            <input id="svcb-name-input" type="text" placeholder="${t.namePlaceholder}">
          </div>
          <div class="svcb-actions">
            <button id="svcb-add" type="button">${t.add}</button>
            <button id="svcb-close" class="secondary" type="button">${t.close}</button>
          </div>
          <p id="svcb-error" style="color:#b3261e"></p>
          <ul id="svcb-list"></ul>
        </div>
      </div>`;
    document.documentElement.appendChild(root);

    root.querySelector("#svcb-launcher").addEventListener("click", openPanel);
    root.querySelector("#svcb-current").addEventListener("click", () => addBlocked(currentContributor));
    root.querySelector("#svcb-close").addEventListener("click", closePanel);
    root.querySelector("#svcb-overlay").addEventListener("click", (event) => {
      if (event.target.id === "svcb-overlay") closePanel();
    });
    root.querySelector("#svcb-add").addEventListener("click", () => {
      const idInput = root.querySelector("#svcb-id-input");
      const nameInput = root.querySelector("#svcb-name-input");
      const id = contributorIdFrom(idInput.value);
      if (!id) {
        root.querySelector("#svcb-error").textContent = t.invalid;
        return;
      }
      addBlocked({ id, name: nameInput.value.trim() });
      idInput.value = "";
      nameInput.value = "";
      root.querySelector("#svcb-error").textContent = "";
      renderPanel();
    });
  }

  function openPanel() {
    ensureUi();
    renderPanel();
    document.querySelector("#svcb-overlay").style.display = "flex";
  }

  function closePanel() {
    const overlay = document.querySelector("#svcb-overlay");
    if (overlay) overlay.style.display = "none";
  }

  function renderPanel() {
    const list = document.querySelector("#svcb-list");
    if (!list) return;
    list.replaceChildren();
    const items = loadBlocked();
    if (!items.length) {
      const empty = document.createElement("li");
      empty.textContent = t.empty;
      list.appendChild(empty);
      return;
    }
    for (const item of items) {
      const row = document.createElement("li");
      const label = document.createElement("span");
      label.innerHTML = `<strong></strong><br><span class="svcb-id"></span>`;
      label.querySelector("strong").textContent = item.name || item.id;
      label.querySelector(".svcb-id").textContent = item.id;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "svcb-remove";
      button.textContent = t.remove;
      button.addEventListener("click", () => removeBlocked(item.id));
      row.append(label, button);
      list.appendChild(row);
    }
  }

  function updateCurrentButton(contributor) {
    const button = document.querySelector("#svcb-current");
    if (!button) return;
    const isBlocked = contributor && loadBlocked().some((item) => item.id === contributor.id);
    button.style.display = contributor && !isBlocked && !isGoogleOwnedImagery() ? "block" : "none";
    if (contributor) button.textContent = `${t.block}: ${contributor.name || contributor.id}`;
  }

  function checkPage() {
    ensureUi();
    currentContributor = detectContributor();
    updateCurrentButton(currentContributor);

    if (handling || !currentContributor || isGoogleOwnedImagery()) return;
    const blocked = loadBlocked().some((item) => item.id === currentContributor.id);
    if (!blocked) return;

    handling = true;
    showToast(`${currentContributor.name || currentContributor.id}: ${t.blocked}`);
    window.setTimeout(() => location.replace(mapUrlAtCurrentLocation()), 150);
  }

  function start() {
    ensureUi();
    new MutationObserver(checkPage).observe(document.documentElement, { childList: true, subtree: true });
    checkPage();
    window.setInterval(checkPage, CHECK_INTERVAL_MS);
    if (typeof GM_registerMenuCommand === "function") {
      GM_registerMenuCommand(t.manage, openPanel);
      GM_registerMenuCommand(t.block, () => currentContributor && addBlocked(currentContributor));
    }
  }

  if (document.documentElement) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
})();
