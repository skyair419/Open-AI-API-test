import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express()
app.use(cors()) // 프론트 
app.use(express.json()) // 백엔드 

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from CodeX!'
  })
})

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${prompt}`,
      temperature: 0, // 값이 클수록 더 많은 리스크가 발생.
      max_tokens: 3000, // 모델 컨텍스트 최대 길이 
      top_p: 1, // alternative to sampling with temperature, called nucleus sampling
      frequency_penalty: 0.5, // 2.0과 2.0 사이의 숫자. 양수 값은 지금까지 텍스트에서 기존 빈도를 기준으로 새로운 토큰에 불이익을 주어 모델이 동일한 행을 반복할 가능성을 감소시킨다
      presence_penalty: 0, // -2.0에서 2.0 사이의 숫자. 양수 값은 새로운 토큰이 지금까지 텍스트에 나타나는지 여부에 따라 불이익을 주어 모델이 새로운 주제에 대해 이야기할 가능성을 높인다.
    });

    res.status(200).send({
      bot: response.data.choices[0].text
    });

  } catch (error) {
    console.error(error)
    res.status(500).send(error || 'Something went wrong');
  }
})

app.listen(5000, () => console.log('AI server started on http://localhost:5000'))