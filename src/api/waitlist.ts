interface WaitlistData {
  email: string;
  name: string;
  profilePicture?: string;
  source: string;
}

export async function saveToWaitlist(data: WaitlistData) {
  // For development, we'll make a direct call to Google Sheets
  // In production, this will go through the Vercel API endpoint
  
  if (import.meta.env.DEV) {
    // Development: Direct Google Sheets API call
    return await saveToGoogleSheetsDirect(data);
  } else {
    // Production: Use Vercel API endpoint
    return await saveToWaitlistAPI(data);
  }
}

async function saveToWaitlistAPI(data: WaitlistData) {
  const response = await fetch('/api/waitlist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to save to waitlist');
  }

  return await response.json();
}

async function saveToGoogleSheetsDirect(data: WaitlistData) {
  // Get current date and time
  const signupDate = new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // For development, save to localStorage and log the data
  // This simulates saving to Google Sheets
  const existingData = JSON.parse(localStorage.getItem('waitlist') || '[]');
  
  // Check for duplicates
  const emailExists = existingData.some((entry: any) => 
    entry.email.toLowerCase() === data.email.toLowerCase()
  );
  
  if (emailExists) {
    throw new Error('Email already exists in waitlist');
  }
  
  const newEntry = {
    ...data,
    signupDate,
    id: Date.now()
  };
  
  existingData.push(newEntry);
  localStorage.setItem('waitlist', JSON.stringify(existingData));
  
  // Log the data in a format similar to what would go to Google Sheets
  console.log('🎉 NEW WAITLIST SIGNUP:');
  console.log('📧 Email:', data.email);
  console.log('👤 Name:', data.name);
  console.log('📅 Signup Date:', signupDate);
  console.log('🏷️ Source:', data.source);
  console.log('🖼️ Profile Picture:', data.profilePicture);
  console.log('💾 Saved to localStorage for development testing');
  console.log('📊 Total waitlist entries:', existingData.length);
  
  // Log in table format for easy copying to Google Sheets
  console.table([{
    Email: data.email,
    Name: data.name,
    'Signup Date': signupDate,
    Source: data.source,
    'Profile Picture': data.profilePicture
  }]);
  
  return {
    success: true,
    message: 'Successfully added to waitlist (development mode)',
    data: newEntry
  };
}