import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // 텍스트 내용 업데이트
        element.textContent += '.';

        // 세개의 점으로 표시
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

// 봇이 한글짜씩 글을 써내려가는 메서드 
function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 20)
}

// 봇의 각 메시지 div에 대해 고유 ID를 생성합니다
// 특정 응답에 대한 텍스트 효과를 입력하는 데 필요합니다
// 고유 ID가 없으면 텍스트 입력이 모든 요소에서 작동합니다
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

// 봇과 유저사이  채팅 구분 
function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

// 유저 채팅 전송 
const handleSubmit = async (e) => {
    e.preventDefault()

    const data = new FormData(form)

    // 유저 채팅
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'));
    form.reset();

    // 봇 채팅
    const uniqueId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

    // 스크롤의 초점을 아래로 맞
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueId);

    // messageDiv.innerHTML = "..."
    loader(messageDiv);

    const response = await fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt')
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " ";

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim() // 공백 자름 

        typeText(messageDiv, parsedData)
    } else {
        const err = await response.text();

        messageDiv.innerHTML = "Something went wrong"
        alert(err);
    }
}

// 엔터 또는 전송 버튼 누를시 이벤트
form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        handleSubmit(e);
    }
});