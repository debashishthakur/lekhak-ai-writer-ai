import { google } from 'googleapis';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, name, profilePicture, source } = req.body;

    // Validate required fields
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    // Set up Google Sheets authentication
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

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

    // Prepare data to append to the sheet
    const values = [
      [
        email,
        name,
        signupDate,
        source || 'waitlist_signup',
        profilePicture || ''
      ]
    ];

    // Check if email already exists
    const existingData = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'A:A', // Check column A (emails)
    });

    const existingEmails = existingData.data.values || [];
    const emailExists = existingEmails.some(row => row[0]?.toLowerCase() === email.toLowerCase());

    if (emailExists) {
      return res.status(409).json({ 
        error: 'Email already exists in waitlist',
        message: 'This email is already registered for the waitlist.' 
      });
    }

    // Append data to the sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'A:E', // Columns A through E
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    console.log('Successfully added to waitlist:', { email, name, signupDate });

    return res.status(200).json({
      success: true,
      message: 'Successfully added to waitlist',
      data: {
        email,
        name,
        signupDate,
        rowsAdded: response.data.updates.updatedRows
      }
    });

  } catch (error) {
    console.error('Error adding to waitlist:', error);
    
    // Handle specific Google API errors
    if (error.code === 403) {
      return res.status(500).json({
        error: 'Google Sheets access denied',
        message: 'Please check that the service account has access to the spreadsheet'
      });
    }
    
    if (error.code === 404) {
      return res.status(500).json({
        error: 'Spreadsheet not found',
        message: 'Please check the GOOGLE_SHEET_ID environment variable'
      });
    }

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to add to waitlist. Please try again later.'
    });
  }
}