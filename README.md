# Clawd Pet 🦀

Una mascota virtual para VS Code inspirada en **Clawd**, la mascota de Claude Code. Vive en una
ventanita del Explorador, camina, duerme, come, programa, baila, juega a la pelota y reacciona a lo
que haces en el editor.

## Cómo jugar

- **Clic sobre Clawd**: lo acaricias (corazones ❤️).
- **Arrastrar a Clawd**: lo levantas y, al soltarlo, lo lanzas por los aires.
- **Clic en el suelo**: lanzas una pelota ⚽ y la persigue.
- **Botones** (arriba de la ventana o en la barra del panel):
  🍪 comer · ⚽ jugar · 💤 dormir · 💻 programar · 🎵 bailar · 👋 saludar ·
  ✨ animación especial · 🤝 jugar juntos · ➕ invocar compañero · 🗑️ despedir a una mascota
  (o a todas; eliges de una lista)

  Con ✨ cada mascota hace lo suyo: Gold Ship corre, Tachyon prepara pócimas, Megumin lanza
  ¡EXPLOSIÓN!, Mudkip usa Pistola Agua, las cantantes cantan y Clawd baila.

### Compañeros

Con ➕ puedes invocar a otro **Clawd** (8 colores), a **Hatsune Miku** 🎤, a **Kasane Teto** 🥖, a
**Defoko** (Uta Utane, la voz por defecto de UTAU) 🍙, a las umamusume **Gold Ship** ⚓ y
**Agnes Tachyon** 🧪 (con orejas y cola de caballo), a **Megumin** 💥 (KonoSuba) o a **Mudkip** 💧.
Todas cantan (Miku gira su puerro, Teto su baguette, Gold Ship usa micrófono, Defoko su auricular y Tachyon su
frasco; Defoko suelta "あ" en vez de notas), y cada uno come lo suyo: 🍪 galletas, 🥬 puerros,
🥖 baguettes, 🍙 onigiri, 🍜 yakisoba y 🥕 zanahorias.

- **Gold Ship** a veces cruza la pantalla corriendo a toda velocidad 💨.
- **Agnes Tachyon** a veces se sienta a preparar pócimas (que salen bien... o explotan 💥).
- **Megumin** recita su conjuro y lanza **¡EXPLOSIÓN!** (las mascotas cercanas salen volando); luego
  se desmaya sin maná un rato. Come 🧪 pociones de maná.
- **Mudkip** lanza **Pistola Agua** 💦 hacia delante y moja a quien esté enfrente. Come 🫐 bayas Aranja.

Cuando hay dos o más, juegan entre ellos por su cuenta (o al pulsar 🤝):

| Interacción      | Qué pasa                                                          |
| ---------------- | ----------------------------------------------------------------- |
| Conversación     | Diálogos propios para cada pareja (Clawd y Miku, Teto y Miku...)  |
| Choca esos cinco | Saltan juntos y chocan las manos                                  |
| Abrazo           | Corazones y mejillas sonrojadas                                   |
| Pillarse         | Uno persigue al otro; al pillarlo cambian los papeles             |
| Paseo            | Miku o Teto se suben al lomo de Clawd y dan una vuelta            |
| Concierto        | Las cantantes cantan al centro y los demás bailan alrededor       |
| Dropkick         | Gold Ship toma carrerilla y manda a volar a su compañero 🦵       |
| Experimento      | Tachyon le da una pócima a otro, que brilla en arcoíris un rato   |

Cada mascota tiene **comida**, **energía** y **felicidad**. Si tiene sueño se dormirá solo, si tiene
hambre te lo dirá. El estado se guarda entre sesiones.

### Reacciones al editor

| Lo que haces              | Lo que hace Clawd                 |
| ------------------------- | --------------------------------- |
| Guardas un archivo        | Salta de alegría                  |
| Aparece un error nuevo    | Se pone a pensar 🤔               |
| Quedan 0 errores          | Todos bailan 🎉                   |
| Escribes código           | Saca su laptop y programa contigo |

## Comandos (Ctrl+Shift+P → "Clawd")

Dar una galleta, Lanzar la pelota, Invocar compañero, Mandar a dormir, Ponerse a programar,
Bailar, Saludar, Animación especial, Despedir a una mascota, Cambiar fondo.

## Configuración

| Opción                    | Valores                                           |
| ------------------------- | ------------------------------------------------- |
| `clawdPet.size`           | `small`, `medium`, `large`                        |
| `clawdPet.background`     | `none`, `night`, `beach`, `grass`, `terminal`     |
| `clawdPet.showToolbar`    | mostrar barra de estado y botones                 |
| `clawdPet.speechBubbles`  | globos de texto                                   |
| `clawdPet.reactToEditor`  | reaccionar a guardados, errores y escritura       |

> La ventana "Clawd" aparece en el Explorador. Puedes arrastrarla a otro lugar (por ejemplo al panel
> inferior o a la barra lateral secundaria) y cambiar su tamaño.

## Desarrollo

- **Probar sin instalar**: abre esta carpeta en VS Code y pulsa **F5**.
- **Empaquetar**: `powershell -ExecutionPolicy Bypass -File build-vsix.ps1`
- **Instalar**: `code --install-extension clawd-pet-0.1.0.vsix`

Estructura:

- `extension.js`: registra la vista, comandos y eventos del editor.
- `media/pet.js`: motor de la mascota (sprites en pixel art, estados, física, partículas).
- `media/pet.css`: estilos de la ventana.

*Proyecto de fans, no oficial ni afiliado a Anthropic, Crypton Future Media, TWINDRILL, Cygames, Kadokawa, Nintendo, Game Freak ni The Pokémon Company.
Hatsune Miku, Kasane Teto, Defoko (Uta Utane), Gold Ship, Agnes Tachyon (Uma Musume Pretty Derby), Megumin (KonoSuba) y Mudkip (Pokémon) pertenecen a sus
respectivos dueños; los sprites son fan art propio. Antes de
publicar la extensión en el Marketplace, revisa las licencias de uso de esos personajes.*
