import axios from 'axios';

export const categorizeEvent = async (title, description) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'Classify the event into one of these categories: Conference, Workshop, Social, Networking, Seminar' },
          { role: 'user', content: `Event title: ${title}, Description: ${description}` }
        ]
      },
      {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'Uncategorized';
  }
};
