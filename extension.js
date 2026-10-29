const vscode = require('vscode');

const STATE_KEY = 'clawdPet.state';

class ClawdViewProvider {
  constructor(context) {
    this.context = context;
    this.view = null;
    this.ready = false;
    this.queue = [];
  }

  resolveWebviewView(view) {
    this.view = view;
    this.ready = false;
    const mediaUri = vscode.Uri.joinPath(this.context.extensionUri, 'media');
    view.webview.options = { enableScripts: true, localResourceRoots: [mediaUri] };
    view.webview.html = this.getHtml(view.webview, mediaUri);

    view.webview.onDidReceiveMessage((msg) => {
      switch (msg.type) {
        case 'ready':
          this.ready = true;
          view.webview.postMessage({
            type: 'init',
            state: this.context.globalState.get(STATE_KEY),
            config: readConfig(),
          });
          this.queue.splice(0).forEach((m) => view.webview.postMessage(m));
          break;
        case 'save':
          this.context.globalState.update(STATE_KEY, msg.state);
          break;
        case 'spawnRequest':
          vscode.commands.executeCommand('clawdPet.spawn');
          break;
        case 'removeRequest':
          pickPetToRemove(msg.pets, msg.selected).then((id) => {
            if (id != null) this.post({ type: 'action', action: 'remove', id });
          });
          break;
      }
    });

    view.onDidDispose(() => {
      this.view = null;
      this.ready = false;
    });
  }

  post(msg) {
    if (this.view && this.ready) {
      this.view.webview.postMessage(msg);
    } else {
      this.queue.push(msg);
    }
  }

  getHtml(webview, mediaUri) {
    const nonce = makeNonce();
    const script = webview.asWebviewUri(vscode.Uri.joinPath(mediaUri, 'pet.js'));
    const style = webview.asWebviewUri(vscode.Uri.joinPath(mediaUri, 'pet.css'));
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; img-src ${webview.cspSource} data:; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${style}" rel="stylesheet">
  <title>Clawd</title>
</head>
<body>
  <div id="hud">
    <div id="stats"></div>
    <div id="toolbar">
      <button data-action="feed" title="Dar una galleta">🍪</button>
      <button data-action="play" title="Lanzar la pelota (o haz clic en el suelo)">⚽</button>
      <button data-action="sleep" title="Dormir">💤</button>
      <button data-action="code" title="Programar">💻</button>
      <button data-action="dance" title="Bailar">🎵</button>
      <button data-action="wave" title="Saludar">👋</button>
      <button data-action="special" title="Animación especial (cada mascota hace la suya)">✨</button>
      <button data-action="social" title="Jugar juntos">🤝</button>
      <button data-action="spawn" title="Invocar un compañero">➕</button>
      <button data-action="remove" title="Despedir a una mascota">🗑️</button>
    </div>
  </div>
  <canvas id="stage"></canvas>
  <script nonce="${nonce}" src="${script}"></script>
</body>
</html>`;
  }
}

function readConfig() {
  const c = vscode.workspace.getConfiguration('clawdPet');
  return {
    size: c.get('size', 'medium'),
    background: c.get('background', 'none'),
    showToolbar: c.get('showToolbar', true),
    speechBubbles: c.get('speechBubbles', true),
  };
}

const SPECIES_ICONS = { clawd: '🦀', miku: '🎤', teto: '🥖', goldship: '⚓', tachyon: '🧪', defoko: '🍙', megumin: '💥' };

async function pickPetToRemove(pets, selectedId) {
  if (!pets.length) {
    vscode.window.showInformationMessage('No hay mascotas. Invoca una con ➕');
    return null;
  }
  const items = pets.map((p) => ({
    label: `${SPECIES_ICONS[p.species] || '🐾'} ${p.name}`,
    description: p.id === selectedId ? 'seleccionada' : '',
    id: p.id,
  }));
  if (pets.length > 1) items.push({ label: '🗑️ Despedir a todas', id: 'all' });
  const pick = await vscode.window.showQuickPick(items, { placeHolder: '¿A qué mascota quieres despedir?' });
  return pick ? pick.id : null;
}

function makeNonce() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < 32; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
  return s;
}

function countErrors() {
  let n = 0;
  for (const [, diags] of vscode.languages.getDiagnostics()) {
    for (const d of diags) if (d.severity === vscode.DiagnosticSeverity.Error) n++;
  }
  return n;
}

function activate(context) {
  const provider = new ClawdViewProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('clawdPet.view', provider, {
      webviewOptions: { retainContextWhenHidden: true },
    })
  );

  async function reveal() {
    if (provider.view) {
      provider.view.show(true);
    } else {
      await vscode.commands.executeCommand('clawdPet.view.focus');
    }
  }

  const sendAction = (action, extra = {}) => async () => {
    await reveal();
    provider.post({ type: 'action', action, ...extra });
  };

  for (const action of ['feed', 'play', 'sleep', 'code', 'dance', 'wave', 'special', 'social', 'remove']) {
    context.subscriptions.push(vscode.commands.registerCommand(`clawdPet.${action}`, sendAction(action)));
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('clawdPet.spawn', async () => {
      const characters = [
        { label: '🦀 Clawd', description: 'la mascota de Claude Code', value: 'clawd' },
        { label: '🎤 Hatsune Miku', description: 'canta y gira su puerro', value: 'miku' },
        { label: '🥖 Kasane Teto', description: 'canta y come baguette', value: 'teto' },
        { label: '⚓ Gold Ship', description: 'corre, vende yakisoba y reparte dropkicks', value: 'goldship', name: 'Gold Ship' },
        { label: '🧪 Agnes Tachyon', description: 'prepara pócimas y experimenta con los demás', value: 'tachyon', name: 'Tachyon' },
        { label: '🍙 Defoko (Uta Utane)', description: 'la voz por defecto de UTAU: canta "あ"', value: 'defoko', name: 'Defoko' },
        { label: '💥 Megumin', description: 'archimaga carmesí: ¡EXPLOSIÓN!', value: 'megumin', name: 'Megumin' },
      ];
      const character = await vscode.window.showQuickPick(characters, { placeHolder: '¿A quién quieres invocar?' });
      if (!character) return;
      if (character.value !== 'clawd') {
        const placeHolder = character.name || (character.value === 'miku' ? 'Miku' : 'Teto');
        const name = await vscode.window.showInputBox({ prompt: 'Nombre (opcional)', placeHolder });
        if (name === undefined) return;
        await sendAction('spawn', { species: character.value, name: name.trim() || undefined })();
        return;
      }

      const colors = [
        { label: '🟠 Naranja', description: 'el clásico', value: 'orange' },
        { label: '🔵 Azul', value: 'blue' },
        { label: '🟢 Verde', value: 'green' },
        { label: '🩷 Rosa', value: 'pink' },
        { label: '🟣 Morado', value: 'purple' },
        { label: '🟡 Dorado', value: 'gold' },
        { label: '⚪ Fantasma', value: 'ghost' },
        { label: '⚫ Negro', description: 'ojos amarillos', value: 'black' },
      ];
      const color = await vscode.window.showQuickPick(colors, { placeHolder: 'Elige el color de tu nuevo Clawd' });
      if (!color) return;
      const name = await vscode.window.showInputBox({ prompt: 'Nombre del nuevo Clawd (opcional)', placeHolder: 'Clawd' });
      if (name === undefined) return;
      await sendAction('spawn', { species: 'clawd', color: color.value, name: name.trim() || undefined })();
    }),

    vscode.commands.registerCommand('clawdPet.background', async () => {
      const options = [
        { label: 'Sin fondo', value: 'none' },
        { label: '🌙 Noche estrellada', value: 'night' },
        { label: '🏖️ Playa', value: 'beach' },
        { label: '🌿 Pradera', value: 'grass' },
        { label: '⌨️ Terminal', value: 'terminal' },
      ];
      const pick = await vscode.window.showQuickPick(options, { placeHolder: 'Elige un fondo para Clawd' });
      if (pick) {
        await vscode.workspace
          .getConfiguration('clawdPet')
          .update('background', pick.value, vscode.ConfigurationTarget.Global);
      }
    }),

    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('clawdPet')) provider.post({ type: 'config', config: readConfig() });
    })
  );

  // Reacciones al editor
  const reacts = () => vscode.workspace.getConfiguration('clawdPet').get('reactToEditor', true);
  const sendEvent = (event) => {
    if (reacts() && provider.view && provider.ready) provider.view.webview.postMessage({ type: 'event', event });
  };

  let lastSave = 0;
  let lastTyping = 0;
  let lastErrors = countErrors();
  let diagTimer = null;

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(() => {
      const now = Date.now();
      if (now - lastSave > 4000) {
        lastSave = now;
        sendEvent('save');
      }
    }),

    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.scheme !== 'file' || e.contentChanges.length === 0) return;
      const now = Date.now();
      if (now - lastTyping > 45000) {
        lastTyping = now;
        sendEvent('typing');
      }
    }),

    vscode.languages.onDidChangeDiagnostics(() => {
      clearTimeout(diagTimer);
      diagTimer = setTimeout(() => {
        const n = countErrors();
        if (n > lastErrors) sendEvent('error');
        else if (lastErrors > 0 && n === 0) sendEvent('fixed');
        lastErrors = n;
      }, 1500);
    }),

    { dispose: () => clearTimeout(diagTimer) }
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
