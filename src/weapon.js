import { isDown } from './input.js';
import { setCell } from './asciiScreen.js';
import { ASCII_RAMP } from './renderAscii.js';
import { castRay } from './raycast.js';
import { player } from './player.js';

// Weapon State, Realistic FPS Recoil Dynamics & Ammo System
export const weapon = {
  isFiring: false,
  animTimer: 0,
  recoilX: 0,
  recoilY: 0,
  showFlash: false,
  isPumping: false,

  // Shotgun Shell Ammo & Manual Reload System
  ammo: 5,
  maxAmmo: 5,
  isReloading: false,
  reloadTimer: 0,
  reloadDuration: 2.5 // Total time for 5 bobs (0.5s per bob)
};

export let impactSpark = null;

// FULL-SCALE HIGH-RESOLUTION SHOTGUN MODEL (IDLE - 42 Lines)
const IDLE_SHOTGUN = [
  "             +@",
  "            **+%++",
  "            =#**+#%++-",
  "            @*%#**++%#+++",
  "            ##+@%##*++#@#+++",
  "             ##+%%%*#*+++@%*+++",
  "              ##**@#%*##+++%@#+++*",
  "               #*#+%###*##+++*@@#+++*=",
  "                #*#+#+%##*##++++*%%#++**+",
  "                 #***#+#@##*##*****#%%+*****",
  "                  *#*+#**%%#**##****=+**+*======",
  "                 ****+**+@@@%#+*##==-+*+====----==",
  "                 ##+*#++*@@@@%%#**++==-=**+*++===-----",
  "                 ###**#*@@#%*@%%#***=+==+**=+++++===-----",
  "                  ###+*@@#%@%#@@@*#@*+++==+++*++=+==--+--+::",
  "                   #+%@@#%%#@###@**@++*++===*+==++==+====-:----",
  "                   **@@@%%@@**###**@#++**+++===**=+*=+===--::::--",
  "                    #@@@@%@@%*+*##*@%##+=**==++++++=+====---:::...:-",
  "                     @@@@@%@@%#=*#*#####*=+**-+=++++++====--*==*-:..:-",
  "                      @@@@@%@@%#=#*%@#####**#**-+***+++++==@+#++*+#*.::=",
  "                        @@@@@@@##**=*@#####*#***-+****++++===#@%##+#*..:-=",
  "                          %@@@@@#***=++@####***#*-+****++++==-==%*#%%...::=",
  "                              *%@*###*=+###*******=+****+++=====+#@@%..-..:-=",
  "                                 *%****=+**********-+*****++===+=++-:.......:=",
  "                                 %**#%#***%#****#*=+-+*****++===---++=@.:....:-=",
  "                                 #*%#%*#%###**#+##*+=-+*****+++===---##*#.....:-=",
  "                                 +*+********##**#*#*=--+*******+===-----==--:...--=",
  "                                  ****##*+*=#+%####***.-+*****+*%@@@@@@@%%###%%@@%%=",
  "                                   +**##****#****#+##**.=+*#@@@%%%###****++==--:=+*@%+",
  "                                    ##=**##*%**##*###=**-@@@%@%%##*****##**+--::-++*%*",
  "                                     ***#*%*###%#***##**%@@%%%%%#####***%***=-:.:=++**",
  "                                       *#*#*%*##%#***%#*@@#+##@@#%##%%%%****++=-.==+*+*",
  "                                        **+##%###*##***#@%%#*#%%%@@%####%%%###*=:::=+++#",
  "                                         #+#*%#*##*##**%@%%#*@@%%@@%##%##%#****+==::-=+*+",
  "                                          **%*#**###*#*@@%%%##@%%%%%%###%%%%#****=-::-++**",
  "                                            *****######@@%#%%#@@@%@%%%%%###*****#*=-=--++*+",
  "                                             #***##**##@%%##%#%%#@%%#%%%%%%##***+**+=::+++**",
  "                                              ***###**@@%%%##%#%@%%##%@@%#%####%###*+=-:=+***",
  "                                               **###**@@%%%%#%%%%@@@%#@%#@%#%%####**+=-:--+*#%*",
  "                                                 **###@%%#%%##%%%%@%%@@@#%@%#*#******==-::-++***",
  "                                                  ##%#@%%#@#%#%#@%@@#@%%%%%%#%####****+=---=+*+**",
  "                                                  %#*%@%##%%#%#%@@%%@%@#%@%%%%%##**##**++=::-+++**"
];

// BIGGER 4-PRONG X-FLARE MUZZLE FLASH
const FLASH_SHOTGUN = [
  "   \\\\                   //                  ",
  "    \\\\      *******    //                   ",
  "     \\\\   ***#@W@#*** //                    ",
  "      \\\\ **#@W@#@W@#**//                    ",
  "       ====*(O W O)*====                    ",
  "      // **#@W@#@W@#**\\\\                    ",
  "     //   ***#@W@#***  \\\\                   ",
  "    //      *******     \\\\                  ",
  "   //                   \\\\                  ",
  "                  *#*+#**%%#**##****=+**+*======",
  "                 ****+**+@@@%#+*##==-+*+====----==",
  "                 ##+*#++*@@@@%%#**++==-=**+*++===-----",
  "                 ###**#*@@#%*@%%#***=+==+**=+++++===-----",
  "                  ###+*@@#%@%#@@@*#@*+++==+++*++=+==--+--+::",
  "                   #+%@@#%%#@###@**@++*++===*+==++==+====-:----",
  "                   **@@@%%@@**###**@#++**+++===**=+*=+===--::::--",
  "                    #@@@@%@@%*+*##*@%##+=**==++++++=+====---:::...:-",
  "                     @@@@@%@@%#=*#*#####*=+**-+=++++++====--*==*-:..:-",
  "                      @@@@@%@@%#=#*%@#####**#**-+***+++++==@+#++*+#*.::=",
  "                        @@@@@@@##**=*@#####*#***-+****++++===#@%##+#*..:-=",
  "                          %@@@@@#***=++@####***#*-+****++++==-==%*#%%...::=",
  "                              *%@*###*=+###*******=+****+++=====+#@@%..-..:-=",
  "                                 *%****=+**********-+*****++===+=++-:.......:=",
  "                                 %**#%#***%#****#*=+-+*****++===---++=@.:....:-=",
  "                                 #*%#%*#%###**#+##*+=-+*****+++===---##*#.....:-=",
  "                                 +*+********##**#*#*=--+*******+===-----==--:...--=",
  "                                  ****##*+*=#+%####***.-+*****+*%@@@@@@@%%###%%@@%%=",
  "                                   +**##****#****#+##**.=+*#@@@%%%###****++==--:=+*@%+",
  "                                    ##=**##*%**##*###=**-@@@%@%%##*****##**+--::-++*%*",
  "                                     ***#*%*###%#***##**%@@%%%%%#####***%***=-:.:=++**",
  "                                       *#*#*%*##%#***%#*@@#+##@@#%##%%%%****++=-.==+*+*",
  "                                        **+##%###*##***#@%%#*#%%%@@%####%%%###*=:::=+++#",
  "                                         #+#*%#*##*##**%@%%#*@@%%@@%##%##%#****+==::-=+*+",
  "                                          **%*#**###*#*@@%%%##@%%%%%%###%%%%#****=-::-++**",
  "                                            *****######@@%#%%#@@@%@%%%%%###*****#*=-=--++*+",
  "                                             #***##**##@%%##%#%%#@%%#%%%%%%##***+**+=::+++**",
  "                                              ***###**@@%%%##%#%@%%##%@@%#%####%###*+=-:=+***",
  "                                               **###**@@%%%%#%%%%@@@%#@%#@%#%%####**+=-:--+*#%*",
  "                                                 **###@%%#%%##%%%%@%%@@@#%@%#*#******==-::-++***",
  "                                                  ##%#@%%#@#%#%#@%@@#@%%%%%%#%####****+=---=+*+**",
  "                                                  %#*%@%##%%#%#%@@%%@%@#%@%%%%%##**##**++=::-+++**"
];

// PUMP ACTION SHOTGUN
const PUMP_SHOTGUN = [
  "             +@",
  "            **+%++",
  "            =#**+#%++-",
  "            @*%#**++%#+++",
  "            ##+@%##*++#@#+++",
  "             ##+%%%*#*+++@%*+++",
  "              ##**@#%*##+++%@#+++*",
  "               #*#+%###*##+++*@@#+++*=",
  "                #*#+#+%##*##++++*%%#++**+",
  "                 #***#+#@##*##*****#%%+-----+",
  "                  *#*+#**%%#**##****=+**+*======",
  "                 ****+**+@@@%#+*##==-+*+====----==",
  "                 ##+*#++*@@@@%%#**++==-=**+*++===-----",
  "                 ###**#*@@#%*@%%#***=+==+**=+++++===-----",
  "                  ###+*@@#%@%#@@@*#@*+++==+++*++=+==--+--+::",
  "                   #+%@@#%%#@###@**@++*++===*+==++==+====-:----",
  "                   **@@@%%@@**###**@#++**+++===**=+*=+===--::::--",
  "                    #@@@@%@@%*+*##*@%##+=**==++++++=+====---:::...:-",
  "                     @@@@@%@@%#=*#*#####*=+**-+=++++++====--*==*-:..:-",
  "                      @@@@@%@@%#=#*%@#####**#**-+***+++++==@+#++*+#*.::=",
  "                        @@@@@@@##**=*@#####*#***-+****++++===#@%##+#*..:-=",
  "                          %@@@@@#***=++@####***#*-+****++++==-==%*#%%...::=",
  "                              *%@*###*=+###*******=+****+++=====+#@@%..-..:-=",
  "                                 *%****=+**********-+*****++===+=++-:.......:=",
  "                                 %**#%#***%#****#*=+-+*****++===---++=@.:....:-=",
  "                                 #*%#%*#%###**#+##*+=-+*****+++===---##*#.....:-=",
  "                                 +*+********##**#*#*=--+*******+===-----==--:...--=",
  "                                  ****##*+*=#+%####***.-+*****+*%@@@@@@@%%###%%@@%%=          * .",
  "                                   +**##****#****#+##**.=+*#@@@%%%###****++==--:=+*@%+       . *",
  "                                    ##=**##*%**##*###=**-@@@%@%%##*****##**+--::-++*%*",
  "                                     ***#*%*###%#***##**%@@%%%%%#####***%***=-:.:=++**",
  "                                       *#*#*%*##%#***%#*@@#+##@@#%##%%%%****++=-.==+*+*",
  "                                        **+##%###*##***#@%%#*#%%%@@%####%%%###*=:::=+++#",
  "                                         #+#*%#*##*##**%@%%#*@@%%@@%##%##%#****+==::-=+*+",
  "                                          **%*#**###*#*@@%%%##@%%%%%%###%%%%#****=-::-++**",
  "                                            *****######@@%#%%#@@@%@%%%%%###*****#*=-=--++*+",
  "                                             #***##**##@%%##%#%%#@%%#%%%%%%##***+**+=::+++**",
  "                                              ***###**@@%%%##%#%@%%##%@@%#%####%###*+=-:=+***",
  "                                               **###**@@%%%%#%%%%@@@%#@%#@%#%%####**+=-:--+*#%*",
  "                                                 **###@%%#%%##%%%%@%%@@@#%@%#*#******==-::-++***",
  "                                                  ##%#@%%#@#%#%#@%@@#@%%%%%%#%####****+=---=+*+**",
  "                                                  %#*%@%##%%#%#%@@%%@%@#%@%%%%%##**##**++=::-+++**"
];

let mouseFired = false;
window.addEventListener('mousedown', (e) => {
  // Only register gunshot clicks while actively playing with Pointer Lock!
  if (e.button === 0 && document.pointerLockElement !== null) {
    mouseFired = true;
  }
});

export function startReload() {
  if (weapon.isReloading || weapon.isFiring || weapon.ammo === weapon.maxAmmo) return;
  weapon.isReloading = true;
  weapon.reloadTimer = 0;
  weapon.showFlash = false;
  weapon.isPumping = true; // Use pump/open stance during reload!
}

export function shootWeapon() {
  if (weapon.isFiring || weapon.isReloading) return;
  if (weapon.ammo <= 0) {
    // If ammo is depleted, trigger reload on shoot attempt
    startReload();
    return;
  }

  weapon.ammo -= 1; // Consume 1 shotgun shell!
  weapon.isFiring = true;
  weapon.animTimer = 0;
  weapon.showFlash = true;
  weapon.isPumping = false;
  weapon.recoilY = -8;
  weapon.recoilX = 5;

  const hit = castRay(player.x, player.y, player.angle);
  if (hit && hit.dist) {
    impactSpark = {
      tileX: hit.tileX,
      tileY: hit.tileY,
      dist: hit.dist,
      timer: 0.15
    };
  }
}

export function updateWeapon(dt) {
  // Discard queued clicks if pointer lock is not active (e.g. while unpausing)
  if (document.pointerLockElement === null) {
    mouseFired = false;
    return;
  }

  // Trigger Reload with R key
  if (isDown('KeyR')) {
    startReload();
  }

  // Handle active Reload Animation (5 bobs up and down)
  if (weapon.isReloading) {
    weapon.reloadTimer += dt;
    const progress = Math.min(1.0, weapon.reloadTimer / weapon.reloadDuration);

    // 5 complete bobs up and down (sinusoidal wave: 5 cycles = 5 * 2 * PI = 10 * PI)
    const bob = Math.sin(progress * Math.PI * 10);
    weapon.recoilY = Math.round(bob * 5); // Bobs UP (-5) and DOWN (+5)
    weapon.recoilX = Math.round(Math.cos(progress * Math.PI * 10) * 2);

    // Incrementally fill ammo count (1 shell per completed bob cycle)
    const currentShells = Math.min(weapon.maxAmmo, Math.floor(progress * 5) + 1);
    if (currentShells > weapon.ammo) {
      weapon.ammo = currentShells;
    }

    if (weapon.reloadTimer >= weapon.reloadDuration) {
      weapon.isReloading = false;
      weapon.reloadTimer = 0;
      weapon.ammo = weapon.maxAmmo;
      weapon.recoilY = 0;
      weapon.recoilX = 0;
      weapon.isPumping = false;
    }

    // Skip shooting while reloading
    mouseFired = false;
    return;
  }

  if (isDown('Space') || mouseFired) {
    mouseFired = false;
    shootWeapon();
  }

  if (impactSpark) {
    impactSpark.timer -= dt;
    if (impactSpark.timer <= 0) {
      impactSpark = null;
    }
  }

  if (weapon.isFiring) {
    weapon.animTimer += dt;

    if (weapon.animTimer <= 0.12) {
      weapon.showFlash = true;
      weapon.isPumping = false;
      weapon.recoilY = -8;
      weapon.recoilX = 5;
    } else if (weapon.animTimer <= 0.35) {
      weapon.showFlash = false;
      weapon.isPumping = true;
      weapon.recoilY = 3;
      weapon.recoilX = 3;
    } else if (weapon.animTimer <= 0.48) {
      weapon.showFlash = false;
      weapon.isPumping = false;
      weapon.recoilY = 0;
      weapon.recoilX = 0;
    } else {
      weapon.isFiring = false;
    }
  }
}

export function drawWeapon(screen) {
  let sprite = IDLE_SHOTGUN;
  if (weapon.showFlash) sprite = FLASH_SHOTGUN;
  else if (weapon.isPumping) sprite = PUMP_SHOTGUN;

  // Smooth ~30% scale factors for a slightly larger weapon presence
  const scaleX = 1.35;
  const scaleY = 1.25;

  const gunH = Math.floor(sprite.length * scaleY);
  let maxW = 0;
  for (let r = 0; r < sprite.length; r++) {
    if (sprite[r].length > maxW) maxW = sprite[r].length;
  }
  maxW = Math.floor(maxW * scaleX);

  // Position shifted slightly to the right and anchored at bottom
  const startX = screen.cols - maxW + 4 + weapon.recoilX;
  const startY = screen.rows - gunH + 6 + weapon.recoilY;

  for (let r = 0; r < sprite.length; r++) {
    const line = sprite[r];

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === ' ') continue;

      const charIdx = ASCII_RAMP.indexOf(char);

      // Rich Photorealistic Multi-Color Weapon Palette Shading!
      let colorIdx;
      if (weapon.showFlash && r < 9) {
        if (char === 'O' || char === 'W' || char === ')' || char === '(') {
          colorIdx = 1;
        } else if (char === '*' || char === '@' || char === '#') {
          colorIdx = 12;
        } else if (char === '\\' || char === '/' || char === '=') {
          colorIdx = 13;
        } else {
          colorIdx = 14;
        }
      } else if (char === '@') {
        colorIdx = 17;
      } else if (char === '+' || char === '*') {
        colorIdx = 1;
      } else if (r >= 15 && (char === '%' || char === '#' || char === '=' || char === ':')) {
        if (char === '%') colorIdx = 16;
        else colorIdx = 15;
      } else if (char === '%') {
        colorIdx = 20;
      } else if (char === '#') {
        colorIdx = 19;
      } else if (char === '=') {
        colorIdx = 21;
      } else if (char === '-') {
        colorIdx = 18;
      } else {
        colorIdx = 6;
      }

      const baseCX = startX + Math.floor(c * scaleX);
      const baseCY = startY + Math.floor(r * scaleY);

      const blockW = Math.ceil(scaleX);
      const blockH = Math.ceil(scaleY);

      for (let dy = 0; dy < blockH; dy++) {
        const cy = baseCY + dy;
        if (cy < 0 || cy >= screen.rows) continue;

        for (let dx = 0; dx < blockW; dx++) {
          const cx = baseCX + dx;
          if (cx < 0 || cx >= screen.cols) continue;

          setCell(screen, cx, cy, charIdx !== -1 ? charIdx : 1, colorIdx);
        }
      }
    }
  }
}

// 5 ASCII Shotgun Shell Slugs HUD (Bottom Center)
export function drawAmmoHUD(screen) {
  const maxShells = weapon.maxAmmo; // 5
  const shellW = 7;
  const spacing = 3;
  const totalW = maxShells * shellW + (maxShells - 1) * spacing;
  const startX = Math.floor((screen.cols - totalW) / 2);
  const startY = screen.rows - 6;

  // Render 5 Big Shotgun Shell Slugs
  for (let i = 0; i < maxShells; i++) {
    const isLoaded = i < weapon.ammo;
    const sx = startX + i * (shellW + spacing);

    // 5-Row Tall Big Shotgun Shell Slugs
    const row0 = isLoaded ? " [▲▲▲] " : " (   ) ";
    const row1 = isLoaded ? " |███| " : " |   | ";
    const row2 = isLoaded ? " |███| " : " |   | ";
    const row3 = isLoaded ? " |███| " : " |   | ";
    const row4 = isLoaded ? " |===| " : " |___| ";

    const rows = [row0, row1, row2, row3, row4];
    // Full: Gold Cap (17), Crimson Body (22), Base (18)
    // Empty: BRIGHT WHITE (1)
    const colors = isLoaded ? [17, 22, 22, 22, 18] : [1, 1, 1, 1, 1];

    for (let r = 0; r < 5; r++) {
      const line = rows[r];
      const color = colors[r];
      const cy = startY + r;
      if (cy < 0 || cy >= screen.rows) continue;

      for (let c = 0; c < shellW; c++) {
        if (line[c] === ' ') continue;
        const cx = sx + c;
        if (cx < 0 || cx >= screen.cols) continue;

        const charIdx = ASCII_RAMP.indexOf(line[c]);
        setCell(screen, cx, cy, charIdx !== -1 ? charIdx : 1, color);
      }
    }
  }

  // Huge 6-Line ASCII Font RELOAD Banner
  if (weapon.isReloading) {
    const banner = [
      "+-----------------------------------------+",
      "|   * * *   R E L O A D I N G . . .   * * *   |",
      "+-----------------------------------------+"
    ];
    for (let r = 0; r < banner.length; r++) {
      const line = banner[r];
      const mx = Math.floor((screen.cols - line.length) / 2);
      const cy = startY - 4 + r;
      if (cy < 0 || cy >= screen.rows) continue;

      for (let c = 0; c < line.length; c++) {
        if (line[c] === ' ') continue;
        const charIdx = ASCII_RAMP.indexOf(line[c]);
        setCell(screen, mx + c, cy, charIdx !== -1 ? charIdx : 1, 17); // Shimmering Gold
      }
    }
  } else if (weapon.ammo === 0) {
    const banner = [
      " _______     ________  _____       ___        _       ______    ",
      "|_   __ \\   |_   __  ||_   _|    .'   `.     / \\     |_   _ `.  ",
      "  | |__) |    | |_ \\_|  | |     /  .-.  \\   / _ \\      | | `. \\ ",
      "  |  __ /     |  _| _   | |   _ | |   | |  / ___ \\     | |  | | ",
      " _| |  \\ \\_  _| |__/ | _| |__/ |\\  `-'  /_/ /   \\ \\_  _| |_.' / ",
      "|____| |___||________||________| `.___.'|____| |____||______.'  "
    ];
    for (let r = 0; r < banner.length; r++) {
      const line = banner[r];
      const mx = Math.floor((screen.cols - line.length) / 2);
      const cy = startY - 7 + r;
      if (cy < 0 || cy >= screen.rows) continue;

      for (let c = 0; c < line.length; c++) {
        if (line[c] === ' ') continue;
        const charIdx = ASCII_RAMP.indexOf(line[c]);
        setCell(screen, mx + c, cy, charIdx !== -1 ? charIdx : 1, 17); // Bright Yellow / Gold
      }
    }
  }
}
