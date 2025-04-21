import { useState, useRef } from 'react';
import { gsap } from 'gsap';

const Flashcard = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [subject, setSubject] = useState(''); // State to store user subject input
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFetching, setIsFetching] = useState(false); // State to track if API is being called
  const cardRef = useRef(null);
  const cardInnerRef = useRef(null);

  const fetchFlashcardData = async () => {
    if (isFetching || !subject.trim()) return; // Prevent duplicate calls or empty input
    setIsFetching(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: `Please generate a flashcard with a question about the subject "${subject}" and provide the answer. Format it as:
              Question: [Your question here]
              Answer: [The answer here]`,
            },
          ],
        }),
      });

      const data = await response.json();
      console.log('OpenAI API Response:', data);

      // Extract question and answer from API response
      const content = data.choices[0].message.content.split('\n');
      const questionLine = content.find((line: string) =>
        line.toLowerCase().startsWith('question:')
      );
      const answerLine = content.find((line: string) =>
        line.toLowerCase().startsWith('answer:')
      );
      setQuestion(questionLine?.replace(/question:\s*/i, '') || 'No question found.');
      setAnswer(answerLine?.replace(/answer:\s*/i, '') || 'No answer found.');
    } catch (error) {
      console.error('Error fetching data from OpenAI:', error);
    } finally {
      setTimeout(() => setIsFetching(false), 1000); // Throttle API calls with a 1s delay
    }
  };

  // Flip animation using GSAP
  const handleFlip = () => {
    const timeline = gsap.timeline();
    if (!isFlipped) {
      timeline.to(cardInnerRef.current, { duration: 0.6, rotationY: 180 });
    } else {
      timeline.to(cardInnerRef.current, { duration: 0.6, rotationY: 0 });
    }
    setIsFlipped(!isFlipped);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {/* User input for subject */}
      <input
        type="text"
        placeholder="Enter a subject..."
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        style={{
          width: '300px',
          padding: '10px',
          margin: '20px auto',
          borderRadius: '5px',
          border: '1px solid #ccc',
          fontSize: '16px',
        }}
      />
      <button
        onClick={fetchFlashcardData}
        disabled={isFetching || !subject.trim()}
        style={{
          padding: '10px 20px',
          backgroundColor: isFetching || !subject.trim() ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontSize: '16px',
          cursor: isFetching || !subject.trim() ? 'not-allowed' : 'pointer',
        }}
      >
        {isFetching ? 'Fetching...' : 'Generate Flashcard'}
      </button>

      {/* Flashcard */}
      <div
        ref={cardRef}
        onClick={handleFlip}
        style={{
          perspective: '1000px',
          width: '300px',
          height: '200px',
          margin: '20px auto',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {/* Inner card that handles rotation */}
        <div
          ref={cardInnerRef}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s',
          }}
        >
          {/* Front of the card */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              backgroundColor: '#4CAF50',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px',
              padding: '20px',
              transform: 'rotateY(0deg)', // Front
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            {question || 'Click "Generate Flashcard"'}
          </div>

          {/* Back of the card */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              backgroundColor: '#FFC107',
              color: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px',
              padding: '20px',
              transform: 'rotateY(180deg)', // Back
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            {answer || 'Click "Generate Flashcard"'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
