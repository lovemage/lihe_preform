import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// Simple CAPTCHA generator
function generateMathCaptcha(locale: string = "en") {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operations = ['+', '-'];
  const operation = operations[Math.floor(Math.random() * operations.length)];

  let answer: number;
  let question: string;

  if (operation === '+') {
    answer = num1 + num2;
    question = locale === 'ru'
      ? `Сколько будет ${num1} плюс ${num2}?`
      : locale === 'es'
      ? `¿Cuánto es ${num1} más ${num2}?`
      : `What is ${num1} plus ${num2}?`;
  } else {
    answer = num1 - num2;
    question = locale === 'ru'
      ? `Сколько будет ${num1} минус ${num2}?`
      : locale === 'es'
      ? `¿Cuánto es ${num1} menos ${num2}?`
      : `What is ${num1} minus ${num2}?`;
  }

  // Create a simple token by encoding the answer with timestamp
  const timestamp = Date.now();
  const token = Buffer.from(`${answer}:${timestamp}`).toString('base64');

  return { question, token };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'en';

  const captcha = generateMathCaptcha(locale);

  return NextResponse.json(captcha);
}
