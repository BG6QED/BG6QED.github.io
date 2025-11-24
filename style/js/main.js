// Morse Code Data
const morseCode = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 
    'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.',
    'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-',
    'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..', 
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
    '6': '-....', '7': '--...', '8': '---..', '9': '----.', '.': '.-.-.-'
};

const messages = [
    'CQ CQ DE BG6QED PSE K  ', 
    'UR RST IS 599 5NN FB  ', 
    'QSL INFO QRZ.COM 73  ',
    'MY RIG IS IC705  '
];

function buildMorseTiming(message) {
    const timing = [];
    let currentTime = 0;
    
    message.split(' ').forEach((word, wordIndex) => {
        word.split('').forEach((char, charIndex) => {
            const code = morseCode[char.toUpperCase()];
            if (!code) return; 
            code.split('').forEach((symbol, symbolIndex) => {
                const duration = symbol === '.' ? 100 : 300; // Dit: 100, Dah: 300
                timing.push({ time: currentTime, value: 1 }); 
                timing.push({ time: currentTime + duration, value: 0 }); 
                currentTime += duration + 100; 
            });
            if (charIndex < word.length - 1) {
                currentTime += 300 - 100; 
            }
        });
        if (wordIndex < message.split(' ').length - 1) {
            currentTime += 700 - 300; 
        }
    });
    
    return { timing, totalDuration: currentTime };
}

function createSpectrumLines() {
    const spectrumContainer = document.querySelector('.spectrum-container');
    const numLines = 40;

    for (let i = 0; i < numLines; i++) {
        const line = document.createElement('div');
        line.classList.add('spectrum-line');
        line.style.left = Math.random() * 100 + 'vw';
        line.style.width = Math.random() * 3 + 1 + 'px';
        const animationDuration = Math.random() * 6 + 4; 
        line.style.animationDuration = `${animationDuration}s`;
        line.style.animationDelay = Math.random() * 5 + 's';
        line.style.backgroundColor = randomColor();
        spectrumContainer.appendChild(line);
    }
}

function initSpectrum() {
    const canvas = document.getElementById('spectrum');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const fftSize = 256; 
    const fixedTimeWindow = 5000;
    const lines = [
        { color: '#00ff00', phase: 0, speed: 0.0002, message: buildMorseTiming(messages[0]) }, 
        { color: '#ff0000', phase: 0.5, speed: 0.0003, message: buildMorseTiming(messages[1]) }, 
        { color: '#00b7eb', phase: 1.0, speed: 0.0004, message: buildMorseTiming(messages[2]) }, 
        { color: '#6f66f6', phase: 1.5, speed: 0.0009, message: buildMorseTiming(messages[3]) }  
    ];
    const lineHeight = 60; 
    const spacing = 60; 

    function drawSpectrum() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        lines.forEach((line, index) => {
            const frequencyData = new Float32Array(fftSize);
            const { timing, totalDuration } = line.message;
            const timeOffset = (line.phase * totalDuration) % totalDuration;

            for (let i = 0; i < fftSize; i++) {
                const t = ((i / fftSize) * fixedTimeWindow + timeOffset) % totalDuration;
                let value = 0; 
                for (let j = 0; j < timing.length - 1; j += 2) {
                    const start = timing[j].time;
                    const end = timing[j + 1].time;
                    if (t >= start && t < end) {
                        value = 1; 
                        break;
                    }
                }
                value = value * (0.7 + Math.random() * 0.3) + Math.sin(i * 0.05 + line.phase) * 0.2;
                frequencyData[i] = Math.min(1, Math.max(0, value));
            }
            line.phase += line.speed; 

            ctx.beginPath();
            ctx.strokeStyle = line.color;
            ctx.lineWidth = 4;
            ctx.moveTo(0, canvas.height / 2 + index * spacing - lineHeight / 2);
            for (let i = 0; i < fftSize; i++) {
                const x = (i / fftSize) * canvas.width;
                const y = (canvas.height / 2 + index * spacing) - (frequencyData[i] * lineHeight);
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        });

        requestAnimationFrame(drawSpectrum);
    }

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    drawSpectrum();
}

function addCircle(x, y) {
    const circle = document.createElement('div');
    circle.classList.add('circle');
    circle.style.left = `${x}vw`;
    circle.style.top = `${y}vh`;
    circle.style.setProperty('--circle-color', randomColor());
    
    document.body.appendChild(circle);
    setTimeout(() => circle.remove(), 8000);
}

function randomColor() {
    const colors = [
        '#ff4d4d', '#ff8c1a', '#ffff4d', '#4dff4d',
        '#4da8ff', '#b84dff', '#ff4da6', '#00e6e6',
        '#ffcc00', '#ff66b3'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}.${month}`;
}

window.addEventListener('load', () => {
    document.querySelector('.text').classList.add('ready');
    document.querySelector('.bio').classList.add('ready');
    document.querySelectorAll('.social-links li').forEach(li => li.classList.add('ready'));
    createSpectrumLines();
    initSpectrum();

    if (window.innerWidth > 767) {
        for (let i = 0; i < 8; i++) { 
            const [x, y] = [Math.random() * 95 + 1, Math.random() * 90 + 1];
            addCircle(x, y);
        }
    }

    const footerElement = document.querySelector('#copyright');
    if (footerElement) {
        footerElement.innerHTML = `
            <a target="_self" rel="nofollow">©2021.07 - ${getFormattedDate()}<br>
            88 DE <a href="https://qsl.net/bg6qed/" target="_blank">BG6QED</a></a>
        `;
    }
});

const customCursor = document.getElementById('custom-cursor');
document.addEventListener('mouseover', () => {
    customCursor.style.display = 'block';
});

document.addEventListener('mouseout', () => {
    customCursor.style.display = 'none';
});

document.addEventListener('mousemove', (e) => {
    customCursor.style.left = `${e.clientX - 12}px`;
    customCursor.style.top = `${e.clientY - 12}px`;
});

document.querySelectorAll('a, .letter').forEach(element => {
    element.addEventListener('mouseenter', () => {
        customCursor.classList.add('active');
    });
    element.addEventListener('mouseleave', () => {
        customCursor.classList.remove('active');
    });
});

document.addEventListener('click', (e) => {
    customCursor.style.transform = 'scale(1.5)';
    setTimeout(() => customCursor.style.transform = 'scale(1)', 200);
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    addCircle(x, y);
});
document.body.style.cursor = 'none';

// 友链功能
document.addEventListener('DOMContentLoaded', () => {
    const friendsBtn = document.getElementById('friends-link-btn');
    const friendsModal = document.getElementById('friends-modal');
    const closeBtn = document.getElementById('close-friends-modal');
    
    // 打开友链弹窗
    friendsBtn.addEventListener('click', () => {
        friendsModal.classList.add('show');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    });
    
    // 关闭友链弹窗
    closeBtn.addEventListener('click', () => {
        friendsModal.classList.remove('show');
        document.body.style.overflow = ''; // 恢复滚动
    });
    
    // 点击弹窗外部关闭
    friendsModal.addEventListener('click', (e) => {
        if (e.target === friendsModal) {
            friendsModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    });
    
    // ESC键关闭弹窗
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && friendsModal.classList.contains('show')) {
            friendsModal.classList.remove('show');
            document.body.style.overflow = '';
        }
    });
    
    // 为友链按钮添加鼠标悬停效果
    friendsBtn.addEventListener('mouseenter', () => {
        customCursor.classList.add('active');
    });
    
    friendsBtn.addEventListener('mouseleave', () => {
        customCursor.classList.remove('active');
    });
    
    // 为弹窗中的链接添加鼠标悬停效果
    friendsModal.addEventListener('mouseenter', () => {
        customCursor.style.display = 'block';
    });
    
    friendsModal.addEventListener('mouseleave', () => {
        customCursor.style.display = 'none';
    });
});
