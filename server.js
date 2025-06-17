// 카카오톡 Claude AI 챗봇 서버
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 미들웨어 설정
app.use(express.json());
app.use(cors());

// Claude API 설정 (실제 배포 시 추가)
let anthropic;
try {
  const Anthropic = require('@anthropic-ai/sdk');
  anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY
  });
} catch (error) {
  console.log('Claude SDK not available, using mock responses');
}

// 기본 루트
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Kakao Claude Bot Server is running',
    timestamp: new Date().toISOString()
  });
});

// 헬스체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 카카오톡 웹훅 엔드포인트
app.post('/webhook', async (req, res) => {
  try {
    console.log('Received webhook:', JSON.stringify(req.body, null, 2));
    
    const { userRequest } = req.body;
    const userMessage = userRequest?.utterance || '';
    
    console.log('User message:', userMessage);
    
    let responseText;
    
    if (anthropic && process.env.CLAUDE_API_KEY) {
      try {
        // Claude API 호출
        const message = await anthropic.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: userMessage
          }]
        });
        
        responseText = message.content[0].text;
        console.log('Claude response:', responseText);
        
      } catch (claudeError) {
        console.error('Claude API error:', claudeError);
        responseText = '죄송합니다. 현재 AI 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.';
      }
    } else {
      // Claude API가 없을 때 기본 응답
      responseText = `안녕하세요! 메시지를 받았습니다: "${userMessage}"\n\nClaude AI가 곧 연결될 예정입니다. 🤖`;
    }
    
    // 카카오톡 응답 형식
    const response = {
      version: "2.0",
      template: {
        outputs: [{
          simpleText: {
            text: responseText
          }
        }]
      }
    };
    
    console.log('Sending response:', JSON.stringify(response, null, 2));
    res.json(response);
    
  } catch (error) {
    console.error('Webhook error:', error);
    
    // 에러 시 기본 응답
    const errorResponse = {
      version: "2.0",
      template: {
        outputs: [{
          simpleText: {
            text: "죄송합니다. 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
          }
        }]
      }
    };
    
    res.status(200).json(errorResponse);
  }
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Path ${req.originalUrl} not found`,
    availableEndpoints: ['/', '/health', '/webhook']
  });
});

// 에러 핸들러
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: error.message
  });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
});

// 프로세스 종료 처리
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
