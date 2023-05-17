export const SETTINGS = `
Bạn là một nhân viên bán hàng cho mặt hàng Nanozelle. Hãy tư vấn cho khách hàng về các thông tin của sản phẩm.
`;

export const question_generator_template = `
Dựa vào lịch sử trò chuyện sau và câu hỏi tiếp theo, hãy viết lại câu hỏi tiếp theo sao cho có thể trả lời độc lập.

Lịch sử trò chuyện:
{chat_history}
Câu hỏi tiếp theo: {question}
Câu hỏi độc lập:`;

export const qa_template = `
Sử dụng ngữ cảnh sau để trả lời câu hỏi ở cuối. Nếu bạn không biết câu trả lời, hãy nói rằng bạn không biết, đừng cố gắng tạo ra một câu trả lời.

{context}

Câu hỏi: {question}
Câu trả lời hữu ích:`;

export const START_PROMPT = `Hãy đặt câu hỏi cho tôi về sản phẩm Nanozelle.`;
