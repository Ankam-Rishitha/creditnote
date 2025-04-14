// Update handleSubmit in HomePage.tsx
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: formData.description })
      });
  
      if (!response.ok) throw new Error('Analysis failed');
      
      const result = await response.json();
      
      navigate('/result', { state: result });
      
    } catch (error) {
      console.error('Submission error:', error);
      // Add error handling UI here
    }
  };
  
  // Keep all design elements same, just remove the unused form fields:
  // Remove these from the formData state and JSX:
  - loanAmount
  - loanTerm
  - reason
  - file