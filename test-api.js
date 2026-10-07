async function testAPI() {
  const combos = [
    ['aspirin', 'warfarin'], 
    ['paracetamol', 'vitamin c'], 
    ['atorvastatin', 'grapefruit juice'] 
  ];

  for (const combo of combos) {
    const res = await fetch('http://localhost:3000/api/interactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicines: combo })
    });
    const data = await res.json();
    console.log('Combo:', combo);
    console.log('Drug Interactions:', data.drugInteractions.length);
    console.log('Food Interactions:', data.foodInteractions.length);
    console.log('Highest Severity:', data.highestSeverity);
    console.log('---');
  }
}
testAPI();
