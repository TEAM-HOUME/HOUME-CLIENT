import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';

function isInteractiveTerminal() {
  return Boolean(process.stdin.isTTY);
}

export function createPromptInterface(stage) {
  if (isInteractiveTerminal()) {
    return {
      rl: createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
      }),
      dispose() {},
      source: 'stdin/stdout',
    };
  }
  if (process.platform !== 'win32' && existsSync('/dev/tty')) {
    const inputStream = createReadStream('/dev/tty');
    const outputStream = createWriteStream('/dev/tty');
    return {
      rl: createInterface({
        input: inputStream,
        output: outputStream,
        terminal: true,
      }),
      dispose() {
        inputStream.destroy();
        outputStream.destroy();
      },
      source: '/dev/tty',
    };
  }
  console.log(
    `[ui-components] [${stage}] 입력 채널이 비대화형입니다. 인터랙티브 터미널에서 실행해 주세요`
  );
  return null;
}

export async function askLine(rl, question) {
  return rl.question(question);
}

export async function askYesNo(rl, question, defaultValue = false) {
  while (true) {
    const answer = String((await askLine(rl, question)) ?? '').trim();
    if (!answer) {
      return defaultValue;
    }
    const lower = answer.toLowerCase();
    if (lower === 'y' || lower === 'yes') {
      return true;
    }
    if (lower === 'n' || lower === 'no') {
      return false;
    }
    console.log('입력 형식 오류: y 또는 n으로 입력해 주세요');
  }
}

export function printStageHeader(stage, title) {
  console.log(`[ui-components] [${stage}] ${title}`);
}

export function printStageOptions(options) {
  if (!Array.isArray(options) || options.length === 0) {
    return;
  }
  const content = options.map((option) => `  - ${option}`).join('\n');
  console.log(content);
}

export async function askOptionalPositiveIntegerCompact(rl, label, hint) {
  const prompt = `  - ${label} (선택${hint ? `, ${hint}` : ''}): `;
  while (true) {
    const answer = String((await askLine(rl, prompt)) ?? '').trim();
    if (!answer) {
      return '';
    }
    const numeric = Number(answer);
    if (Number.isInteger(numeric) && numeric > 0) {
      return String(numeric);
    }
    console.log(
      '[ui-components] 입력 형식 오류: 1 이상의 정수로 입력해 주세요'
    );
  }
}
