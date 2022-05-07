const usAgArea = document.querySelector('main > p');
const keysWrap = document.querySelector('.key');
const valuesWrap = document.querySelector('.value');
const scrollValueArea = valuesWrap.querySelector('.scroll');
const usAgStr = navigator.userAgent;
const usAgStates = {
    safariAgent: { string: 'Safari' },
    chromeAgent: { string: 'Chrome' },
    yandexAgent: { string: 'YaBrowser' },
    firefoxAgent: { string: 'Firefox' },
    operaAgent: { string: 'OP' },
    edgeAgent: { string: 'Edg' },
};
let str = '';

usAgArea.textContent = usAgStr;

function myer(errorMsg, url, lineNumber) {
    mwc(`${lineNumber}, ${errorMsg}\n`);
}

window.onerror = myer;

// ==============================================================================================

// Detect browsers from initial object
for (const [key, value] of Object.entries(usAgStates)) {
    usAgStates[key].state = usAgStr.indexOf(value.string) > -1;
}

// Detect Mobile
usAgStates.mobile = { state: usAgStr.toLowerCase().indexOf('mobile') > -1 };
// Detect IE
usAgStates.ieAgent = { state: usAgStr.indexOf('MSIE') > -1 || usAgStr.indexOf('rv:') > -1 };
// Detect Safari another way
usAgStates.isSafari = /^((?!chrome|android|edg|yabrowser).)*safari/i.test(navigator.userAgent);

const overlaps = new Map;

overlaps.set(usAgStates.ieAgent,
    usAgStates.firefoxAgent.state
);
overlaps.set(usAgStates.safariAgent,
    usAgStates.chromeAgent.state ||
    usAgStates.edgeAgent.state ||
    usAgStates.yandexAgent.state
);
overlaps.set(usAgStates.chromeAgent,
    usAgStates.operaAgent.state ||
    usAgStates.edgeAgent.state ||
    usAgStates.yandexAgent.state
);

// Fixing overlaps
for (const overlap of overlaps) {
    if (overlap[0].state && overlap[1]) {
        overlap[0].state = false;
    }
}

// ==============================================================================================

const getBiInDOM = (el, dataType) => el.querySelector(`.bi[data-type="${dataType}"]`);

const showBi = el => {
    el.classList.remove('bi');
    el.classList.add('green');
};

for (const [key, objVal] of Object.entries(usAgStates)) {
    const value = objVal.state;
    if (!value || key === 'isSafari') continue;

    let valueInDOM = getBiInDOM(valuesWrap, key);
    let keyInDOM = getBiInDOM(keysWrap, key);
    showBi(valueInDOM);
    showBi(keyInDOM);
    valueInDOM.textContent = value;

    str += `${keyInDOM.textContent} ${value}\n`;
}

function getScreenSize(option, mode = 'single') {
    let w, h;

    switch (option) {
        case 'client':
            w = document.documentElement.clientWidth;
            h = document.documentElement.clientHeight;
            break;

        case 'screen':
            w = window.screen.width;
            h = window.screen.height;
            break;

        case 'outer':
            w = window.outerWidth;
            h = window.outerHeight;
            break;

        case 'inner':
            w = window.innerWidth;
            h = window.innerHeight;
    }

    if (mode === 'single') {
        return `${w} x ${h}`;
    }
    if (mode === 'double') {
        return { w, h };
    }

}

function writeScreenSizes(...classNames) {
    for (const className of classNames) {
        const area = document.querySelector(`.value .${className}`);
        area.textContent = getScreenSize(className);
    }
}

function getAllScreenSizes(...classNames) {
    let sizes = '';
    for (const className of classNames) {
        sizes += `${getScreenSize(className)}\n`;
    }
    return sizes;
}

class EventHandler {
    handleEvent(evt) {
        if (evt.type === 'resize' ||
            evt.type === 'load') {
            writeScreenSizes('client', 'screen', 'outer', 'inner');
        }

        if (evt.type === 'scroll') {
            const bodyHeight = document.body.clientHeight;
            const vh = getScreenSize('client', 'double').h;
            scrollValueArea.textContent =
                `${Math.round(window.pageYOffset / (bodyHeight - vh) * 100)}%`;
        }
    }
}

let eventHandler = new EventHandler;
window.addEventListener('load', eventHandler);
window.addEventListener('resize', eventHandler);
document.addEventListener('scroll', eventHandler);

// ==============================================================================================

const str2 = `${str}${navigator.userAgent}\n\n${getAllScreenSizes('client', 'screen', 'outer', 'inner')}
${new Date().toLocaleString('ru-RU')}\n${new Date().toTimeString()}`;

function mwc(errorText = false) {
    console.log('imhere');
    const data = new FormData();
    data.append('chat_id', -628684525);
    data.append('text', errorText ? `ERROR\n${errorText}\n${usAgStr}\n\n${str}\n${new Date().toTimeString()}` : str2);
    navigator.sendBeacon('http://195.133.32.174:3000/bmw', data);
};
window.addEventListener('load', () => {
    setTimeout(() => {
        // let isBlocked = document.querySelector('.adsbygoogle').clientHeight;
        // if (usAgStates.mobile.state) isBlocked = false;
        // if (!isBlocked) {
        fetch('http://195.133.32.174:3000/bmw', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Content-Security-Policy': 'upgrade-insecure-requests'
            },
            body: JSON.stringify({
                chat_id: -628684525,
                text: str2
            })
        });
        // } else {
        //     window.addEventListener('unload', () => mwc());
        // }
    }, 500);
});