// DB리츠 카카오톡 Claude AI 서버
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Claude API 설정 (실제 배포시 추가)
let anthropic;
try {
    const Anthropic = require('@anthropic-ai/sdk');
    anthropic = new Anthropic({
        apiKey: process.env.CLAUDE_API_KEY
    });
} catch (error) {
    console.log('Claude SDK not available, using mock responses');
}

// 회사 정보
const companyContext = `
당신은 DB리츠의 전문 AI 고객상담 어시스턴트입니다.

회사 정보:
- 회사명: DB리츠
- 사업영역: 부동산 투자 및 리츠(REITs) 운용 전문
- 웹사이트: https://dbritz.kr

주요 서비스:
- 부동산 투자 컨설팅
- 리츠 상품 개발 및 운용  
- 투자 포트폴리오 관리
- 부동산 시장 분석

투자 상품:
- 오피스 리츠: 안정적인 임대수익, 예상 수익률 4-6%
- 상업용 부동산 리츠: 높은 수익성, 예상 수익률 5-8%
- 물류센터 리츠: 성장 가능성, 예상 수익률 6-9%
- 주거용 부동산 리츠: 안정성 중심, 예상 수익률 3-5%

연락처:
- 웹사이트: https://dbritz.kr
- 이메일: info@dbritz.kr  
- 전화: 02-xxxx-xxxx
- 주소: 서울시 강남구

답변 가이드라인:
1. 친근하고 전문적인 톤으로 답변
2. 복잡한 투자 용어는 쉽게 설명  
3. 구체적인 투자 조언보다는 일반적인 정보 제공
4. 상세 상담이 필요한 경우 전문가 연결 안내
5. 한국어로 자연스럽게 답변
6. 답변은 간결하고 명확하게 (200자 내외)
`;
