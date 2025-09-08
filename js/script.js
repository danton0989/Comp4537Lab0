// Use of Github Copilot for help with syntax and some code structure

import {
    MSG_HOW_MANY_BUTTONS,
    MSG_WIN,
    MSG_LOSE,
    MSG_BACK_TO_MENU,
    MSG_GO
} from '../lang/messages/en/user.js';

const btnWidth = 10;
const btnHeight = 5;
const btnShowTimeSec = 2;
const buttonText = 'button';
const buttonClassText = 'game-btn';
const pixelText = 'px';
const absolutePositionText = 'absolute';
const clickText = 'click';
const emptyText = '';
const menuText = 'menu';
const labelText = 'label';
const attributeForText = 'for';
const attributeNumButtonsText = 'numButtons';
const inputText = 'input';
const numberText = 'number';
const elementDivText = 'div';
const fontSizeText = '2em';
const marginText = '1em';
const displayText = 'block';
const marginAutoText = '2em auto';
const containerIdText = 'game-container';

class Utility {
    static getRandomColors(num) {
        const colors = [];
        for (let i = 0; i < num; i++) {
            // help from copilot make this code concise
            const randomColor = Math.floor(Math.random() * 16777215).toString(16);
            colors.push(`#${randomColor}`);
        }
        return colors;
    }

    static getRandomPositions(num, btnWidth, btnHeight, windowWidth, windowHeight) {
        const emSize = parseFloat(getComputedStyle(document.body).fontSize);
        const btnWidthPx = btnWidth * emSize;
        const btnHeightPx = btnHeight * emSize;

        const positions = [];
        for (let i = 0; i < num; i++) {
            const x = Math.random() * (windowWidth - btnWidthPx);
            const y = Math.random() * (windowHeight - btnHeightPx);
            positions.push({ top: y, left: x });
        }
        return positions;
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

class Button {
    constructor(id, color, position, clickHandler) {
        this.id = id;
        this.color = color;
        this.top = position.top;
        this.left = position.left;
        this.clickHandler = clickHandler;
        this.pressed = false;
    }

    set position(pos) {
        this.top = pos.top;
        this.left = pos.left;
    }

    render(container, listen) {
        const btn = document.createElement(buttonText);
        btn.className = buttonClassText;
        btn.id = this.id;
        btn.style.backgroundColor = this.color;
        btn.style.left = this.left + pixelText;
        btn.style.top = this.top + pixelText;
        btn.style.position = absolutePositionText;
        if (listen && !this.pressed) {
            btn.addEventListener(clickText, () => {
                this.pressed = true;
                this.clickHandler(this.id)
            });
        } else {
            btn.textContent = this.id;
        }
        container.appendChild(btn);
    }
}

// TODO implement num validator
class ButtonsManager {
    constructor(container) {
        this.container = container;
        this.buttons = [];
    }

    get count() {
        return this.buttons.length;
    }

    createButtons(num, windowWidth, clickHandler) {
        // Get em size in px
        const emSize = parseFloat(getComputedStyle(document.body).fontSize);
        const btnWidthPx = btnWidth * emSize;
        const btnHeightPx = btnHeight * emSize;
        const colors = Utility.getRandomColors(num);
        let x = 0;
        let y = 0;
        for (let i = 1; i <= num; i++) {
            if (x + btnWidthPx > windowWidth) {
                x = 0;
                y += btnHeightPx;
            }
            const position = { top: y, left: x };
            const btn = new Button(i, colors[i - 1], position, clickHandler);
            this.buttons.push(btn);
            x += btnWidthPx;
        }
    }

    async showButtons(pauseTime) {
        this.container.innerHTML = emptyText;
        this.buttons.forEach(btn => btn.render(this.container, false));
        await Utility.sleep(pauseTime * 1000);
        this.container.innerHTML = emptyText;

    }

    renderButtons() {
        this.buttons.forEach(btn => btn.render(this.container, true));
    }

    clearButtons() {
        this.buttons = [];
    }

    randomButtonColors() {
        const colors = Utility.getRandomColors(this.count);
        return colors;
    }

    randomizeButtonLocations(windowWidth, windowHeight) {
        const positions = Utility.getRandomPositions(this.count, btnWidth, btnHeight, windowWidth, windowHeight);
        this.buttons.forEach((btn, index) => {
            btn.position = positions[index];
        });
    }



}

class ButtonGame {

    constructor(container) {
        this.container = container;
        this.buttonsManager = new ButtonsManager(container);
        this.state = menuText;
        this.buttonIndex = 1;
        this.buttonClickHandler = this.buttonClickHandler.bind(this);
    }

    menu() {
        const label = document.createElement(labelText);
        label.setAttribute(attributeForText, attributeNumButtonsText);
        label.textContent = MSG_HOW_MANY_BUTTONS;
        this.container.appendChild(label);

        const input = document.createElement(inputText);
        input.type = numberText;
        input.id = attributeNumButtonsText;
        this.container.appendChild(input);

        const startBtn = document.createElement(buttonText);
        startBtn.textContent = MSG_GO;
        startBtn.addEventListener(clickText, () => {
            const inputValue = document.getElementById(attributeNumButtonsText).value;
            this.startGame(parseInt(inputValue));
        });
        this.container.appendChild(startBtn);
    }

    async startGame(num) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        this.container.innerHTML = emptyText;
        this.buttonsManager.clearButtons();
        this.buttonsManager.createButtons(num, windowWidth, this.buttonClickHandler);
        await this.buttonsManager.showButtons(this.buttonsManager.count);
        for (let i = 0; i < 3; i++) {
            this.buttonsManager.randomizeButtonLocations(windowWidth, windowHeight);
            await this.buttonsManager.showButtons(btnShowTimeSec);
        }
        this.buttonsManager.renderButtons();
    }

    endGame(won) {
        this.buttonIndex = 1;
        this.container.innerHTML = emptyText;
        const msg = document.createElement(elementDivText);
        msg.textContent = won ? MSG_WIN : MSG_LOSE;
        msg.style.fontSize = fontSizeText;
        msg.style.margin = marginText;
        this.container.appendChild(msg);

        const menuBtn = document.createElement(buttonText);
        menuBtn.textContent = MSG_BACK_TO_MENU;
        menuBtn.className = buttonClassText;
        menuBtn.style.display = displayText;
        menuBtn.style.margin = marginAutoText;
        menuBtn.onclick = () => {
            this.container.innerHTML = emptyText;
            this.menu();
        };
        this.container.appendChild(menuBtn);
    }

    buttonClickHandler(buttonId) {
        if (buttonId === this.buttonIndex) {
            this.buttonsManager.renderButtons();
            this.buttonIndex++;
            if (this.buttonIndex > this.buttonsManager.buttons.length) {
                this.endGame(true);
            }
        } else {
            this.endGame(false);
        }
    }
}

window.onload = function () {

    const game = new ButtonGame(document.getElementById(containerIdText));
    game.menu();

}
