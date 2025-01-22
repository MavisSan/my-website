const cat = document.getElementById('cat');
const angyometerLabel = document.getElementById('angyometer-label');
const angyometerFill = document.getElementById('angyometer-fill');
const message = document.getElementById('message');
const levelIndicator = document.getElementById('level-indicator');
const touchesLabel = document.getElementById('touches-label');
let angyLevel = 0;
let lastInteraction = Date.now();
let lastUpdate = Date.now();
let gameOver = false;
let maxSize;
let minSize;
let angyIncrease;
let k;
let currentLevel = 0;

function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
function initLevelsStats() {
    return [{ touches: -1, time: 0 }, { touches: -1, time: 0 }, { touches: -1, time: 0 }, { touches: -1, time: 0 }, { touches: -1, time: 0 }];
}
let levelsStats = initLevelsStats();

const levels = [
    {
        catImage: 'angy.png',
        backgroundImage: 'background.jpg',
        k: 0.05,
        angyIncrease: 6,
        minSize: 30,
        maxSize: 200,
        message: `
            <p>Congratulations, you annoyed Angy, she truned into Pika Angy...</p>
            <button id="nextLevelButton">Proceed to Level 2</button>
            <div class="preload preload-cosmo"></div>
        `
    },
    {
        catImage: 'pikaangy.png',
        backgroundImage: 'pokebackground.jpg',
        k: 0.08,
        angyIncrease: 4,
        minSize: 20,
        maxSize: 140,
        message: () => `
            <p>Angy was so mad at the world, she decided the best move was an interstellar one. She built a rocket fueled by rage and launched into the cosmos for some peace and quiet. Out there, she found out that space was super chill, with no one to argue with but the occasional asteroid. 🐱</p>
            <button id="nextLevelButton">Proceed to Level 3</button>
            <div class="preload preload-zomb"></div>
        `
    },
    {
        catImage: 'cosmoangy.png',
        backgroundImage: 'cosmoBG.png',
        k: 0.1,
        angyIncrease: 5,
        minSize: 20,
        maxSize: 150,
        onInit: () => {
            cat.style.animation = 'float 4s ease-in-out infinite';
        },
        onExit: () => {
            cat.style.animation = 'none';
        },
        message: () => `
            <p>Angy, now floating in the vastness of space, started feeling odd; her skin turned a ghastly shade of green, and a hunger unlike any she'd known gnawed at her insides. Realizing she'd caught some extraterrestrial virus, she began to panic, but her panic was cut short when her hunger led her to gnaw on her own space suit's glove. As she drifted back towards Earth her transformation was complete - she turned into ZOMBIE...</p>
            <button id="nextLevelButton">Proceed to Level 4</button>
            <div class="preload preload-hell"></div>
            <div class="preload preload-scar"></div>

        `
    },
    {
        catImage: 'zombangy.png',
        backgroundImage: 'zombBG.png',
        k: 0.125,
        angyIncrease: 4,
        minSize: 17,
        maxSize: 150,
        onInit: () => {
            cat.style.animation = 'zombie-wobble 4s infinite, zombie-eyes 2s infinite alternate';
        },
        onExit: () => {
            cat.style.animation = 'none';
        },
        message: () => `
            <p>Angy, aptly named for her perpetual grumpiness, didn't expect to become a demon kitten when she died. But there she was, in Hell, with a fiery disposition to match her new environment. She set out, not for companionship, but to shush the infernal noise, one demon at a time, because if there's one thing Angy was going to have, it was her peace, even if she had to claw her way through Hell to get it.... 😾</p>
            <button id="nextLevelButton">Proceed to Level 5</button>
        `
    },
    {
        catImage: 'hellc.gif',
        backgroundImage: 'hellBG.jpg',
        k: 0.125,
        angyIncrease: 4,
        minSize: 16,
        maxSize: 150,
        backgroundInterval: null,
        nextInterval: null,
        onInit: function () {
            cat.style.animation = 'flying 1.5s ease-in-out infinite';
            cat.style.filter = 'drop-shadow(0 0 5px red)';

            const changeBackground = () => {
                document.body.style.backgroundImage = `url('${this.backgroundImage}')`;
                cat.style.visibility = 'visible';

                if (!this.nextInterval) {
                    const visibleDuration = Math.random() * 4000 + 2000;
                    this.nextInterval = setTimeout(() => {
                        document.body.style.backgroundImage = `url('scar.jpg')`;
                        cat.style.visibility = 'hidden';
                        this.nextInterval = null;
                    }, visibleDuration);
                }

                const nextChange = Math.random() * 500 + 500;
                this.backgroundInterval = setTimeout(changeBackground, nextChange);
            };
            changeBackground();
        },
        onExit: function () {
            cat.style.animation = 'none';
            cat.style.filter = 'none';
            cat.style.visibility = 'visible';

            if (this.backgroundInterval) {
                clearTimeout(this.backgroundInterval);
                this.backgroundInterval = null;
            }
            if (this.nextInterval) {
                clearTimeout(this.nextInterval);
                this.nextInterval = null;
            }
            document.body.style.backgroundImage = `url('${this.backgroundImage}')`;
        },
        message: () => `
            <p>Angy ran away, but you can still find her <a href="https://raydium.io/swap/?inputMint=sol&outputMint=FkMmszVPTT1pEu8tYhP7kcGrGug9WvEKHV53DMeqpump">here</a>.</p>
            <p>
               Your stats:<br />
               ${levelsStats.map((stat, idx) => `Level ${idx + 1}: ${stat.touches} touches`).join('<br />')}
            </p>
            <button id="nextLevelButton">Play Again</button>
        `
    },
];

function initLevel(levelIndex) {
    const prevLevel = levels[levelIndex - 1];
    prevLevel?.onExit && prevLevel.onExit();

    const levelData = levels[levelIndex];
    if (!levelData) {
        currentLevel = 0;
        initLevel(currentLevel);
        levelsStats = initLevelsStats();
        touchesLabel.textContent = 'Touches: 0';
        return;
    }
    levelData?.onInit && levelData.onInit();

    document.body.style.backgroundImage = `url('${levelData.backgroundImage}')`;

    cat.src = levelData.catImage;

    const screenWidth = window.innerWidth;
    maxSize = (screenWidth / 390) * 120;
    maxSize = Math.min(maxSize, levelData.maxSize);

    const isMobile = isMobileDevice();

    if (isMobile) {
        angyIncrease = levelData.angyIncrease;
    } else {
        angyIncrease = levelData.angyIncrease + 2;
    }
    k = levelData.k;
    minSize = levelData.minSize;

    angyLevel = 0;
    lastInteraction = Date.now();
    lastUpdate = Date.now();
    gameOver = false;
    cat.style.display = 'block';
    message.style.display = 'none';
    angyometerLabel.textContent = 'Angy-o-meter: 0%';
    angyometerFill.style.width = '0%';
    updateCatSize();
    moveCat();

    if (levelIndicator) {
        levelIndicator.textContent = 'Level: ' + (levelIndex + 1);
    }
}

function moveCat() {
    if (gameOver) return;
    const maxWidth = window.innerWidth - cat.offsetWidth;
    const maxHeight = window.innerHeight - cat.offsetHeight;
    const randomX = Math.floor(Math.random() * maxWidth);
    const randomY = Math.floor(Math.random() * maxHeight);
    cat.style.left = randomX + 'px';
    cat.style.top = randomY + 'px';
    levelsStats[currentLevel].touches++;
    touchesLabel.textContent = 'Touches: ' + levelsStats[currentLevel].touches;
}

function updateCatSize() {
    const size = maxSize - ((angyLevel / 100) * (maxSize - minSize));
    cat.style.width = size + 'px';
    cat.style.height = size + 'px';
}

function updateAngyometer() {
    if (gameOver) return;

    const now = Date.now();
    const deltaTime = (now - lastUpdate) / 1000;
    const timeSinceLastInteraction = (now - lastInteraction) / 1000;

    angyLevel -= deltaTime * angyLevel * k * timeSinceLastInteraction;

    if (angyLevel < 0) angyLevel = 0;
    angyLevel = Math.min(angyLevel, 100);

    angyometerLabel.textContent = 'Angy-o-meter: ' + Math.floor(angyLevel) + '%';
    angyometerFill.style.width = angyLevel + '%';
    updateCatSize();

    if (angyLevel >= 99.9) {
        endLevel();
    }

    lastUpdate = now;
}

function interactWithCat(event) {
    if (gameOver) return;
    moveCat();
    angyLevel += angyIncrease;
    angyLevel = Math.min(angyLevel, 100);
    angyometerLabel.textContent = 'Angy-o-meter: ' + Math.floor(angyLevel) + '%';
    angyometerFill.style.width = angyLevel + '%';
    lastInteraction = Date.now();
    updateCatSize();

    if (event.type === 'touchstart') {
        event.preventDefault();
    }
}

function endLevel() {
    gameOver = true;
    cat.style.display = 'none';
    message.style.display = 'block';
    angyometerLabel.textContent = 'Angy-o-meter: 100%';
    const msg = levels[currentLevel].message;
    message.innerHTML = typeof msg === 'string' ? msg : msg();

    const nextLevelButton = document.getElementById('nextLevelButton');
    if (nextLevelButton) {
        nextLevelButton.addEventListener('click', () => {
            currentLevel++;
            initLevel(currentLevel);
        });
    }
}

initLevel(currentLevel);

cat.addEventListener('mouseenter', interactWithCat);
cat.addEventListener('touchstart', interactWithCat);

setInterval(updateAngyometer, 100);
