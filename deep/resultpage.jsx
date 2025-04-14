// Update ResultPage.tsx
function ResultPage() {
    const { state } = useLocation();
    const [result, setResult] = useState<{narrative?: string, score?: number}>({});
    const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
    const [feedbackText, setFeedbackText] = useState('');
  
    useEffect(() => {
      if (state) {
        setResult(state);
      }
    }, [state]);
  
    const handleFeedbackSubmit = async () => {
      try {
        await fetch('http://localhost:5000/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            feedbackType: feedback,
            feedbackText,
            score: result.score
          })
        });
        setFeedback(null);
        setFeedbackText('');
      } catch (error) {
        console.error('Feedback submission failed:', error);
      }
    };
  
    // Remove positives and negatives arrays
    // Modify JSX to show narrative
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black">
        {/* ... existing container divs ... */}
        
        {/* Score Circle (keep as is) */}
  
        {/* Replace positives/negatives section with: */}
        <div className="space-y-8">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8">
            <h3 className="text-2xl font-semibold text-white mb-4">Risk Analysis</h3>
            <div className="text-blue-200 whitespace-pre-wrap">
              {result.narrative || 'No analysis available'}
            </div>
          </div>
        </div>
  
        {/* Feedback section remains same */}
      </div>
    );
  }