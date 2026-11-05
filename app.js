(function () {
  'use strict';

  /* 1. Interactive MacBook Notch Tabs & Shelf */
  const notchTabs = document.querySelectorAll('[data-notch-tab]');
  const notchPanes = {
    lyrics: document.getElementById('notch-pane-lyrics'),
    thermals: document.getElementById('notch-pane-thermals'),
    agents: document.getElementById('notch-pane-agents'),
    shelf: document.getElementById('notch-pane-shelf')
  };

  notchTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-notch-tab');
      notchTabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
      Object.keys(notchPanes).forEach((key) => {
        if (notchPanes[key]) {
          notchPanes[key].classList.toggle('is-active', key === target);
        }
      });
    });
  });

  const addShelfBtn = document.getElementById('btn-add-shelf-file');
  const shelfList = document.getElementById('shelf-chip-list');
  const sampleShelfFiles = ['DESIGN.md', 'pulse-mcp', 'metrics-dump.json'];
  let shelfIdx = 0;

  if (addShelfBtn && shelfList) {
    addShelfBtn.addEventListener('click', () => {
      const chip = document.createElement('span');
      chip.className = 'shelf-chip';
      chip.textContent = sampleShelfFiles[shelfIdx % sampleShelfFiles.length];
      shelfIdx += 1;
      shelfList.appendChild(chip);
    });
  }

  /* 2. Homebrew Cask Copy Buttons */
  function bindCopyButton(btnId, badgeId) {
    const btn = document.getElementById(btnId);
    const badge = document.getElementById(badgeId);
    if (!btn || !badge) return;
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-command') || 'brew install --cask kutuyazilim/tap/kutu-pulse';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(cmd).catch(() => {});
      }
      badge.textContent = 'Copied';
      setTimeout(() => {
        badge.textContent = 'Copy';
      }, 2000);
    });
  }
  bindCopyButton('copy-brew-btn', 'brew-copy-status');
  bindCopyButton('copy-brew-btn-footer', 'brew-copy-status-footer');

  /* 3. Signature Thermal Heat-Shift Scrubber & Threshold Agent Trigger */
  const thermalSlider = document.getElementById('thermal-load-slider');
  const presetChips = document.querySelectorAll('[data-temp-preset]');
  const healthBadge = document.getElementById('observatory-health-badge');
  const consoleTempWatt = document.getElementById('console-temp-watt');
  const consoleHottest = document.getElementById('console-hottest-core');
  const consoleRamSwap = document.getElementById('console-ram-swap');
  const menubarTempPill = document.getElementById('menubar-temp-pill');
  const notchCpuReadout = document.getElementById('notch-cpu-readout');
  const notchRamReadout = document.getElementById('notch-ram-readout');
  const notchAgentState = document.getElementById('notch-agent-state');
  const coreBarFills = document.querySelectorAll('#core-bars-container .core-bar-fill');

  const agentBox = document.getElementById('agent-trigger-box');
  const agentTitle = document.getElementById('agent-trigger-title');
  const agentState = document.getElementById('agent-trigger-state');
  const agentDesc = document.getElementById('agent-trigger-desc');
  const agentActionRow = document.getElementById('agent-action-row');
  const approveRemediationBtn = document.getElementById('btn-approve-remediation');

  const coreOffsets = [-6, 2, 9, -2, -9, -14, -18, -11];

  function applyThermalState(tempC) {
    const clamped = Math.max(38, Math.min(96, Number(tempC)));
    const normalized = (clamped - 38) / (96 - 38);
    document.documentElement.style.setProperty('--heat-mix', (0.08 + normalized * 0.88).toFixed(3));

    const watts = (8.2 + normalized * 34.6).toFixed(1);
    const hottest = Math.min(102, Math.round(clamped + 7));
    const ramPct = Math.min(96, Math.round(44 + normalized * 50));
    const swapGb = (0.2 + Math.pow(normalized, 2) * 15.4).toFixed(1);

    if (consoleTempWatt) consoleTempWatt.textContent = `${clamped}°C avg · ${watts}W`;
    if (consoleHottest) consoleHottest.textContent = `Hottest P3: ${hottest}°C`;
    if (consoleRamSwap) consoleRamSwap.textContent = `RAM ${ramPct}% · Swap ${swapGb} GB`;
    if (menubarTempPill) menubarTempPill.textContent = `${clamped}°C · ${watts}W`;
    if (notchCpuReadout) notchCpuReadout.textContent = `${clamped}°C · ${watts}W`;
    if (notchRamReadout) notchRamReadout.textContent = `${ramPct}% · ${swapGb} GB`;

    coreBarFills.forEach((bar, i) => {
      const coreTemp = Math.max(32, Math.min(100, clamped + coreOffsets[i % coreOffsets.length]));
      const pct = Math.max(20, Math.min(100, Math.round(((coreTemp - 30) / 70) * 100)));
      bar.style.height = `${pct}%`;
      if (coreTemp >= 82) {
        bar.style.backgroundColor = 'var(--status-coral)';
      } else if (coreTemp >= 68) {
        bar.style.backgroundColor = 'var(--status-honey)';
      } else {
        bar.style.backgroundColor = 'var(--status-jade)';
      }
    });

    if (clamped >= 80) {
      if (healthBadge) {
        healthBadge.textContent = `Threshold Tripped · ${clamped}°C / ${ramPct}% RAM`;
        healthBadge.className = 'status-badge is-alert';
      }
      if (agentBox) agentBox.classList.add('is-woken');
      if (agentTitle) agentTitle.textContent = 'Claude Agent Woken: RAM > 80% Threshold Held';
      if (agentState) agentState.textContent = `DIAGNOSING · ${ramPct}% RAM`;
      if (agentDesc) {
        agentDesc.textContent = `Agent inspected process tree and git worktrees: stuck "git-worktree-index" + 14 detached worktrees holding ${swapGb} GB swap. Ready for one-click remediation.`;
      }
      if (agentActionRow) agentActionRow.hidden = false;
      if (notchAgentState) notchAgentState.textContent = 'Active · Diagnosing';
    } else if (clamped >= 68) {
      if (healthBadge) {
        healthBadge.textContent = `Elevated Load · ${clamped}°C`;
        healthBadge.className = 'status-badge is-warning';
      }
      if (agentBox) agentBox.classList.remove('is-woken');
      if (agentTitle) agentTitle.textContent = 'Threshold Trigger Armed: RAM > 80% for 30s';
      if (agentState) agentState.textContent = `WATCHING · ${ramPct}% RAM`;
      if (agentDesc) {
        agentDesc.textContent = 'Sustained compile load detected. Push past 80°C to trip the RAM > 80% trigger and wake the diagnostic agent.';
      }
      if (agentActionRow) agentActionRow.hidden = true;
      if (notchAgentState) notchAgentState.textContent = 'Watching · 68°C+';
    } else {
      if (healthBadge) {
        healthBadge.textContent = `Simulated Live · ${clamped}°C Nominal`;
        healthBadge.className = 'status-badge';
      }
      if (agentBox) agentBox.classList.remove('is-woken');
      if (agentTitle) agentTitle.textContent = 'Threshold Trigger Armed: RAM > 80% for 30s';
      if (agentState) agentState.textContent = `STANDBY · ${ramPct}% RAM`;
      if (agentDesc) {
        agentDesc.textContent = 'Drag the thermal scrubber past 80°C (or click "Trip RAM > 80%") to watch the Kasi palette shift toward thermal amber and wake Pulse\'s diagnostic Claude agent.';
      }
      if (agentActionRow) agentActionRow.hidden = true;
      if (notchAgentState) notchAgentState.textContent = 'Idle · 03:00';
    }

    presetChips.forEach((chip) => {
      chip.classList.toggle('is-active', Number(chip.getAttribute('data-temp-preset')) === clamped);
    });
  }

  if (thermalSlider) {
    thermalSlider.addEventListener('input', (e) => {
      applyThermalState(e.target.value);
    });
  }

  presetChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const targetTemp = Number(chip.getAttribute('data-temp-preset'));
      if (thermalSlider) thermalSlider.value = String(targetTemp);
      applyThermalState(targetTemp);
    });
  });

  if (approveRemediationBtn) {
    approveRemediationBtn.addEventListener('click', () => {
      if (thermalSlider) thermalSlider.value = '48';
      applyThermalState(48);
      if (agentTitle) agentTitle.textContent = 'Remediation Executed: Freed 14.8 GB & Cooled to 48°C';
      if (agentDesc) {
        agentDesc.textContent = 'Terminated runaway index process and pruned detached worktrees. System thermals and swap returned to nominal baseline.';
      }
    });
  }

  /* 4. Process Hog Kill & T3 Code Thread Jump */
  const killHogBtn = document.getElementById('btn-kill-hog');
  const topHogLabel = document.getElementById('top-hog-label');
  if (killHogBtn && topHogLabel) {
    killHogBtn.addEventListener('click', () => {
      topHogLabel.textContent = 'git-worktree-index terminated (-4.8W)';
      killHogBtn.textContent = 'Killed';
      killHogBtn.disabled = true;
    });
  }

  const t3Buttons = document.querySelectorAll('[data-t3-thread]');
  const t3Feedback = document.getElementById('t3-open-feedback');
  t3Buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const thread = btn.getAttribute('data-t3-thread');
      if (t3Feedback) {
        t3Feedback.textContent = `Opening "${thread}" in T3 Code...`;
      }
    });
  });

  /* 5. Knowledge 2 Privacy Switch, Subviews, Canvas Constellation & Double Tap */
  const privacyBtns = document.querySelectorAll('[data-privacy-mode]');
  const privacyHeadline = document.getElementById('privacy-mode-headline');
  const privacyDetail = document.getElementById('privacy-mode-detail');

  privacyBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-privacy-mode');
      privacyBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      if (mode === 'local') {
        if (privacyHeadline) {
          privacyHeadline.textContent = 'Active Mode: This Mac Only (Apple On-Device / Ollama Gemma)';
        }
        if (privacyDetail) {
          privacyDetail.textContent = '100% local execution. Summarizes chats with per-chat checkpoint resume and writes Markdown pages directly to ~/Pulse Knowledge without network calls.';
        }
      } else {
        if (privacyHeadline) {
          privacyHeadline.textContent = 'Active Mode: Two-Tier Cloud Model (Local Summaries → Claude Vault Writer)';
        }
        if (privacyDetail) {
          privacyDetail.textContent = 'On-device model summarizes each chat locally first; Claude writes structured Markdown pages from those redacted summaries without ever seeing raw messages.';
        }
      }
    });
  });

  const k2Tabs = document.querySelectorAll('[data-k2-tab]');
  const k2Views = {
    graph: document.getElementById('k2-view-graph'),
    brief: document.getElementById('k2-view-brief'),
    doubletap: document.getElementById('k2-view-doubletap')
  };
  const graphSearchWrap = document.getElementById('graph-search-wrap');

  k2Tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-k2-tab');
      k2Tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
      Object.keys(k2Views).forEach((k) => {
        if (k2Views[k]) k2Views[k].classList.toggle('is-active', k === target);
      });
      if (graphSearchWrap) {
        graphSearchWrap.style.display = target === 'graph' ? 'flex' : 'none';
      }
    });
  });

  /* Night-Sky Constellation Graph Canvas */
  const canvas = document.getElementById('knowledge-graph-canvas');
  const searchInput = document.getElementById('graph-search-input');
  const vaultFilePath = document.getElementById('vault-file-path');
  const vaultNodeTitle = document.getElementById('vault-node-title');
  const vaultNodeSummary = document.getElementById('vault-node-summary');
  const vaultNodeLinks = document.getElementById('vault-node-links');
  const vaultNodeSources = document.getElementById('vault-node-sources');

  const graphNodes = [
    {
      id: 'pulse',
      label: 'Pulse 2.0',
      x: 370,
      y: 165,
      r: 11,
      color: '#ff9a5a',
      path: '~/Pulse Knowledge/projects/pulse-2-0.md',
      title: 'Pulse 2.0 (macOS Companion)',
      summary: 'Published v2.0.0 (Build 12) to Kutu-Yazilim/pulse-releases with edSignature Sparkle appcast and Homebrew tap kutuyazilim/tap/kutu-pulse.',
      links: 'Linked nodes: [[Utku]] · [[T3 Code]] · [[Kutu Yazılım]] · [[Brew Tap]]',
      sources: ['T3 Code: Pulse-tools2', 'Dev Folder: ~/Developer/KutuYazilim', 'WhatsApp Direct (90d)']
    },
    {
      id: 'utku',
      label: 'Utku',
      x: 215,
      y: 110,
      r: 10,
      color: '#ffd2b8',
      path: '~/Pulse Knowledge/people/utku.md',
      title: 'Utku — Founder & Systems Architect',
      summary: 'Maintains two active Claude subscriptions inside T3 Code, builds native macOS utilities at Kutu Yazılım, and runs nightly local Gemma vault synthesis at 03:00.',
      links: 'Linked nodes: [[Pulse 2.0]] · [[Kutu Yazılım]] · [[T3 Code]]',
      sources: ['Apple Mail', 'Calendar (-7d to +31d)', 'T3 Code Threads']
    },
    {
      id: 't3code',
      label: 'T3 Code',
      x: 525,
      y: 105,
      r: 9,
      color: '#6eb4f0',
      path: '~/Pulse Knowledge/tools/t3-code.md',
      title: 'T3 Code Workspace & Multi-Account Setup',
      summary: 'Primary AI engineering harness wired to Dual Claude logins, Codex, and Antigravity. Pulse deep-links recent project threads straight into T3 Code on click.',
      links: 'Linked nodes: [[Pulse 2.0]] · [[Utku]] · [[pulse-mcp]]',
      sources: ['~/.t3/userdata', 'T3 User Messages', 'Keychain OAuth']
    },
    {
      id: 'kutu',
      label: 'Kutu Yazılım',
      x: 190,
      y: 245,
      r: 9,
      color: '#5fc690',
      path: '~/Pulse Knowledge/orgs/kutu-yazilim.md',
      title: 'Kutu Yazılım — Release & Tap Infrastructure',
      summary: 'Hosts Kutu-Yazilim/pulse-releases and the kutuyazilim/tap Homebrew cask repository with automated EdDSA Sparkle signing.',
      links: 'Linked nodes: [[Pulse 2.0]] · [[Brew Tap]] · [[Utku]]',
      sources: ['GitHub Releases', 'Apple Mail', 'Reminders']
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp 90d',
      x: 560,
      y: 240,
      r: 8,
      color: '#ebb352',
      path: '~/Pulse Knowledge/sources/whatsapp-checkpoint.md',
      title: 'WhatsApp 90-Day Checkpoint Index',
      summary: 'Separates direct conversations from group noise over a rolling 90-day window. Checkpoints per chat so interrupted nightly runs resume cleanly.',
      links: 'Linked nodes: [[Pulse 2.0]] · [[Brief Cards]]',
      sources: ['WhatsApp Local DB', 'On-Device Summarizer']
    },
    {
      id: 'brewtap',
      label: 'Brew Tap',
      x: 380,
      y: 280,
      r: 8,
      color: '#c9a7f5',
      path: '~/Pulse Knowledge/ops/homebrew-tap.md',
      title: 'Homebrew Cask: kutuyazilim/tap/kutu-pulse',
      summary: 'Delivers one-command CLI installation and upgrades for Pulse 2.0.0 alongside Sparkle in-app updates.',
      links: 'Linked nodes: [[Pulse 2.0]] · [[Kutu Yazılım]]',
      sources: ['~/Developer/KutuYazilim', 'T3 Code: pulse-releases']
    }
  ];

  const graphEdges = [
    ['pulse', 'utku'],
    ['pulse', 't3code'],
    ['pulse', 'kutu'],
    ['pulse', 'whatsapp'],
    ['pulse', 'brewtap'],
    ['utku', 'kutu'],
    ['utku', 't3code'],
    ['kutu', 'brewtap']
  ];

  let selectedNodeId = 'pulse';
  let filterQuery = '';

  function drawKnowledgeGraph() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Subtle starfield dots */
    const stars = [
      [48, 42], [120, 68], [290, 40], [440, 52], [670, 60],
      [85, 190], [310, 215], [640, 175], [710, 285], [140, 305]
    ];
    ctx.fillStyle = 'rgba(255, 210, 184, 0.25)';
    stars.forEach(([sx, sy]) => {
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    });

    /* Edges */
    ctx.lineWidth = 1.25;
    graphEdges.forEach(([aId, bId]) => {
      const a = graphNodes.find((n) => n.id === aId);
      const b = graphNodes.find((n) => n.id === bId);
      if (!a || !b) return;
      const isHighlighted = a.id === selectedNodeId || b.id === selectedNodeId;
      ctx.strokeStyle = isHighlighted ? 'rgba(255, 154, 90, 0.72)' : 'rgba(255, 210, 184, 0.22)';
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });

    /* Nodes */
    graphNodes.forEach((node) => {
      const matches = !filterQuery || node.label.toLowerCase().includes(filterQuery);
      const alpha = matches ? 1 : 0.22;
      const isSelected = node.id === selectedNodeId;

      ctx.save();
      ctx.globalAlpha = alpha;

      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r + 7, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 154, 90, 0.25)';
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();
      ctx.lineWidth = isSelected ? 2.5 : 1.2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      ctx.font = '600 13px "Schibsted Grotesk", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, node.x, node.y + node.r + 18);
      ctx.restore();
    });
  }

  function selectVaultNode(node) {
    selectedNodeId = node.id;
    if (vaultFilePath) vaultFilePath.textContent = node.path;
    if (vaultNodeTitle) vaultNodeTitle.textContent = node.title;
    if (vaultNodeSummary) vaultNodeSummary.textContent = node.summary;
    if (vaultNodeLinks) vaultNodeLinks.textContent = node.links;
    if (vaultNodeSources) {
      vaultNodeSources.innerHTML = '';
      node.sources.forEach((src) => {
        const span = document.createElement('span');
        span.className = 'source-chip';
        span.textContent = src;
        vaultNodeSources.appendChild(span);
      });
    }
    drawKnowledgeGraph();
  }

  if (canvas) {
    drawKnowledgeGraph();
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const cx = (e.clientX - rect.left) * scaleX;
      const cy = (e.clientY - rect.top) * scaleY;

      const hit = graphNodes.find((n) => Math.hypot(n.x - cx, n.y - cy) <= n.r + 14);
      if (hit) selectVaultNode(hit);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterQuery = e.target.value.trim().toLowerCase();
      const match = graphNodes.find((n) => n.label.toLowerCase().includes(filterQuery));
      if (filterQuery && match) {
        selectVaultNode(match);
      } else {
        drawKnowledgeGraph();
      }
    });
  }

  /* Double Tap (Right Cmd ×2) Simulator */
  const doubleTapArea = document.getElementById('double-tap-textarea');
  const triggerDoubleTapBtn = document.getElementById('btn-trigger-double-tap');
  const resetDoubleTapBtn = document.getElementById('btn-reset-double-tap');
  const initialPromptText = 'Hey! Did we already sign the Sparkle appcast for Pulse 2.0 and update the Homebrew cask?';
  const draftedReplyText =
    'Hey! Did we already sign the Sparkle appcast for Pulse 2.0 and update the Homebrew cask?\n\n— Drafted by Pulse Double Tap (Right Cmd ×2):\nYes, v2.0.0 (Build 12) is signed with our EdDSA key in appcast.xml and live on kutuyazilim/tap/kutu-pulse.';

  if (triggerDoubleTapBtn && doubleTapArea) {
    triggerDoubleTapBtn.addEventListener('click', () => {
      doubleTapArea.value = draftedReplyText;
    });
  }
  if (resetDoubleTapBtn && doubleTapArea) {
    resetDoubleTapBtn.addEventListener('click', () => {
      doubleTapArea.value = initialPromptText;
    });
  }

  /* 6. Interactive Disk Block Map & Cleaner */
  const diskBlocks = document.querySelectorAll('.disk-block');
  const reclaimReadout = document.getElementById('reclaim-total-readout');
  const reclaimStatusCopy = document.getElementById('reclaim-status-copy');
  const runCleanerBtn = document.getElementById('btn-run-cleaner');
  const resetCleanerBtn = document.getElementById('btn-reset-cleaner');

  function updateDiskTotal() {
    let sum = 0;
    let activeCount = 0;
    diskBlocks.forEach((blk) => {
      if (!blk.classList.contains('is-cleaned')) {
        sum += Number(blk.getAttribute('data-disk-gb') || 0);
        activeCount += 1;
      }
    });
    if (reclaimReadout) reclaimReadout.textContent = `${sum.toFixed(1)} GB`;
    if (reclaimStatusCopy) {
      reclaimStatusCopy.textContent =
        activeCount > 0
          ? `${activeCount} developer categories staged. Active working trees and uncommitted changes are automatically protected.`
          : 'All selected developer caches and orphaned worktrees reclaimed. 52.0 GB freed on Macintosh HD.';
    }
  }

  diskBlocks.forEach((blk) => {
    blk.addEventListener('click', () => {
      blk.classList.toggle('is-cleaned');
      updateDiskTotal();
    });
  });

  if (runCleanerBtn) {
    runCleanerBtn.addEventListener('click', () => {
      diskBlocks.forEach((blk) => blk.classList.add('is-cleaned'));
      updateDiskTotal();
    });
  }

  if (resetCleanerBtn) {
    resetCleanerBtn.addEventListener('click', () => {
      diskBlocks.forEach((blk) => blk.classList.remove('is-cleaned'));
      updateDiskTotal();
    });
  }

  /* 7. 20+ Tools Specification Roster Filter */
  const toolFilterBtns = document.querySelectorAll('[data-tool-filter]');
  const toolRows = document.querySelectorAll('#tools-table-body tr');

  toolFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-tool-filter');
      toolFilterBtns.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      toolRows.forEach((row) => {
        const rowCat = row.getAttribute('data-tool-cat');
        row.hidden = !(cat === 'all' || (cat === 'featured' && (rowCat === 'dev' || rowCat === 'media')) || rowCat === cat);
      });
    });
  });
})();
