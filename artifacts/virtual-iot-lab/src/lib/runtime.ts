import type { SerialLine } from './lab-types';

export interface RuntimeState {
  running: boolean;
  ledOn: boolean;
  elapsed: number;
  output: SerialLine[];
  error?: string;
}

export const DEFAULT_CODE = `// Blink Demo · Arduino Uno R3
const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
  Serial.println("Virtual IoT Lab ready");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("LED ON");
  delay(1000);
  digitalWrite(LED_PIN, LOW);
  Serial.println("LED OFF");
  delay(1000);
}`;

const line = (message: string, tone: SerialLine['tone'], elapsed: number): SerialLine => ({
  id: `${elapsed}-${Math.random()}`,
  time: `${(elapsed / 1000).toFixed(3).padStart(7, '0')}s`,
  message,
  tone,
});

export const validateSketch = (code: string): string | undefined => {
  if (!/void\s+setup\s*\(\s*\)/.test(code)) return 'Missing setup() function';
  if (!/void\s+loop\s*\(\s*\)/.test(code)) return 'Missing loop() function';
  if (!/pinMode\s*\(/.test(code)) return 'setup(): add pinMode() before writing a pin';
  if (!/digitalWrite\s*\(/.test(code)) return 'loop(): no digitalWrite() instruction found';
  if (/\b(analogRead|attachInterrupt|#include|Serial\.read)\b/.test(code)) return 'Unsupported instruction in virtual runtime';
  return undefined;
};

export const createInitialRuntime = (): RuntimeState => ({
  running: false,
  ledOn: false,
  elapsed: 0,
  output: [line('Runtime idle · press RUN to execute setup()', 'system', 0)],
});

export const tickRuntime = (code: string, previous: RuntimeState): RuntimeState => {
  const error = validateSketch(code);
  if (error) return { ...previous, running: false, error, output: [...previous.output, line(`ERROR: ${error}`, 'error', previous.elapsed)] };
  const nextElapsed = previous.elapsed + 250;
  const cycle = Math.floor(nextElapsed / 1000) % 2;
  const ledOn = cycle === 0;
  const shouldPrint = nextElapsed % 1000 === 0;
  const output = shouldPrint ? [...previous.output, line(ledOn ? 'LED ON' : 'LED OFF', 'data', nextElapsed)] : previous.output;
  return { ...previous, running: true, ledOn, elapsed: nextElapsed, error: undefined, output };
};

export const resetRuntime = (code: string): RuntimeState => {
  const error = validateSketch(code);
  return { running: false, ledOn: false, elapsed: 0, error, output: [line(error ? `ERROR: ${error}` : 'Runtime reset · setup() pending', error ? 'error' : 'system', 0)] };
};