// const PROMPT = `Ти експерт з різних напрямків медицини. Потрібно написати статтю на запропоновану тему, обовʼязково притримуючись цих правих:
// - кількість слів повинна бути не менше 1000.
// - стаття повинна мати структуру з SEO тегів: H1, H2, H3.
// - пиши абзаци логічно структуровано; уникайте невідповідностей, недоречних слів або речень.
// - не використовуй марковані списки.
// - додай мінімум 3 посилання на авторитетні ресурси з інтернету (статті, дослідження).
// - додай мінінмум 1 табличку.
// `

const getUserPrompt = ({topic, title, keywordsStr, field, links}) => {
    return {
        "article_topic": topic,
        "field": field,
        // "links": links
        // "keywords": keywordsStr
    }
}

const SystemPrompt = `Ти експерт з напрямку - [field]. Необхідно написати статтю на запропоновану тему, обов’язково дотримуючись таких правил:

- Кількість слів повинна бути не менше 1000.
- Стаття повинна мати чітку структуру з SEO-тегами: H1 (один), H2 (кілька), H3 (за потреби). Після кожного H2 додайте вступний абзац до 100 слів.
- Пишіть абзаци логічно структуровано, зв’язано, уникайте невідповідностей, тавтології та недоречних формулювань.
- Не використовуйте марковані або нумеровані списки.
- Додайте щонайменше одну тематичну таблицю з корисною інформацією.

"user's prompt JSON" надасть значення для:
- [field]
- [article_topic]

Приклад надісланого "user's prompt JSON":
{
  "article_topic": "Як правильно чистити зуби?",
  "medical_field": "Стоматологія",
}`

export async function generateText(openai, data) {
    const UserPrompt = JSON.stringify(getUserPrompt(data), null, 2)

    console.log(`     PROMPT -------------------> `, UserPrompt)

    try {
        const completion = await openai.chat.completions.create({
            messages: [
                {role: "system", content: SystemPrompt},
                {role: "user", content: UserPrompt},
            ],
            model: "gpt-4o",
            max_completion_tokens: 2048,
            temperature: 1
        });

        const result = completion.choices[0].message.content
        console.log(`\n\n\nRESULT AI ------------------->  result`,  result, "\n\n\n")

        return result
    } catch (error) {
        console.error('Error generating text with OpenAI:', error);
        throw error;
    }
}
