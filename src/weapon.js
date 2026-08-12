import { isDown } from './input.js';
import { setCell } from './asciiScreen.js';
import { ASCII_RAMP } from './renderAscii.js';
import { castRay } from './raycast.js';
import { player } from './player.js';

// Weapon State & Realistic FPS Recoil Dynamics
export const weapon = {
  isFiring: false,
  animTimer: 0,
  recoilX: 0,
  recoilY: 0,
  showFlash: false,
  isPumping: false
};

export let impactSpark = null;

// PERFECTLY BALANCED SHOTGUN MODEL (IDLE - 32 Lines)
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
  "                                       *#*#*%*##%#***%#*@@#+##@@#%##%%%%****++=-.==+*+*"
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
  "                                       *#*#*%*##%#***%#*@@#+##@@#%##%%%%****++=-.==+*+*"
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
  "                                  ****##*+*=#+%####***.-+*****+*%@@@@@@@%%###%%@@%%=          * .",
  "                                   +**##****#****#+##**.=+*#@@@%%%###****++==--:=+*@%+       . *",
  "                                    ##=**##*%**##*###=**-@@@%@%%##*****##**+--::-++*%*",
  "                                     ***#*%*###%#***##**%@@%%%%%#####***%***=-:.:=++**",
  "                                       *#*#*%*##%#***%#*@@#+##@@#%##%%%%****++=-.==+*+*"
];

let mouseFired = false;
window.addEventListener('mousedown', (e) => {
  if (e.button === 0) { // Left Click
    mouseFired = true;
  }
});

export function shootWeapon() {
  if (weapon.isFiring) return;
  weapon.isFiring = true;
  weapon.animTimer = 0;
  weapon.showFlash = true;
  weapon.isPumping = false;
  weapon.recoilY = -6; // Gun Pitch UP
  weapon.recoilX = 4;  // Recoil Kick RIGHT

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

    // Phase 1: Muzzle Flash Blast (0.0s - 0.08s) -> Pitch UP & RIGHT
    if (weapon.animTimer <= 0.08) {
      weapon.showFlash = true;
      weapon.isPumping = false;
      weapon.recoilY = -6;
      weapon.recoilX = 4;
    }
    // Phase 2: Pump Action & Eject Shell (0.08s - 0.20s) -> Drop down & Slide Pump
    else if (weapon.animTimer <= 0.20) {
      weapon.showFlash = false;
      weapon.isPumping = true;
      weapon.recoilY = 2;
      weapon.recoilX = 2;
    }
    // Phase 3: Smooth Elastic Return (0.20s - 0.30s)
    else if (weapon.animTimer <= 0.30) {
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

  const gunH = sprite.length;
  let maxW = 0;
  for (let r = 0; r < gunH; r++) {
    if (sprite[r].length > maxW) maxW = sprite[r].length;
  }

  // Position slightly down and towards the right!
  const startX = screen.cols - maxW + 10 + weapon.recoilX;
  const startY = screen.rows - gunH + 8 + weapon.recoilY;

  for (let r = 0; r < gunH; r++) {
    const line = sprite[r];
    const cy = startY + r;
    if (cy < 0 || cy >= screen.rows) continue;

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === ' ') continue;

      const cx = startX + c;
      if (cx < 0 || cx >= screen.cols) continue;

      const charIdx = ASCII_RAMP.indexOf(char);

      // Multi-Color Photorealistic Density Shading
      let colorIdx;
      if (weapon.showFlash && r < 9) {
        // Bigger 4-Prong X-Flare Muzzle Blast Matching Reference Photo!
        if (char === 'O' || char === 'W' || char === ')' || char === '(') {
          colorIdx = 1; // Incandescent Pure White Center
        } else if (char === '*' || char === '@' || char === '#') {
          colorIdx = 12; // Warm Cream Gold Plume Core
        } else if (char === '\\' || char === '/' || char === '=') {
          colorIdx = 13; // Fiery Amber Gold Plume Arms
        } else {
          colorIdx = 14; // Fiery Orange Outer Smoke
        }
      } else if (char === '+' || char === '*') {
        colorIdx = 1; // Chrome Specular Highlights & Muzzle Tip (+@)
      } else if (char === '@') {
        colorIdx = 9; // Brass Filigree & Ornate Chamber Accents
      } else if (char === '%') {
        colorIdx = 4; // Silver Steel Barrel Body
      } else if (char === '#') {
        colorIdx = 7; // Dark Carbon Steel & Pump Shading
      } else if (char === '=') {
        colorIdx = 3; // Metallic Gray Receiver Plate
      } else if (char === '-') {
        colorIdx = 6; // Dark Metal Groove / Line
      } else {
        colorIdx = 5; // Base Slate Body
      }

      setCell(screen, cx, cy, charIdx !== -1 ? charIdx : 1, colorIdx);
    }
  }
}
