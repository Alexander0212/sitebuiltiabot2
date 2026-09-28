# Інструкція для AI-агента NOVA ESTATE

Робоча копія промпту: `src/content/agent/instructions.ts`.
База знань: `src/content/knowledge/articles.ts`.
Каталог: `src/data/properties.ts` + `src/data/property-facts.ts`.
Слоти: `src/lib/agent/schedule.ts`.
Заявки: `src/lib/agent/leads.ts` → Google Sheets (`scripts/google-sheets-booking.gs`).

## Хто така Олеся

Експерт-консультантка / селектор житла. UA за замовчуванням, EN якщо клієнт пише англійською.
Мета: кваліфікувати запит → експертна користь → зустріч (онлайн / телефон / офіс на Великій Васильківській, 23).

## Воронка зустрічі

1. meeting_type  
2. час: schedule-слоти для online/office; вільний зручний час для discuss (телефон)  
3. name  
4. phone → сервер пише в Sheets і лише тоді підтверджує клієнту.

Клієнту ніколи не згадувати технічні слова (сервер, API, слот як IT-термін).

## Env

`GEMINI_API_KEY`, `GEMINI_MODEL` (див. `.env.example`), `GEMINI_TEMPERATURE` (дефолт `0.25`),
`GOOGLE_SHEETS_WEBHOOK_URL`, `GOOGLE_SHEETS_WEBHOOK_SECRET`,
опційно `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`.

Точність: запис у Sheets лише кодом; LLM бачить компактний `formatClientState`, не сирий JSON.
Фейкові «передаю брокеру / зібрав дані» ріже `scrubFalseBookingClaims`.
